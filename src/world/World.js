    /**
     * The dynamics world, where all bodies and constraints lives.
     *
     * Options:
     *   - solver (p2.Solver) Default: {p2.GSSolver}
     *   - gravity (vec2) Default: -9.78
     *   - broadphase (p2.Broadphase) Default: {p2.NaiveBroadphase}
     *
     * @class
     * @param {Object} options
     */
    p2.World = function(options){
        options = options || {};

        /**
         * All springs in the world.
         * @member {Array}
         * @memberof p2.World
         */
        this.springs = [];

        /**
         * All bodies in the world.
         * @member {Array}
         * @memberof p2.World
         */
        this.bodies = [];

        /**
         * The solver used to satisfy constraints and contacts.
         * @member {p2.Solver}
         * @memberof p2.World
         */
        this.solver = options.solver || new p2.GSSolver();

        /**
         * The contacts in the world that were generated during the last step().
         * @member {Array}
         * @memberof p2.World
         */
        this.contacts = [];

        this.oldContacts = [];
        this.collidingBodies = [];

        /**
         * Gravity in the world. This is applied on all bodies in the beginning of each step().
         * @member {vec2}
         * @memberof p2.World
         */
        this.gravity = options.gravity || V.create(0, -9.78);

        /**
         * Whether to do timing measurements during the step() or not.
         * @member {bool}
         * @memberof p2.World
         */
        this.doProfiling = options.doProfiling || false;

        /**
         * How many millisecconds the last step() took. This is updated each step if .doProfiling is set to true.
         * @member {number}
         * @memberof p2.World
         */
        this.lastStepTime = 0.0;

        /**
         * The broadphase algorithm to use.
         * @member {p2.Broadphase}
         * @memberof p2.World
         */
        this.broadphase = options.broadphase || new p2.NaiveBroadphase();
    };

    /**
     * Step the physics world forward in time.
     *
     * @method
     * @memberof p2.World
     * @param {number} dt The time step size to use.
     */
    p2.World.prototype.step = function(dt){
        var doProfiling = this.doProfiling,
            Nsprings = this.springs.length,
            springs = this.springs,
            bodies = this.bodies,
            collidingBodies=this.collidingBodies,
            g = this.gravity,
            solver = this.solver,
            Nbodies = this.bodies.length,
            broadphase = this.broadphase,
            t0, t1;
        if(doProfiling){
            t0 = now();
            vecCount = 0; // Start counting vector creations
            matCount = 0;
        }

        // Reset forces, add gravity
        for(var i=0; i!==Nbodies; i++)
            Vcopy(g,bodies[i].force);

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

            Vsub(bodyA.position,bodyB.position,r);
            Vsub(bodyA.velocity,bodyB.velocity,u);
            var rlen = V.norm(r);
            V.normalize(r,r_unit);
            Vscale(r_unit, k*(rlen-l) + d*V.dot(u,r_unit), f);
            Vsub(bodyA.force, f, bodyA.force);
            Vadd(bodyB.force, f, bodyB.force);
        }

        // Broadphase
        var result = broadphase.getCollisionPairs(this);

        // Nearphase
        var oldContacts = this.contacts.concat(this.oldContacts);
        var contacts = this.contacts = [];
        var Circle = p2.Circle,
            Plane = p2.Plane,
            Particle = p2.Particle;
        for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
            var bi = result[i];
            var bj = result[i+1];
            var si = bi.shape;
            var sj = bj.shape;
            if(si instanceof p2.Circle){
                     if(sj instanceof Circle)   nearphaseCircleCircle  (bi,bj,contacts,oldContacts);
                else if(sj instanceof Particle) nearphaseCircleParticle(bi,bj,contacts,oldContacts);
                else if(sj instanceof Plane)    nearphaseCirclePlane   (bi,bj,contacts,oldContacts);
            } else if(si instanceof Particle){
                     if(sj instanceof Circle)   nearphaseCircleParticle(bj,bi,contacts,oldContacts);
            } else if(si instanceof Plane){
                     if(sj instanceof Circle)   nearphaseCirclePlane   (bj,bi,contacts,oldContacts);
            }
        }
        this.oldContacts = oldContacts;

        // Solver
        for(var i=0, Ncontacts=contacts.length; i!==Ncontacts; i++){
            solver.addEquation(contacts[i]);
        }
        solver.solve(dt,this);
        solver.removeAllEquations();

        // Step
        var fhMinv = step_fhMinv;
        var velodt = step_velodt;
        for(var i=0; i!==Nbodies; i++){
            var body = bodies[i];
            if(body.mass>0){
                var minv = 1.0 / body.mass,
                    f = body.force,
                    pos = body.position,
                    velo = body.velocity;
                body.angularVelocity += body.angularForce * body.invInertia * dt;
                Vscale(f,dt*minv,fhMinv);
                Vadd(fhMinv,velo,velo);
                Vscale(velo,dt,velodt);
                Vadd(pos,velodt,pos);
            }
        }

        if(doProfiling){
            t1 = now();
            this.lastStepTime = t1-t0;
            this.vecCreations = vecCount;
            this.matCreations = matCount;
        }
    };

    /**
     * Add a spring to the simulation
     *
     * @method
     * @memberof p2.World
     * @param {p2.Spring} s
     */
    p2.World.prototype.addSpring = function(s){
        this.springs.push(s);
    };

    /**
     * Remove a spring
     *
     * @method
     * @memberof p2.World
     * @param {p2.Spring} s
     */
    p2.World.prototype.removeSpring = function(s){
        var idx = this.springs.indexOf(s);
        if(idx===-1)
            this.springs.splice(idx,1);
    };

    /**
     * Add a body to the simulation
     *
     * @method
     * @memberof p2.World
     * @param {p2.Body} body
     */
    p2.World.prototype.addBody = function(body){
        this.bodies.push(body);
        this.collidingBodies.push(body);
    };

    /**
     * Remove a body from the simulation
     *
     * @method
     * @memberof p2.World
     * @param {p2.Body} body
     */
    p2.World.prototype.removeBody = function(body){
        var idx = this.bodies.indexOf(body);
        if(idx===-1)
            this.bodies.splice(idx,1);
    };
