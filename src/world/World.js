var  GSSolver = require('../solver/GSSolver')
,    Solver = require('../solver/Solver')
,    NaiveBroadphase = require('../collision/NaiveBroadphase')
,    vec2 = require('../math/vec2')
,    Circle = require('../shapes/Circle')
,    Rectangle = require('../shapes/Rectangle')
,    Convex = require('../shapes/Convex')
,    Line = require('../shapes/Line')
,    Plane = require('../shapes/Plane')
,    Capsule = require('../shapes/Capsule')
,    Particle = require('../shapes/Particle')
,    EventEmitter = require('../events/EventEmitter')
,    Body = require('../objects/Body')
,    Shape = require('../shapes/Shape')
,    Spring = require('../objects/Spring')
,    Material = require('../material/Material')
,    ContactMaterial = require('../material/ContactMaterial')
,    DistanceConstraint = require('../constraints/DistanceConstraint')
,    Constraint = require('../constraints/Constraint')
,    LockConstraint = require('../constraints/LockConstraint')
,    RevoluteConstraint = require('../constraints/RevoluteConstraint')
,    PrismaticConstraint = require('../constraints/PrismaticConstraint')
,    GearConstraint = require('../constraints/GearConstraint')
,    pkg = require('../../package.json')
,    Broadphase = require('../collision/Broadphase')
,    SAPBroadphase = require('../collision/SAPBroadphase')
,    Narrowphase = require('../collision/Narrowphase')
,    Utils = require('../utils/Utils')
,    IslandManager = require('./IslandManager')

module.exports = World;

if(typeof performance === 'undefined'){
    performance = {};
}
if(!performance.now){
    var nowOffset = Date.now();
    if (performance.timing && performance.timing.navigationStart){
        nowOffset = performance.timing.navigationStart;
    }
    performance.now = function(){
        return Date.now() - nowOffset;
    };
}

/**
 * The dynamics world, where all bodies and constraints lives.
 *
 * @class World
 * @constructor
 * @param {Object}          [options]
 * @param {Solver}          options.solver          Defaults to GSSolver.
 * @param {Array}           options.gravity         Defaults to [0,-9.78]
 * @param {Broadphase}      options.broadphase      Defaults to NaiveBroadphase
 * @param {Boolean}         options.islandSplit
 * @param {Boolean}         options.doProfiling
 * @extends EventEmitter
 */
function World(options){
    EventEmitter.apply(this);

    options = options || {};

    /**
     * All springs in the world. To add a spring to the world, use {{#crossLink "World/addSpring:method"}}{{/crossLink}}.
     *
     * @property springs
     * @type {Array}
     */
    this.springs = [];

    /**
     * All bodies in the world. To add a body to the world, use {{#crossLink "World/addBody:method"}}{{/crossLink}}.
     * @property {Array} bodies
     */
    this.bodies = [];

    /**
     * Disabled body collision pairs. See {{#crossLink "World/disableBodyCollision:method"}}.
     * @private
     * @property {Array} disabledBodyCollisionPairs
     */
    this.disabledBodyCollisionPairs = [];

    /**
     * The solver used to satisfy constraints and contacts. Default is {{#crossLink "GSSolver"}}{{/crossLink}}.
     * @property {Solver} solver
     */
    this.solver = options.solver || new GSSolver();

    /**
     * The narrowphase to use to generate contacts.
     *
     * @property narrowphase
     * @type {Narrowphase}
     */
    this.narrowphase = new Narrowphase(this);

    /**
     * The island manager of this world.
     * @property {IslandManager} islandManager
     */
    this.islandManager = new IslandManager();

    /**
     * Gravity in the world. This is applied on all bodies in the beginning of each step().
     *
     * @property gravity
     * @type {Array}
     */
    this.gravity = options.gravity || vec2.fromValues(0, -9.78);

    /**
     * Gravity to use when approximating the friction max force (mu*mass*gravity).
     * @property {Number} frictionGravity
     */
    this.frictionGravity = vec2.length(this.gravity) || 10;

    /**
     * Set to true if you want .frictionGravity to be automatically set to the length of .gravity.
     * @property {Boolean} useWorldGravityAsFrictionGravity
     */
    this.useWorldGravityAsFrictionGravity = true;

    /**
     * If the length of .gravity is zero, and .useWorldGravityAsFrictionGravity=true, then switch to using .frictionGravity for friction instead. This fallback is useful for gravityless games.
     * @property {Boolean} useFrictionGravityOnZeroGravity
     */
    this.useFrictionGravityOnZeroGravity = true;

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
    this.broadphase.setWorld(this);

    /**
     * User-added constraints.
     *
     * @property constraints
     * @type {Array}
     */
    this.constraints = [];

    /**
     * Dummy default material in the world, used in .defaultContactMaterial
     * @property {Material} defaultMaterial
     */
    this.defaultMaterial = new Material();

    /**
     * The default contact material to use, if no contact material was set for the colliding materials.
     * @property {ContactMaterial} defaultContactMaterial
     */
    this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial,this.defaultMaterial);

    /**
     * For keeping track of what time step size we used last step
     * @property lastTimeStep
     * @type {Number}
     */
    this.lastTimeStep = 1/60;

    /**
     * Enable to automatically apply spring forces each step.
     * @property applySpringForces
     * @type {Boolean}
     */
    this.applySpringForces = true;

    /**
     * Enable to automatically apply body damping each step.
     * @property applyDamping
     * @type {Boolean}
     */
    this.applyDamping = true;

    /**
     * Enable to automatically apply gravity each step.
     * @property applyGravity
     * @type {Boolean}
     */
    this.applyGravity = true;

    /**
     * Enable/disable constraint solving in each step.
     * @property solveConstraints
     * @type {Boolean}
     */
    this.solveConstraints = true;

    /**
     * The ContactMaterials added to the World.
     * @property contactMaterials
     * @type {Array}
     */
    this.contactMaterials = [];

    /**
     * World time.
     * @property time
     * @type {Number}
     */
    this.time = 0.0;

    /**
     * Is true during the step().
     * @property {Boolean} stepping
     */
    this.stepping = false;

    /**
     * Bodies that are scheduled to be removed at the end of the step.
     * @property {Array} bodiesToBeRemoved
     * @private
     */
    this.bodiesToBeRemoved = [];

    this.fixedStepTime = 0.0;

    /**
     * Whether to enable island splitting. Island splitting can be an advantage for many things, including solver performance. See {{#crossLink "IslandManager"}}{{/crossLink}}.
     * @property {Boolean} islandSplit
     */
    this.islandSplit = typeof(options.islandSplit)!=="undefined" ? !!options.islandSplit : false;

    /**
     * Set to true if you want to the world to emit the "impact" event. Turning this off could improve performance.
     * @property emitImpactEvent
     * @type {Boolean}
     */
    this.emitImpactEvent = true;

    // Id counters
    this._constraintIdCounter = 0;
    this._bodyIdCounter = 0;

    /**
     * Fired after the step().
     * @event postStep
     */
    this.postStepEvent = {
        type : "postStep",
    };

    /**
     * Fired when a body is added to the world.
     * @event addBody
     * @param {Body} body
     */
    this.addBodyEvent = {
        type : "addBody",
        body : null
    };

    /**
     * Fired when a body is removed from the world.
     * @event removeBody
     * @param {Body} body
     */
    this.removeBodyEvent = {
        type : "removeBody",
        body : null
    };

    /**
     * Fired when a spring is added to the world.
     * @event addSpring
     * @param {Spring} spring
     */
    this.addSpringEvent = {
        type : "addSpring",
        spring : null,
    };

    /**
     * Fired when a first contact is created between two bodies. This event is fired after the step has been done.
     * @event impact
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    this.impactEvent = {
        type: "impact",
        bodyA : null,
        bodyB : null,
        shapeA : null,
        shapeB : null,
        contactEquation : null,
    };

    /**
     * Fired after the Broadphase has collected collision pairs in the world.
     * Inside the event handler, you can modify the pairs array as you like, to
     * prevent collisions between objects that you don't want.
     * @event postBroadphase
     * @param {Array} pairs An array of collision pairs. If this array is [body1,body2,body3,body4], then the body pairs 1,2 and 3,4 would advance to narrowphase.
     */
    this.postBroadphaseEvent = {
        type:"postBroadphase",
        pairs:null,
    };

    /**
     * Enable / disable automatic body sleeping. Sleeping can improve performance. You might need to {{#crossLink "Body/wakeUp:method"}}wake up{{/crossLink}} the bodies if they fall asleep when they shouldn't. If you want to enable sleeping in the world, but want to disable it for a particular body, see {{#crossLink "Body/allowSleep:property"}}Body.allowSleep{{/crossLink}}.
     * @property allowSleep
     * @type {Boolean}
     */
    this.enableBodySleeping = false;

    /**
     * Enable or disable island sleeping. Note that you must enable {{#crossLink "World/islandSplit:property"}}.islandSplit{{/crossLink}} for this to work.
     * @property {Boolean} enableIslandSleeping
     */
    this.enableIslandSleeping = false;

    /**
     * Fired when two shapes starts start to overlap. Fired in the narrowphase, during step.
     * @event beginContact
     * @param {Shape} shapeA
     * @param {Shape} shapeB
     * @param {Body}  bodyA
     * @param {Body}  bodyB
     * @param {Array} contactEquations
     */
    this.beginContactEvent = {
        type:"beginContact",
        shapeA : null,
        shapeB : null,
        bodyA : null,
        bodyB : null,
        contactEquations : [],
    };

    /**
     * Fired when two shapes stop overlapping, after the narrowphase (during step).
     * @event endContact
     * @param {Shape} shapeA
     * @param {Shape} shapeB
     * @param {Body}  bodyA
     * @param {Body}  bodyB
     * @param {Array} contactEquations
     */
    this.endContactEvent = {
        type:"endContact",
        shapeA : null,
        shapeB : null,
        bodyA : null,
        bodyB : null,
    };

    /**
     * Fired just before equations are added to the solver to be solved. Can be used to control what equations goes into the solver.
     * @event preSolve
     * @param {Array} contactEquations  An array of contacts to be solved.
     * @param {Array} frictionEquations An array of friction equations to be solved.
     */
    this.preSolveEvent = {
        type:"preSolve",
        contactEquations:null,
        frictionEquations:null,
    };

    // For keeping track of overlapping shapes
    this.overlappingShapesLastState = { keys:[] };
    this.overlappingShapesCurrentState = { keys:[] };
    this.overlappingShapeLookup = { keys:[] };
}
World.prototype = new Object(EventEmitter.prototype);

/**
 * Add a constraint to the simulation.
 *
 * @method addConstraint
 * @param {Constraint} c
 */
World.prototype.addConstraint = function(c){
    this.constraints.push(c);
};

/**
 * Add a ContactMaterial to the simulation.
 * @method addContactMaterial
 * @param {ContactMaterial} contactMaterial
 */
World.prototype.addContactMaterial = function(contactMaterial){
    this.contactMaterials.push(contactMaterial);
};

/**
 * Removes a contact material
 *
 * @method removeContactMaterial
 * @param {ContactMaterial} cm
 */
World.prototype.removeContactMaterial = function(cm){
    var idx = this.contactMaterials.indexOf(cm);
    if(idx!==-1){
        Utils.splice(this.contactMaterials,idx,1);
    }
};

/**
 * Get a contact material given two materials
 * @method getContactMaterial
 * @param {Material} materialA
 * @param {Material} materialB
 * @return {ContactMaterial} The matching ContactMaterial, or false on fail.
 * @todo Use faster hash map to lookup from material id's
 */
World.prototype.getContactMaterial = function(materialA,materialB){
    var cmats = this.contactMaterials;
    for(var i=0, N=cmats.length; i!==N; i++){
        var cm = cmats[i];
        if( (cm.materialA === materialA) && (cm.materialB === materialB) ||
            (cm.materialA === materialB) && (cm.materialB === materialA) ){
            return cm;
        }
    }
    return false;
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
        Utils.splice(this.constraints,idx,1);
    }
};

var step_r = vec2.create(),
    step_runit = vec2.create(),
    step_u = vec2.create(),
    step_f = vec2.create(),
    step_fhMinv = vec2.create(),
    step_velodt = vec2.create(),
    step_mg = vec2.create(),
    xiw = vec2.fromValues(0,0),
    xjw = vec2.fromValues(0,0),
    zero = vec2.fromValues(0,0),
    interpvelo = vec2.fromValues(0,0);

/**
 * Step the physics world forward in time.
 *
 * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
 *
 * @method step
 * @param {Number} dt                       The fixed time step size to use.
 * @param {Number} [timeSinceLastCalled=0]  The time elapsed since the function was last called.
 * @param {Number} [maxSubSteps=10]         Maximum number of fixed steps to take per function call.
 *
 * @example
 *     // fixed timestepping without interpolation
 *     var world = new World();
 *     world.step(0.01);
 *
 * @see http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
 */
World.prototype.step = function(dt,timeSinceLastCalled,maxSubSteps){
    maxSubSteps = maxSubSteps || 10;
    timeSinceLastCalled = timeSinceLastCalled || 0;

    if(timeSinceLastCalled === 0){ // Fixed, simple stepping

        this.internalStep(dt);

        // Increment time
        this.time += dt;

    } else {

        // Compute the number of fixed steps we should have taken since the last step
        var internalSteps = Math.floor( (this.time+timeSinceLastCalled) / dt) - Math.floor(this.time / dt);
        internalSteps = Math.min(internalSteps,maxSubSteps);

        // Do some fixed steps to catch up
        for(var i=0; i<internalSteps; i++){
            this.internalStep(dt);
        }

        // Increment internal clock
        this.time += timeSinceLastCalled;

        // Compute "Left over" time step
        var h = this.time % dt;

        for(var j=0; j!==this.bodies.length; j++){
            var b = this.bodies[j];
            if(b.motionState !== Body.STATIC && b.sleepState !== Body.SLEEPING){
                // Interpolate
                vec2.sub(interpvelo, b.position, b.previousPosition);
                vec2.scale(interpvelo, interpvelo, h/dt);
                vec2.add(b.interpolatedPosition, b.position, interpvelo);

                b.interpolatedAngle = b.angle + (b.angle - b.previousAngle) * h/dt;
            } else {
                // For static bodies, just copy. Who else will do it?
                vec2.copy(b.interpolatedPosition, b.position);
                b.interpolatedAngle = b.angle;
            }
        }
    }
};

/**
 * Make a fixed step.
 * @method internalStep
 * @param  {number} dt
 * @private
 */
World.prototype.internalStep = function(dt){
    this.stepping = true;

    var that = this,
        doProfiling = this.doProfiling,
        Nsprings = this.springs.length,
        springs = this.springs,
        bodies = this.bodies,
        g = this.gravity,
        solver = this.solver,
        Nbodies = this.bodies.length,
        broadphase = this.broadphase,
        np = this.narrowphase,
        constraints = this.constraints,
        t0, t1,
        fhMinv = step_fhMinv,
        velodt = step_velodt,
        mg = step_mg,
        scale = vec2.scale,
        add = vec2.add,
        rotate = vec2.rotate,
        islandManager = this.islandManager;

    this.lastTimeStep = dt;

    if(doProfiling){
        t0 = performance.now();
    }

    // Update approximate friction gravity.
    if(this.useWorldGravityAsFrictionGravity){
        var gravityLen = vec2.length(this.gravity);
        if(gravityLen === 0 && this.useFrictionGravityOnZeroGravity){
            // Leave friction gravity as it is.
        } else {
            // Nonzero gravity. Use it.
            this.frictionGravity = gravityLen;
        }
    }

    // Add gravity to bodies
    if(this.applyGravity){
        for(var i=0; i!==Nbodies; i++){
            var b = bodies[i],
                fi = b.force;
            if(b.motionState !== Body.DYNAMIC || b.sleepState === Body.SLEEPING){
                continue;
            }
            vec2.scale(mg,g,b.mass*b.gravityScale); // F=m*g
            add(fi,fi,mg);
        }
    }

    // Add spring forces
    if(this.applySpringForces){
        for(var i=0; i!==Nsprings; i++){
            var s = springs[i];
            s.applyForce();
        }
    }

    if(this.applyDamping){
        for(var i=0; i!==Nbodies; i++){
            var b = bodies[i];
            if(b.motionState === Body.DYNAMIC){
                b.applyDamping(dt);
            }
        }
    }

    // Broadphase
    var result = broadphase.getCollisionPairs(this);

    // Remove ignored collision pairs
    var ignoredPairs = this.disabledBodyCollisionPairs;
    for(var i=ignoredPairs.length-2; i>=0; i-=2){
        for(var j=result.length-2; j>=0; j-=2){
            if( (ignoredPairs[i]   === result[j] && ignoredPairs[i+1] === result[j+1]) ||
                (ignoredPairs[i+1] === result[j] && ignoredPairs[i]   === result[j+1])){
                result.splice(j,2);
            }
        }
    }

    // Remove constrained pairs with collideConnected == false
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        var c = constraints[i];
        if(!c.collideConnected){
            for(var j=result.length-2; j>=0; j-=2){
                if( (c.bodyA === result[j] && c.bodyB === result[j+1]) ||
                    (c.bodyB === result[j] && c.bodyA === result[j+1])){
                    result.splice(j,2);
                }
            }
        }
    }

    // postBroadphase event
    this.postBroadphaseEvent.pairs = result;
    this.emit(this.postBroadphaseEvent);

    // Narrowphase
    np.reset(this);
    for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
        var bi = result[i],
            bj = result[i+1];

        // Loop over all shapes of body i
        for(var k=0, Nshapesi=bi.shapes.length; k!==Nshapesi; k++){
            var si = bi.shapes[k],
                xi = bi.shapeOffsets[k],
                ai = bi.shapeAngles[k];

            // All shapes of body j
            for(var l=0, Nshapesj=bj.shapes.length; l!==Nshapesj; l++){
                var sj = bj.shapes[l],
                    xj = bj.shapeOffsets[l],
                    aj = bj.shapeAngles[l];

                var cm = this.defaultContactMaterial;
                if(si.material && sj.material){
                    var tmp = this.getContactMaterial(si.material,sj.material);
                    if(tmp){
                        cm = tmp;
                    }
                }

                this.runNarrowphase(np,bi,si,xi,ai,bj,sj,xj,aj,cm,this.frictionGravity);
            }
        }
    }

    // Emit shape end overlap events
    var last = this.overlappingShapesLastState;
    for(var i=0; i!==last.keys.length; i++){
        var key = last.keys[i];

        if(last[key]!==true){
            continue;
        }

        if(!this.overlappingShapesCurrentState[key]){
            // Not overlapping in current state, but in last state. Emit event!
            var e = this.endContactEvent;

            // Add shapes to the event object
            e.shapeA = last[key+"_shapeA"];
            e.shapeB = last[key+"_shapeB"];
            e.bodyA = last[key+"_bodyA"];
            e.bodyB = last[key+"_bodyB"];
            this.emit(e);
        }
    }

    // Clear last object
    for(var i=0; i!==last.keys.length; i++){
        delete last[last.keys[i]];
    }
    last.keys.length = 0;

    // Transfer from new object to old
    var current = this.overlappingShapesCurrentState;
    for(var i=0; i!==current.keys.length; i++){
        last[current.keys[i]] = current[current.keys[i]];
        last.keys.push(current.keys[i]);
    }

    // Clear current object
    for(var i=0; i!==current.keys.length; i++){
        delete current[current.keys[i]];
    }
    current.keys.length = 0;

    var preSolveEvent = this.preSolveEvent;
    preSolveEvent.contactEquations = np.contactEquations;
    preSolveEvent.frictionEquations = np.frictionEquations;
    this.emit(preSolveEvent);

    // update constraint equations
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        constraints[i].update();
    }

    if(np.contactEquations.length || np.frictionEquations.length || constraints.length){
        if(this.islandSplit){
            // Split into islands
            islandManager.equations.length = 0;
            Utils.appendArray(islandManager.equations, np.contactEquations);
            Utils.appendArray(islandManager.equations, np.frictionEquations);
            for(i=0; i!==Nconstraints; i++){
                Utils.appendArray(islandManager.equations, constraints[i].equations);
            }
            islandManager.split(this);

            for(var i=0; i!==islandManager.islands.length; i++){
                var island = islandManager.islands[i];
                if(island.equations.length){
                    solver.solveIsland(dt,island);
                }
            }

        } else {

            // Add contact equations to solver
            solver.addEquations(np.contactEquations);
            solver.addEquations(np.frictionEquations);

            // Add user-defined constraint equations
            for(i=0; i!==Nconstraints; i++){
                solver.addEquations(constraints[i].equations);
            }

            if(this.solveConstraints){
                solver.solve(dt,this);
            }

            solver.removeAllEquations();
        }
    }

    // Step forward
    for(var i=0; i!==Nbodies; i++){
        var body = bodies[i];

        if(body.sleepState !== Body.SLEEPING && body.motionState !== Body.STATIC){
            World.integrateBody(body,dt);
        }
    }

    // Reset force
    for(var i=0; i!==Nbodies; i++){
        bodies[i].setZeroForce();
    }

    if(doProfiling){
        t1 = performance.now();
        that.lastStepTime = t1-t0;
    }

    // Emit impact event
    if(this.emitImpactEvent){
        var ev = this.impactEvent;
        for(var i=0; i!==np.contactEquations.length; i++){
            var eq = np.contactEquations[i];
            if(eq.firstImpact){
                ev.bodyA = eq.bodyA;
                ev.bodyB = eq.bodyB;
                ev.shapeA = eq.shapeA;
                ev.shapeB = eq.shapeB;
                ev.contactEquation = eq;
                this.emit(ev);
            }
        }
    }

    // Sleeping update
    if(this.enableBodySleeping){
        for(i=0; i!==Nbodies; i++){
            bodies[i].sleepTick(this.time, false, dt);
        }
    } else if(this.enableIslandSleeping && this.islandSplit){

        // Tell all bodies to sleep tick but dont sleep yet
        for(i=0; i!==Nbodies; i++){
            bodies[i].sleepTick(this.time, true, dt);
        }

        // Sleep islands
        for(var i=0; i<this.islandManager.islands.length; i++){
            var island = this.islandManager.islands[i];
            if(island.wantsToSleep()){
                island.sleep();
            }
        }
    }

    this.stepping = false;

    // Remove bodies that are scheduled for removal
    if(this.bodiesToBeRemoved.length){
        for(var i=0; i!==this.bodiesToBeRemoved.length; i++){
            this.removeBody(this.bodiesToBeRemoved[i]);
        }
        this.bodiesToBeRemoved.length = 0;
    }

    this.emit(this.postStepEvent);
};

var ib_fhMinv = vec2.create();
var ib_velodt = vec2.create();

/**
 * Move a body forward in time.
 * @static
 * @method integrateBody
 * @param  {Body} body
 * @param  {Number} dt
 * @todo Move to Body.prototype?
 */
World.integrateBody = function(body,dt){
    var minv = body.invMass,
        f = body.force,
        pos = body.position,
        velo = body.velocity;

    // Save old position
    vec2.copy(body.previousPosition, body.position);
    body.previousAngle = body.angle;

    // Angular step
    if(!body.fixedRotation){
        body.angularVelocity += body.angularForce * body.invInertia * dt;
        body.angle += body.angularVelocity * dt;
    }

    // Linear step
    vec2.scale(ib_fhMinv,f,dt*minv);
    vec2.add(velo,ib_fhMinv,velo);
    vec2.scale(ib_velodt,velo,dt);
    vec2.add(pos,pos,ib_velodt);

    body.aabbNeedsUpdate = true;
};

/**
 * Runs narrowphase for the shape pair i and j.
 * @method runNarrowphase
 * @param  {Narrowphase} np
 * @param  {Body} bi
 * @param  {Shape} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Shape} sj
 * @param  {Array} xj
 * @param  {Number} aj
 * @param  {Number} mu
 */
World.prototype.runNarrowphase = function(np,bi,si,xi,ai,bj,sj,xj,aj,cm,glen){

    // Check collision groups and masks
    if(!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0)){
        return;
    }

    // Get world position and angle of each shape
    vec2.rotate(xiw, xi, bi.angle);
    vec2.rotate(xjw, xj, bj.angle);
    vec2.add(xiw, xiw, bi.position);
    vec2.add(xjw, xjw, bj.position);
    var aiw = ai + bi.angle;
    var ajw = aj + bj.angle;

    np.enableFriction = cm.friction > 0;
    np.frictionCoefficient = cm.friction;
    var reducedMass;
    if(bi.motionState === Body.STATIC || bi.motionState === Body.KINEMATIC){
        reducedMass = bj.mass;
    } else if(bj.motionState === Body.STATIC || bj.motionState === Body.KINEMATIC){
        reducedMass = bi.mass;
    } else {
        reducedMass = (bi.mass*bj.mass)/(bi.mass+bj.mass);
    }
    np.slipForce = cm.friction*glen*reducedMass;
    np.restitution = cm.restitution;
    np.surfaceVelocity = cm.surfaceVelocity;
    np.frictionStiffness = cm.frictionStiffness;
    np.frictionRelaxation = cm.frictionRelaxation;
    np.stiffness = cm.stiffness;
    np.relaxation = cm.relaxation;

    var resolver = np[si.type | sj.type],
        numContacts = 0;
    if (resolver) {
        var sensor = si.sensor || sj.sensor;
        var numFrictionBefore = np.frictionEquations.length;
        if (si.type < sj.type) {
            numContacts = resolver.call(np, bi,si,xiw,aiw, bj,sj,xjw,ajw, sensor);
        } else {
            numContacts = resolver.call(np, bj,sj,xjw,ajw, bi,si,xiw,aiw, sensor);
        }
        var numFrictionEquations = np.frictionEquations.length - numFrictionBefore;

        if(numContacts){

            // Wake up bodies
            var wakeUpA = false;
            var wakeUpB = false;

            var speedSquaredA = vec2.squaredLength(bi.velocity) + Math.pow(bi.angularVelocity,2);
            var speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit,2);
            var speedSquaredB = vec2.squaredLength(bj.velocity) + Math.pow(bj.angularVelocity,2);
            var speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit,2);

            if( bi.allowSleep &&
                bi.motionState === Body.DYNAMIC &&
                bi.sleepState  === Body.SLEEPING &&
                bj.sleepState  === Body.AWAKE &&
                bj.motionState !== Body.STATIC &&
                speedSquaredB >= speedLimitSquaredB*2
            ){
                wakeUpA = true;
            }
            if( bj.allowSleep &&
                bj.motionState === Body.DYNAMIC &&
                bj.sleepState  === Body.SLEEPING &&
                bi.sleepState  === Body.AWAKE &&
                bi.motionState !== Body.STATIC &&
                speedSquaredA >= speedLimitSquaredA*2
            ){
                wakeUpB = true;
            }
            if(wakeUpA){
                bi.wakeUp();
            }
            if(wakeUpB){
                bj.wakeUp();
            }

            var key = si.id < sj.id ? si.id+" "+ sj.id : sj.id+" "+ si.id;
            if(!this.overlappingShapesLastState[key]){

                // Report new shape overlap
                var e = this.beginContactEvent;
                e.shapeA = si;
                e.shapeB = sj;
                e.bodyA = bi;
                e.bodyB = bj;

                // Reset contact equations
                e.contactEquations.length = 0;

                if(typeof(numContacts)==="number"){
                    for(var i=np.contactEquations.length-numContacts; i<np.contactEquations.length; i++){
                        e.contactEquations.push(np.contactEquations[i]);
                    }
                }

                this.emit(e);
            }

            // Store current contact state
            var current = this.overlappingShapesCurrentState;
            if(!current[key]){

                current[key] = true;
                current.keys.push(key);

                // Also store shape & body data
                current[key+"_shapeA"] = si;
                current.keys.push(key+"_shapeA");
                current[key+"_shapeB"] = sj;
                current.keys.push(key+"_shapeB");
                current[key+"_bodyA"] = bi;
                current.keys.push(key+"_bodyA");
                current[key+"_bodyB"] = bj;
                current.keys.push(key+"_bodyB");
            }

            // divide the max friction force by the number of contacts
            if(typeof(numContacts)==="number" && numFrictionEquations > 1){ // Why divide by 1?
                for(var i=np.frictionEquations.length-numFrictionEquations; i<np.frictionEquations.length; i++){
                    var f = np.frictionEquations[i];
                    f.setSlipForce(f.getSlipForce() / numFrictionEquations);
                }
            }
        }
    }

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
    if(idx===-1){
        Utils.splice(this.springs,idx,1);
    }
};

/**
 * Add a body to the simulation
 *
 * @method addBody
 * @param {Body} body
 *
 * @example
 *     var world = new World(),
 *         body = new Body();
 *     world.addBody(body);
 * @todo What if this is done during step?
 */
World.prototype.addBody = function(body){
    if(this.bodies.indexOf(body) === -1){
        this.bodies.push(body);
        body.world = this;
        this.addBodyEvent.body = body;
        this.emit(this.addBodyEvent);
    }
};

/**
 * Remove a body from the simulation. If this method is called during step(), the body removal is scheduled to after the step.
 *
 * @method removeBody
 * @param {Body} body
 */
World.prototype.removeBody = function(body){
    if(this.stepping){
        this.bodiesToBeRemoved.push(body);
    } else {
        body.world = null;
        var idx = this.bodies.indexOf(body);
        if(idx!==-1){
            Utils.splice(this.bodies,idx,1);
            this.removeBodyEvent.body = body;
            body.resetConstraintVelocity();
            this.emit(this.removeBodyEvent);
        }
    }
};

/**
 * Get a body by its id.
 * @method getBodyById
 * @return {Body|Boolean} The body, or false if it was not found.
 */
World.prototype.getBodyById = function(id){
    var bodies = this.bodies;
    for(var i=0; i<bodies.length; i++){
        var b = bodies[i];
        if(b.id === id){
            return b;
        }
    }
    return false;
};

/**
 * Disable collision between two bodies
 * @method disableCollision
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
World.prototype.disableBodyCollision = function(bodyA,bodyB){
    this.disabledBodyCollisionPairs.push(bodyA,bodyB);
};

/**
 * Enable collisions between the given two bodies
 * @method enableCollision
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
World.prototype.enableBodyCollision = function(bodyA,bodyB){
    var pairs = this.disabledBodyCollisionPairs;
    for(var i=0; i<pairs.length; i+=2){
        if((pairs[i] === bodyA && pairs[i+1] === bodyB) || (pairs[i+1] === bodyA && pairs[i] === bodyB)){
            pairs.splice(i,2);
            return;
        }
    }
};


function v2a(v){
    if(!v) return v;
    return [v[0],v[1]];
}

function extend(a,b){
    for(var key in b)
        a[key] = b[key];
}

function contactMaterialToJSON(cm){
    return {
        id : cm.id,
        materialA :             cm.materialA.id,
        materialB :             cm.materialB.id,
        friction :              cm.friction,
        restitution :           cm.restitution,
        stiffness :             cm.stiffness,
        relaxation :            cm.relaxation,
        frictionStiffness :     cm.frictionStiffness,
        frictionRelaxation :    cm.frictionRelaxation,
    };
}

/**
 * Convert the world to a JSON-serializable Object.
 *
 * @method toJSON
 * @return {Object}
 * @deprecated Should use Serializer instead.
 */
World.prototype.toJSON = function(){
    var world = this;

    var json = {
        p2 :                        pkg.version,
        bodies :                    [],
        springs :                   [],
        solver :                    {},
        gravity :                   v2a(world.gravity),
        broadphase :                {},
        distanceConstraints :       [],
        revoluteConstraints :       [],
        prismaticConstraints :      [],
        lockConstraints :           [],
        gearConstraints :           [],
        contactMaterials :          [],
        materials :                 [],
        defaultContactMaterial :    contactMaterialToJSON(world.defaultContactMaterial),
        islandSplit :               world.islandSplit,
        enableIslandSleeping :      world.enableIslandSleeping,
        enableBodySleeping :        world.enableBodySleeping,
    };

    // Solver
    var js = json.solver,
        s = world.solver;
    if(s.type === Solver.GS){
        js.type = "GSSolver";
        js.iterations = s.iterations;
    }

    // Broadphase
    var jb = json.broadphase,
        wb = world.broadphase;
    if(wb.type === Broadphase.NAIVE){
        jb.type = "NaiveBroadphase";
    } else if(wb.type === Broadphase.SAP) {
        jb.type = "SAPBroadphase";
        //jb.axisIndex = wb.axisIndex;
    } else {
        console.error("Broadphase not supported: "+wb.type);
    }

    // Serialize springs
    for(var i=0; i!==world.springs.length; i++){
        var s = world.springs[i];
        json.springs.push({
            bodyA :         world.bodies.indexOf(s.bodyA),
            bodyB :         world.bodies.indexOf(s.bodyB),
            stiffness :     s.stiffness,
            damping :       s.damping,
            restLength :    s.restLength,
            localAnchorA :  v2a(s.localAnchorA),
            localAnchorB :  v2a(s.localAnchorB),
        });
    }

    // Serialize constraints
    for(var i=0; i<world.constraints.length; i++){
        var c = world.constraints[i];
        var jc = {
            bodyA : world.bodies.indexOf(c.bodyA),
            bodyB : world.bodies.indexOf(c.bodyB),
            collideConnected : c.collideConnected
        };

        switch(c.type){

        case Constraint.DISTANCE:
            extend(jc,{
                distance : c.distance,
                maxForce : c.getMaxForce(),
            });
            json.distanceConstraints.push(jc);
            break;

        case Constraint.REVOLUTE:
            extend(jc,{
                pivotA :            v2a(c.pivotA),
                pivotB :            v2a(c.pivotB),
                maxForce :          c.maxForce,
                motorSpeed :        c.getMotorSpeed() || 0,
                motorEnabled :       !!c.getMotorSpeed(),
                lowerLimit :        c.lowerLimit,
                lowerLimitEnabled : c.lowerLimitEnabled,
                upperLimit :        c.upperLimit,
                upperLimitEnabled : c.upperLimitEnabled,
            });
            json.revoluteConstraints.push(jc);
            break;

        case Constraint.PRISMATIC:
            extend(jc,{
                localAxisA :    v2a(c.localAxisA),
                localAnchorA :  v2a(c.localAnchorA),
                localAnchorB :  v2a(c.localAnchorB),
                maxForce :      c.maxForce,
                upperLimitEnabled : c.upperLimitEnabled,
                lowerLimitEnabled : c.lowerLimitEnabled,
                upperLimit : c.upperLimit,
                lowerLimit : c.lowerLimit,
                motorEnabled : c.motorEnabled,
                motorSpeed : c.motorSpeed,
            });
            json.prismaticConstraints.push(jc);
            break;

        case Constraint.LOCK:
            extend(jc,{
                localOffsetB :  v2a(c.localOffsetB),
                localAngleB :   c.localAngleB,
                maxForce :      c.getMaxForce(),
            });
            json.lockConstraints.push(jc);
            break;

        case Constraint.GEAR:
            extend(jc,{
                angle :     c.angle,
                ratio :     c.ratio,
                maxForce :  c.maxForce || 1e6, // correct?
            });
            json.gearConstraints.push(jc);
            break;

        default:
            console.error("Constraint not supported yet: ",c.type);
            break;
        }
    }

    // Serialize bodies
    for(var i=0; i!==world.bodies.length; i++){
        var b = world.bodies[i],
            ss = b.shapes,
            jsonBody = {
                id : b.id,
                mass : b.mass,
                angle : b.angle,
                position : v2a(b.position),
                velocity : v2a(b.velocity),
                angularVelocity : b.angularVelocity,
                force : v2a(b.force),
                motionState : b.motionState,
                fixedRotation : b.fixedRotation,
                circleShapes :    [],
                planeShapes :     [],
                particleShapes :  [],
                lineShapes :      [],
                rectangleShapes : [],
                convexShapes :    [],
                capsuleShapes :   [],
            };

        if(b.concavePath){
            jsonBody.concavePath = b.concavePath;
        }

        for(var j=0; j<ss.length; j++){
            var s = ss[j],
                jsonShape = {};

            jsonShape.offset = v2a(b.shapeOffsets[j]);
            jsonShape.angle = b.shapeAngles[j];
            jsonShape.collisionGroup = s.collisionGroup;
            jsonShape.collisionMask = s.collisionMask;
            jsonShape.material = s.material ? s.material.id : null;

            // Check type
            switch(s.type){

            case Shape.CIRCLE:
                extend(jsonShape,{ radius : s.radius, });
                jsonBody.circleShapes.push(jsonShape);
                break;

            case Shape.PLANE:
                jsonBody.planeShapes.push(jsonShape);
                break;

            case Shape.PARTICLE:
                jsonBody.particleShapes.push(jsonShape);
                break;

            case Shape.LINE:
                jsonShape.length = s.length;
                jsonBody.lineShapes.push(jsonShape);
                break;

            case Shape.RECTANGLE:
                extend(jsonShape,{   width : s.width,
                                     height : s.height });
                jsonBody.rectangleShapes.push(jsonShape);
                break;

            case Shape.CONVEX:
                var verts = [];
                for(var k=0; k<s.vertices.length; k++){
                    verts.push(v2a(s.vertices[k]));
                }
                extend(jsonShape,{ vertices : verts });
                jsonBody.convexShapes.push(jsonShape);
                break;

            case Shape.CAPSULE:
                extend(jsonShape,{ length : s.length, radius : s.radius });
                jsonBody.capsuleShapes.push(jsonShape);
                break;

            default:
                console.error("Shape type not supported yet!");
                break;
            }
        }

        json.bodies.push(jsonBody);
    }

    // Serialize contactmaterials
    for(var i=0; i<world.contactMaterials.length; i++){
        var cm = world.contactMaterials[i];
        json.contactMaterials.push(contactMaterialToJSON(cm));
    }

    // Serialize materials
    var mats = {};
    // Get unique materials first
    for(var i=0; i<world.contactMaterials.length; i++){
        var cm = world.contactMaterials[i];
        mats[cm.materialA.id+''] = cm.materialA;
        mats[cm.materialB.id+''] = cm.materialB;
    }
    for(var matId in mats){
        var m = mats[parseInt(matId)];
        json.materials.push({
            id : m.id,
        });
    }

    return json;
};

/**
 * Load a scene from a serialized state in JSON format.
 *
 * @method fromJSON
 * @param  {Object} json
 * @return {Boolean} True on success, else false.
 */
World.prototype.fromJSON = function(json){
    this.clear();

    if(!json.p2){
        return false;
    }

    var w = this;

    // Set gravity
    vec2.copy(w.gravity, json.gravity);

    w.islandSplit =           json.islandSplit;
    w.enableIslandSleeping =  json.enableIslandSleeping;
    w.enableBodySleeping =    json.enableBodySleeping;

    // Set solver
    switch(json.solver.type){
    case "GSSolver":
        var js = json.solver,
            s = new GSSolver();
        w.solver = s;
        s.iterations = js.iterations;
        break;
    default:
        throw new Error("Solver type not recognized: "+json.solver.type);
    }

    // Broadphase
    switch(json.broadphase.type){
    case "NaiveBroadphase":
        w.broadphase = new NaiveBroadphase();
        break;

    case "SAPBroadphase":
        w.broadphase = new SAPBroadphase();
        break;
    }
    w.broadphase.setWorld(w);


    var bodies = w.bodies;

    // Load materials
    var id2material = {};
    for(var i=0; i!==json.materials.length; i++){
        var jm = json.materials[i];
        var m = new Material();
        id2material[jm.id+""] = m;
        m.id = jm.id;
    }

    // Load default material
    w.defaultMaterial.id = json.defaultContactMaterial.materialA;

    // Load bodies
    for(var i=0; i!==json.bodies.length; i++){
        var jb = json.bodies[i];

        // Create body
        var b = new Body({
            mass :              jb.mass,
            position :          jb.position,
            angle :             jb.angle,
            velocity :          jb.velocity,
            angularVelocity :   jb.angularVelocity,
            force :             jb.force,
            fixedRotation :     jb.fixedRotation,
        });
        b.id = jb.id;
        b.motionState = jb.motionState;

        // Circle
        for(var j=0; j<jb.circleShapes.length; j++){
            var s = jb.circleShapes[j];
            addShape(b, new Circle(s.radius), s);
        }

        // Plane
        for(var j=0; j<jb.planeShapes.length; j++){
            var s = jb.planeShapes[j];
            addShape(b, new Plane(), s);
        }

        // Particle
        for(var j=0; j<jb.particleShapes.length; j++){
            var s = jb.particleShapes[j];
            addShape(b, new Particle(), s);
        }

        // Line
        for(var j=0; j<jb.lineShapes.length; j++){
            var s = jb.lineShapes[j];
            addShape(b, new Line(s.length), s);
        }

        // Rectangle
        for(var j=0; j<jb.rectangleShapes.length; j++){
            var s = jb.rectangleShapes[j];
            addShape(b, new Rectangle(s.width,s.height), s);
        }

        // Convex
        for(var j=0; j<jb.convexShapes.length; j++){
            var s = jb.convexShapes[j];
            addShape(b, new Convex(s.vertices), s);
        }

        // Capsule
        for(var j=0; j<jb.capsuleShapes.length; j++){
            var s = jb.capsuleShapes[j];
            addShape(b, new Capsule(s.length, s.radius), s);
        }

        function addShape(body, shape, shapeJSON){
            shape.collisionMask = shapeJSON.collisionMask;
            shape.collisionGroup = shapeJSON.collisionGroup;
            if(shapeJSON.material){
                shape.material = id2material[shapeJSON.material+""];
            }
            body.addShape(shape, shapeJSON.offset, shapeJSON.angle);
        }

        if(jb.concavePath){
            b.concavePath = jb.concavePath;
        }

        w.addBody(b);
    }

    // Load springs
    for(var i=0; i<json.springs.length; i++){
        var js = json.springs[i];
        var bodyA = bodies[js.bodyA],
            bodyB = bodies[js.bodyB];
        if(!bodyA){
            this.error = "instance.springs["+i+"] references instance.body["+js.bodyA+"], which does not exist.";
            return false;
        }
        if(!bodyB){
            this.error = "instance.springs["+i+"] references instance.body["+js.bodyB+"], which does not exist.";
            return false;
        }
        var s = new Spring(bodyA, bodyB, {
            stiffness : js.stiffness,
            damping : js.damping,
            restLength : js.restLength,
            localAnchorA : js.localAnchorA,
            localAnchorB : js.localAnchorB,
        });
        w.addSpring(s);
    }

    // Load contact materials
    for(var i=0; i<json.contactMaterials.length; i++){
        var jm = json.contactMaterials[i],
            matA = id2material[jm.materialA+""],
            matB = id2material[jm.materialB+""];

        if(!matA){
            this.error = "Reference to material id "+jm.materialA+": material not found";
            return false;
        }
        if(!matB){
            this.error = "Reference to material id "+jm.materialB+": material not found";
            return false;
        }

        var cm = new ContactMaterial(matA, matB, {
            friction :              jm.friction,
            restitution :           jm.restitution,
            stiffness :             jm.stiffness,
            relaxation :            jm.relaxation,
            frictionStiffness :     jm.frictionStiffness,
            frictionRelaxation :    jm.frictionRelaxation,
        });
        cm.id = jm.id;
        w.addContactMaterial(cm);
    }

    // Load default contact material
    var jm = json.defaultContactMaterial,
        matA = w.defaultMaterial,
        matB = w.defaultMaterial;
    var cm = new ContactMaterial(matA, matB, {
        friction :              jm.friction,
        restitution :           jm.restitution,
        stiffness :             jm.stiffness,
        relaxation :            jm.relaxation,
        frictionStiffness :     jm.frictionStiffness,
        frictionRelaxation :    jm.frictionRelaxation,
    });
    cm.id = jm.id;
    w.defaultContactMaterial = cm;

    // DistanceConstraint
    for(var i=0; i<json.distanceConstraints.length; i++){
        var c = json.distanceConstraints[i];
        w.addConstraint(new DistanceConstraint( bodies[c.bodyA], bodies[c.bodyB], c.distance, {
            maxForce:c.maxForce,
            collideConnected:c.collideConnected
        }));
    }

    // RevoluteConstraint
    for(var i=0; i<json.revoluteConstraints.length; i++){
        var c = json.revoluteConstraints[i];
        var revolute = new RevoluteConstraint(bodies[c.bodyA], c.pivotA, bodies[c.bodyB], c.pivotB, {
            maxForce: c.maxForce,
            collideConnected: c.collideConnected
        });
        if(c.motorEnabled){
            revolute.enableMotor();
        }
        revolute.setMotorSpeed(c.motorSpeed);
        revolute.lowerLimit = c.lowerLimit;
        revolute.upperLimit = c.upperLimit;
        revolute.lowerLimitEnabled = c.lowerLimitEnabled;
        revolute.upperLimitEnabled = c.upperLimitEnabled;
        w.addConstraint(revolute);
    }

    // PrismaticConstraint
    for(var i=0; i<json.prismaticConstraints.length; i++){
        var c = json.prismaticConstraints[i],
            p = new PrismaticConstraint(bodies[c.bodyA], bodies[c.bodyB], {
                maxForce : c.maxForce,
                localAxisA : c.localAxisA,
                localAnchorA : c.localAnchorA,
                localAnchorB : c.localAnchorB,
                collideConnected: c.collideConnected
            });
        p.motorSpeed = c.motorSpeed;
        w.addConstraint(p);
    }

    // LockConstraint
    for(var i=0; i<json.lockConstraints.length; i++){
        var c = json.lockConstraints[i];
        w.addConstraint(new LockConstraint(bodies[c.bodyA], bodies[c.bodyB], {
            maxForce :     c.maxForce,
            localOffsetB : c.localOffsetB,
            localAngleB :  c.localAngleB,
            collideConnected: c.collideConnected
        }));
    }

    // GearConstraint
    for(var i=0; i<json.gearConstraints.length; i++){
        var c = json.gearConstraints[i];
        w.addConstraint(new GearConstraint(bodies[c.bodyA], bodies[c.bodyB], {
            maxForce :      c.maxForce,
            angle :         c.angle,
            ratio :         c.ratio,
            collideConnected: c.collideConnected
        }));
    }

    return true;
};

/**
 * Resets the World, removes all bodies, constraints and springs.
 *
 * @method clear
 */
World.prototype.clear = function(){

    this.time = 0;
    this.fixedStepTime = 0;

    // Remove all solver equations
    if(this.solver && this.solver.equations.length){
        this.solver.removeAllEquations();
    }

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

    // Remove all contact materials
    var cms = this.contactMaterials;
    for(var i=cms.length-1; i>=0; i--){
        this.removeContactMaterial(cms[i]);
    }

    World.apply(this);
};

/**
 * Get a copy of this World instance
 * @method clone
 * @return {World}
 */
World.prototype.clone = function(){
    var world = new World();
    world.fromJSON(this.toJSON());
    return world;
};

var hitTest_tmp1 = vec2.create(),
    hitTest_zero = vec2.fromValues(0,0),
    hitTest_tmp2 = vec2.fromValues(0,0);

/**
 * Test if a world point overlaps bodies
 * @method hitTest
 * @param  {Array}  worldPoint  Point to use for intersection tests
 * @param  {Array}  bodies      A list of objects to check for intersection
 * @param  {Number} precision   Used for matching against particles and lines. Adds some margin to these infinitesimal objects.
 * @return {Array}              Array of bodies that overlap the point
 */
World.prototype.hitTest = function(worldPoint,bodies,precision){
    precision = precision || 0;

    // Create a dummy particle body with a particle shape to test against the bodies
    var pb = new Body({ position:worldPoint }),
        ps = new Particle(),
        px = worldPoint,
        pa = 0,
        x = hitTest_tmp1,
        zero = hitTest_zero,
        tmp = hitTest_tmp2;
    pb.addShape(ps);

    var n = this.narrowphase,
        result = [];

    // Check bodies
    for(var i=0, N=bodies.length; i!==N; i++){
        var b = bodies[i];
        for(var j=0, NS=b.shapes.length; j!==NS; j++){
            var s = b.shapes[j],
                offset = b.shapeOffsets[j] || zero,
                angle = b.shapeAngles[j] || 0.0;

            // Get shape world position + angle
            vec2.rotate(x, offset, b.angle);
            vec2.add(x, x, b.position);
            var a = angle + b.angle;

            if( (s instanceof Circle    && n.circleParticle  (b,s,x,a,     pb,ps,px,pa, true)) ||
                (s instanceof Convex    && n.particleConvex  (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Plane     && n.particlePlane   (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Capsule   && n.particleCapsule (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Particle  && vec2.squaredLength(vec2.sub(tmp,x,worldPoint)) < precision*precision)
                ){
                result.push(b);
            }
        }
    }

    return result;
};

/**
 * Sets the Equation parameters for all constraints and contact materials.
 * @method setGlobalEquationParameters
 * @param {object} [parameters]
 * @param {Number} [parameters.relaxation]
 * @param {Number} [parameters.stiffness]
 */
World.prototype.setGlobalEquationParameters = function(parameters){
    parameters = parameters || {};

    // Set for all constraints
    for(var i=0; i !== this.constraints.length; i++){
        var c = this.constraints[i];
        for(var j=0; j !== c.equations.length; j++){
            var eq = c.equations[j];
            if(typeof(parameters.stiffness) !== "undefined"){
                eq.stiffness = parameters.stiffness;
            }
            if(typeof(parameters.relaxation) !== "undefined"){
                eq.relaxation = parameters.relaxation;
            }
            eq.needsUpdate = true;
        }
    }

    // Set for all contact materials
    for(var i=0; i !== this.contactMaterials.length; i++){
        var c = this.contactMaterials[i];
        if(typeof(parameters.stiffness) !== "undefined"){
            c.stiffness = parameters.stiffness;
            c.frictionStiffness = parameters.stiffness;
        }
        if(typeof(parameters.relaxation) !== "undefined"){
            c.relaxation = parameters.relaxation;
            c.frictionRelaxation = parameters.relaxation;
        }
    }

    // Set for default contact material
    var c = this.defaultContactMaterial;
    if(typeof(parameters.stiffness) !== "undefined"){
        c.stiffness = parameters.stiffness;
        c.frictionStiffness = parameters.stiffness;
    }
    if(typeof(parameters.relaxation) !== "undefined"){
        c.relaxation = parameters.relaxation;
        c.frictionRelaxation = parameters.relaxation;
    }
};

/**
 * Set the stiffness for all equations and contact materials.
 * @method setGlobalStiffness
 * @param {Number} stiffness
 */
World.prototype.setGlobalStiffness = function(stiffness){
    this.setGlobalEquationParameters({
        stiffness: stiffness
    });
};

/**
 * Set the relaxation for all equations and contact materials.
 * @method setGlobalRelaxation
 * @param {Number} relaxation
 */
World.prototype.setGlobalRelaxation = function(relaxation){
    this.setGlobalEquationParameters({
        relaxation: relaxation
    });
};
