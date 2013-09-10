var GSSolver = require('../solver/GSSolver').GSSolver,
    NaiveBroadphase = require('../collision/NaiveBroadphase').NaiveBroadphase,
    glMatrix = require('gl-matrix'),
    vec2 = glMatrix.vec2,
    Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    EventEmitter = require('../events/EventEmitter').EventEmitter,
    Body = require('../objects/Body').Body,
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
    this.collidingBodies = [];

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
        collidingBodies=this.collidingBodies,
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
    var contacts = this.contacts = [];
    for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
        var bi = result[i];
        var bj = result[i+1];
        var si = bi.shape;
        var sj = bj.shape;
        if(si instanceof Circle){
                 if(sj instanceof Circle)   bp.nearphaseCircleCircle  (bi,bj,contacts,oldContacts);
            else if(sj instanceof Particle) bp.nearphaseCircleParticle(bi,bj,contacts,oldContacts);
            else if(sj instanceof Plane)    bp.nearphaseCirclePlane   (bi,bj,contacts,oldContacts);
        } else if(si instanceof Particle){
                 if(sj instanceof Circle)   bp.nearphaseCircleParticle(bj,bi,contacts,oldContacts);
        } else if(si instanceof Plane){
                 if(sj instanceof Circle)   bp.nearphaseCirclePlane   (bj,bi,contacts,oldContacts);
        }
    }
    this.oldContacts = oldContacts;

    // Add equations to solver
    for(var i=0, Ncontacts=contacts.length; i!==Ncontacts; i++){
        solver.addEquation(contacts[i]);
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
    this.collidingBodies.push(body);
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
    if(idx===-1)
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
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i];
        json.bodies.push({
            mass : b.mass,
            angle : b.angle,
            position : v2a(b.position),
            velocity : v2a(b.velocity),
            angularVelocity : b.angularVelocity,
            force : v2a(b.force),
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
        for(var i=0; i<json.bodies.length; i++){
            var jb = json.bodies[i];
            var b = new Body({
                mass :              jb.mass,
                position :          jb.position,
                angle :             jb.angle,
                velocity :          jb.velocity,
                angularVelocity :   jb.angularVelocity,
                force :             jb.force,
            });
            this.addBody(b);
        }
        break;

    default:
        return false;
        break;
    }

    return true;
};

/**
 * Resets the World, removes all bodies and constraints.
 *
 * @method clear
 */
World.prototype.clear = function(){

    // Remove all constraints
    var cs = this.constraints;
    for(var i=0; i<cs.length; i++)
        this.removeConstraint(cs[i]);

    // Remove all bodies
    var bodies = this.bodies;
    for(var i=0; i<bodies.length; i++)
        this.removeBody(bodies[i]);

    // Remove all springs
    var springs = this.springs;
    for(var i=0; i<springs.length; i++)
        this.removeSpring(springs[i]);

};
