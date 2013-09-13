var GSSolver = require('../solver/GSSolver').GSSolver,
    NaiveBroadphase = require('../collision/NaiveBroadphase').NaiveBroadphase,
    vec2 = require('../math/vec2'),
    Circle = require('../objects/Shape').Circle,
    Line = require('../objects/Shape').Line,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    EventEmitter = require('../events/EventEmitter').EventEmitter,
    Body = require('../objects/Body').Body,
    DistanceConstraint = require('../constraints/DistanceConstraint').DistanceConstraint,
    PointToPointConstraint = require('../constraints/PointToPointConstraint').PointToPointConstraint,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase;

exports.World = World;

function now(){
    if(performance.now)
        return performance.now();
    else if(performance.webkitNow)
        return performance.webkitNow();
    else
        return new Date().getTime();
}

/**
 * The dynamics world, where all bodies and constraints lives.
 *
 * @class World
 * @constructor
 * @param {Object}          [options]
 * @param {Solver}          options.solver Defaults to GSSolver.
 * @param {Float32Array}    options.gravity Defaults to [0,-9.78]
 * @param {Broadphase}      options.broadphase Defaults to NaiveBroadphase
 * @extends {EventEmitter}
 */
function World(options){
    EventEmitter.apply(this);

    options = options || {};

    /**
     * All springs in the world.
     *
     * @property springs
     * @type {Array}
     */
    this.springs = [];

    /**
     * All bodies in the world.
     *
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];

    /**
     * The solver used to satisfy constraints and contacts.
     *
     * @property solver
     * @type {Solver}
     */
    this.solver = options.solver || new GSSolver();

    /**
     * The contacts in the world that were generated during the last step().
     *
     * @property contacts
     * @type {Array}
     */
    this.contacts = [];
    this.oldContacts = [];

    this.frictionEquations = [];
    this.oldFrictionEquations = [];

    /**
     * Gravity in the world. This is applied on all bodies in the beginning of each step().
     *
     * @property
     * @type {Float32Array}
     */
    this.gravity = options.gravity || vec2.fromValues(0, -9.78);

    /**
     * Whether to do timing measurements during the step() or not.
     *
     * @property doPofiling
     * @type {Boolean}
     */
    this.doProfiling = options.doProfiling || false;

    /**
     * How many millisecconds the last step() took. This is updated each step if .doProfiling is set to true.
     *
     * @property lastStepTime
     * @type {Number}
     */
    this.lastStepTime = 0.0;

    /**
     * The broadphase algorithm to use.
     *
     * @property broadphase
     * @type {Broadphase}
     */
    this.broadphase = options.broadphase || new NaiveBroadphase();

    /**
     * User-added constraints.
     *
     * @property constraints
     * @type {Array}
     */
    this.constraints = [];

    // Id counters
    this._constraintIdCounter = 0;
    this._bodyIdCounter = 0;

    // Event objects that are reused
    this.postStepEvent = {
        type : "postStep",
    };
    this.addBodyEvent = {
        type : "addBody",
        body : null
    };
    this.addSpringEvent = {
        type : "addSpring",
        body : null
    };
};
World.prototype = new Object(EventEmitter.prototype);

/**
 * Add a constraint to the simulation.
 *
 * @method addConstraint
 * @param {Constraint} c
 */
World.prototype.addConstraint = function(c){
    this.constraints.push(c);
    c.id = this._constraintIdCounter++;
};

/**
 * Removes a constraint
 *
 * @method removeConstraint
 * @param {Constraint} c
 */
World.prototype.removeConstraint = function(c){
    var idx = this.constraints.indexOf(c);
    if(idx!==-1){
        this.constraints.splice(idx,1);
    }
};

var step_r = vec2.create();
var step_runit = vec2.create();
var step_u = vec2.create();
var step_f = vec2.create();
var step_fhMinv = vec2.create();
var step_velodt = vec2.create();

/**
 * Step the physics world forward in time.
 *
 * @method step
 * @param {Number} dt The time step size to use.
 * @param {Function} callback Called when done.
 */
World.prototype.step = function(dt){
    var that = this,
        doProfiling = this.doProfiling,
        Nsprings = this.springs.length,
        springs = this.springs,
        bodies = this.bodies,
        g = this.gravity,
        solver = this.solver,
        Nbodies = this.bodies.length,
        broadphase = this.broadphase,
        constraints = this.constraints,
        t0, t1;

    if(doProfiling){
        t0 = now();
    }

    // add gravity to bodies
    for(var i=0; i!==Nbodies; i++){
        var fi = bodies[i].force;
        vec2.add(fi,fi,g);
    }

    // Calculate all new spring forces
    for(var i=0; i!==Nsprings; i++){
        var s = springs[i];
        var k = s.stiffness;
        var d = s.damping;
        var l = s.restLength;
        var bodyA = s.bodyA;
        var bodyB = s.bodyB;
        var r = step_r;
        var r_unit = step_runit;
        var u = step_u;
        var f = step_f;

        vec2.sub(r,bodyA.position,bodyB.position);
        vec2.sub(u,bodyA.velocity,bodyB.velocity);
        var rlen = vec2.len(r);
        vec2.normalize(r_unit,r);
        vec2.scale(f, r_unit, k*(rlen-l) + d*vec2.dot(u,r_unit));
        vec2.sub( bodyA.force,bodyA.force, f);
        vec2.add( bodyB.force,bodyB.force, f);
    }

    // Broadphase
    var result = broadphase.getCollisionPairs(this);

    // Nearphase
    var oldContacts = this.contacts.concat(this.oldContacts);
    var oldFrictionEquations = this.frictionEquations.concat(this.oldFrictionEquations);
    var contacts = this.contacts = [];
    var frictionEquations = this.frictionEquations = [];
    var glen = vec2.length(this.gravity);
    for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
        var bi = result[i],
            bj = result[i+1],
            si = bi.shape,
            sj = bj.shape;

        var reducedMass = (bi.invMass + bj.invMass);
        if(reducedMass > 0)
            reducedMass = 1/reducedMass;

        var mu = 0.1; // Todo: Should be looked up in a material table
        var mug = mu * glen * reducedMass;
        var doFriction = mu>0;

        if(si instanceof Circle){
                 if(sj instanceof Circle)   bp.nearphaseCircleCircle  (bi,bj,contacts,oldContacts,doFriction,frictionEquations,oldFrictionEquations,mug);
            else if(sj instanceof Particle) bp.nearphaseCircleParticle(bi,bj,contacts,oldContacts);
            else if(sj instanceof Plane)    bp.nearphaseCirclePlane   (bi,bj,contacts,oldContacts,doFriction,frictionEquations,oldFrictionEquations,mug);

        } else if(si instanceof Particle){
                 if(sj instanceof Circle)   bp.nearphaseCircleParticle(bj,bi,contacts,oldContacts);
            else if(sj instanceof Plane)    bp.nearphaseParticlePlane (bi,bj,contacts,oldContacts);

        } else if(si instanceof Plane){
                 if(sj instanceof Circle)   bp.nearphaseCirclePlane   (bj,bi,contacts,oldContacts,doFriction,frictionEquations,oldFrictionEquations,mug);
            else if(sj instanceof Particle) bp.nearphaseParticlePlane (bj,bi,contacts,oldContacts);
        }
    }
    this.oldContacts = oldContacts;
    this.oldFrictionEquations = oldFrictionEquations;

    // Add contact equations to solver
    for(var i=0, Ncontacts=contacts.length; i!==Ncontacts; i++){
        solver.addEquation(contacts[i]);
    }
    for(var i=0, Nfriction=frictionEquations.length; i!==Nfriction; i++){
        solver.addEquation(frictionEquations[i]);
    }

    // Add user-defined constraint equations
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        var c = constraints[i];
        c.update();
        for(var j=0, Neq=c.equations.length; j!==Neq; j++){
            var eq = c.equations[j];
            solver.addEquation(eq);
        }
    }
    solver.solve(dt,this);

    solver.removeAllEquations();

    // Step forward
    var fhMinv = step_fhMinv;
    var velodt = step_velodt;
    for(var i=0; i!==Nbodies; i++){
        var body = bodies[i];
        if(body.mass>0){
            var minv = 1.0 / body.mass,
                f = body.force,
                pos = body.position,
                velo = body.velocity;

            // Angular step
            body.angularVelocity += body.angularForce * body.invInertia * dt;
            body.angle += body.angularVelocity * dt;

            // Linear step
            vec2.scale(fhMinv,f,dt*minv);
            vec2.add(velo,fhMinv,velo);
            vec2.scale(velodt,velo,dt);
            vec2.add(pos,pos,velodt);
        }
    }

    // Reset force
    for(var i=0; i!==Nbodies; i++){
        var bi = bodies[i];
        vec2.set(bi.force,0.0,0.0);
        bi.angularForce = 0.0;
    }

    if(doProfiling){
        t1 = now();
        that.lastStepTime = t1-t0;
    }

    this.emit(this.postStepEvent);
};

/**
 * Add a spring to the simulation
 *
 * @method addSpring
 * @param {Spring} s
 */
World.prototype.addSpring = function(s){
    this.springs.push(s);
    this.addSpringEvent.spring = s;
    this.emit(this.addSpringEvent);
};

/**
 * Remove a spring
 *
 * @method removeSpring
 * @param {Spring} s
 */
World.prototype.removeSpring = function(s){
    var idx = this.springs.indexOf(s);
    if(idx===-1)
        this.springs.splice(idx,1);
};

/**
 * Add a body to the simulation
 *
 * @method addBody
 * @param {Body} body
 */
World.prototype.addBody = function(body){
    this.bodies.push(body);
    this.addBodyEvent.body = body;
    this.emit(this.addBodyEvent);
};

/**
 * Remove a body from the simulation
 *
 * @method removeBody
 * @param {Body} body
 */
World.prototype.removeBody = function(body){
    var idx = this.bodies.indexOf(body);
    if(idx!==-1)
        this.bodies.splice(idx,1);
};

/**
 * Convert the world to a JSON-serializable Object.
 *
 * @method toJSON
 * @return {Object}
 */
World.prototype.toJSON = function(){
    var json = {
        p2 : "0.1.0",
        bodies : [],
        springs : [],
        solver : {},
        gravity : v2a(this.gravity),
        broadphase : {},
        constraints : [],
    };

    // Serialize springs
    for(var i=0; i<this.springs.length; i++){
        var s = this.springs[i];
        json.springs.push({
            bodyA : this.bodies.indexOf(s.bodyA),
            bodyB : this.bodies.indexOf(s.bodyB),
            stiffness : s.stiffness,
            damping : s.damping,
            restLength : s.restLength,
        });
    }

    // Serialize constraints
    for(var i=0; i<this.constraints.length; i++){
        var c = this.constraints[i];
        var jc = {
            bodyA : this.bodies.indexOf(c.bodyA),
            bodyB : this.bodies.indexOf(c.bodyB),
        }
        if(c instanceof DistanceConstraint){
            jc.type = "DistanceConstraint";
            jc.distance = c.distance;
        } else if(c instanceof PointToPointConstraint){
            jc.type = "PointToPointConstraint";
            jc.pivotA = v2a(c.pivotA);
            jc.pivotB = v2a(c.pivotB);
            jc.maxForce = c.maxForce;
        } else
            throw new Error("Constraint not supported yet!");

        json.constraints.push(jc);
    }

    // Serialize bodies
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i],
            s = b.shape,
            jsonShape = null;
        if(!s){
            // No shape
        } else if(s instanceof Circle){
            jsonShape = {
                type : "Circle",
                radius : s.radius,
            };
        } else if(s instanceof Plane){
            jsonShape = {
                type : "Plane",
            };
        } else if(s instanceof Particle){
            jsonShape = {
                type : "Particle",
            };
        } else if(s instanceof Line){
            jsonShape = {
                type : "Line",
                length : s.length
            };
        } else {
            throw new Error("Shape type not supported yet!");
        }
        json.bodies.push({
            mass : b.mass,
            angle : b.angle,
            position : v2a(b.position),
            velocity : v2a(b.velocity),
            angularVelocity : b.angularVelocity,
            force : v2a(b.force),
            shape : jsonShape,
        });
    }
    return json;

    function v2a(v){
        return [v[0],v[1]];
    }
};

/**
 * Load a scene from a serialized state.
 *
 * @method fromJSON
 * @param  {Object} json
 * @return {Boolean} True on success, else false.
 */
World.prototype.fromJSON = function(json){
    this.clear();

    if(!json.p2)
        return false;

    switch(json.p2){

        case "0.1.0":

            // Set gravity
            vec2.copy(world.gravity, json.gravity);

            // Load bodies
            for(var i=0; i<json.bodies.length; i++){
                var jb = json.bodies[i],
                    js = jb.shape,
                    shape = null;
                if(js){
                    switch(js.type){
                        case "Circle":
                            shape = new Circle(js.radius);
                            break;
                        case "Plane":
                            shape = new Plane();
                            break;
                        case "Particle":
                            shape = new Particle();
                            break;
                        case "Line":
                            shape = new Line(js.length);
                            break;
                        default:
                            throw new Error("Shape type not supported: "+js.type);
                            break;
                    }
                }
                var b = new Body({
                    mass :              jb.mass,
                    position :          jb.position,
                    angle :             jb.angle,
                    velocity :          jb.velocity,
                    angularVelocity :   jb.angularVelocity,
                    force :             jb.force,
                    shape :             shape,
                });
                this.addBody(b);
            }

            // Load springs
            for(var i=0; i<json.springs.length; i++){
                var js = json.springs[i];
                var s = new Spring(this.bodies[js.bodyA], this.bodies[js.bodyB], {
                    stiffness : js.stiffness,
                    damping : js.damping,
                    restLength : js.restLength,
                });
                this.addSpring(s);
            }

            // Load constraints
            for(var i=0; i<json.constraints.length; i++){
                var jc = json.constraints[i],
                    c;
                switch(jc.type){
                    case "DistanceConstraint":
                        c = new DistanceConstraint(this.bodies[jc.bodyA], this.bodies[jc.bodyB], jc.distance);
                        break;
                    case "PointToPointConstraint":
                        c = new PointToPointConstraint(this.bodies[jc.bodyA], jc.pivotA, this.bodies[jc.bodyB], jc.pivotB, jc.maxForce);
                        break;
                    default:
                        throw new Error("Constraint type not recognized: "+jc.type);
                }
                this.addConstraint(c);
            }

            break;

        default:
            return false;
            break;
    }

    return true;
};

/**
 * Resets the World, removes all bodies, constraints and springs.
 *
 * @method clear
 */
World.prototype.clear = function(){

    // Remove all constraints
    var cs = this.constraints;
    for(var i=cs.length-1; i>=0; i--){
        this.removeConstraint(cs[i]);
    }

    // Remove all bodies
    var bodies = this.bodies;
    for(var i=bodies.length-1; i>=0; i--){
        this.removeBody(bodies[i]);
    }

    // Remove all springs
    var springs = this.springs;
    for(var i=springs.length-1; i>=0; i--){
        this.removeSpring(springs[i]);
    }
};
