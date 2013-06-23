    var GSSolver = require('../solver/GSSolver').GSSolver,
        NaiveBroadphase = require('../collision/NaiveBroadphase').NaiveBroadphase,
        glMatrix = require('gl-matrix'),
        vec2 = glMatrix.vec2,
        Circle = require('../objects/Shape').Circle,
        Plane = require('../objects/Shape').Plane,
        Particle = require('../objects/Shape').Particle,
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
     * @class
     * @param {Object} [options]
     * @param {p2.Solver} options.solver Default: p2.GSSolver
     * @param {vec2} options.gravity Default: [0,-9.78]
     * @param {p2.Broadphase} options.broadphase Default: p2.NaiveBroadphase
     */
    function World(options){
        options = options || {};

        /**
         * All springs in the world.
         * @member {Array}
         * @memberof World
         */
        this.springs = [];

        /**
         * All bodies in the world.
         * @member {Array}
         * @memberof World
         */
        this.bodies = [];

        /**
         * The solver used to satisfy constraints and contacts.
         * @member {p2.Solver}
         * @memberof World
         */
        this.solver = options.solver || new GSSolver();

        /**
         * The contacts in the world that were generated during the last step().
         * @member {Array}
         * @memberof World
         */
        this.contacts = [];

        this.oldContacts = [];
        this.collidingBodies = [];

        /**
         * Gravity in the world. This is applied on all bodies in the beginning of each step().
         * @member {vec2}
         * @memberof World
         */
        this.gravity = options.gravity || vec2.fromValues(0, -9.78);

        /**
         * Whether to do timing measurements during the step() or not.
         * @member {bool}
         * @memberof World
         */
        this.doProfiling = options.doProfiling || false;

        /**
         * How many millisecconds the last step() took. This is updated each step if .doProfiling is set to true.
         * @member {number}
         * @memberof World
         */
        this.lastStepTime = 0.0;

        /**
         * The broadphase algorithm to use.
         * @member {p2.Broadphase}
         * @memberof World
         */
        this.broadphase = options.broadphase || new NaiveBroadphase();

        /**
         * User-added constraints.
         * @member {Array}
         * @memberof World
         */
        this.constraints = [];

        // Id counters
        this._constraintIdCounter = 0;
        this._bodyIdCounter = 0;
    };

    /**
     * Add a constraint to the simulation.
     * @memberof World
     * @param {p2.Constraint} c
     */
    World.prototype.addConstraint = function(c){
        this.constraints.push(c);
        c.id = this._constraintIdCounter++;
    };

    /**
     * Removes a constraint
     * @memberof World
     * @param {p2.Constraint} c
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
     * @method
     * @memberof World
     * @param {number} dt The time step size to use.
     */
    World.prototype.step = function(dt,callback){
        var doProfiling = this.doProfiling,
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
        solver.solve(dt,this,function(){
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
                this.lastStepTime = t1-t0;
            }

            callback();
        });
    };

    /**
     * Add a spring to the simulation
     *
     * @method
     * @memberof World
     * @param {p2.Spring} s
     */
    World.prototype.addSpring = function(s){
        this.springs.push(s);
    };

    /**
     * Remove a spring
     *
     * @method
     * @memberof World
     * @param {p2.Spring} s
     */
    World.prototype.removeSpring = function(s){
        var idx = this.springs.indexOf(s);
        if(idx===-1)
            this.springs.splice(idx,1);
    };

    /**
     * Add a body to the simulation
     *
     * @method
     * @memberof World
     * @param {p2.Body} body
     */
    World.prototype.addBody = function(body){
        this.bodies.push(body);
        this.collidingBodies.push(body);
    };

    /**
     * Remove a body from the simulation
     *
     * @method
     * @memberof World
     * @param {p2.Body} body
     */
    World.prototype.removeBody = function(body){
        var idx = this.bodies.indexOf(body);
        if(idx===-1)
            this.bodies.splice(idx,1);
    };

