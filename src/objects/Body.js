
    p2.Spring = function(bodyA,bodyB,options){
        options = options || {};
        this.restLength = options.restLength || 1;
        this.stiffness = options.stiffness || 100;
        this.damping = options.damping || 1;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
    };

    p2.Body = function(options){
        options = options || {};
        if (options.shape === undefined) {
            throw new Error("Bodies must have a shape!"); // ... for now.
        }

        this.shape = options.shape;

        this.mass = options.mass || 0;
        this.invMass = this.mass > 0 ? 1 / this.mass : 0;
        this.inertia = options.inertia || this.mass; // todo
        this.invInertia = this.invMass; // todo

        this.position = options.position || V.create();
        this.velocity = options.velocity || V.create();

        this.vlambda = V.create();
        this.wlambda = 0;

        this.angle = options.angle || 0;
        this.angularVelocity = options.angularVelocity || 0;

        this.force = options.force || V.create();
        this.angularForce = options.angularForce || 0;
    };
