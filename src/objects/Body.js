
    p2.Spring = function(bodyA,bodyB){
        this.restLength = 1;
        this.stiffness = 100;
        this.damping = 1;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
    };

    p2.Body = function(mass,shape){
        this.shape = shape;

        this.mass = mass;
        this.invMass = mass > 0 ? 1/mass : 0;
        this.inertia = mass; // todo
        this.invInertia = this.invMass; // todo

        this.position = V.create();
        this.velocity = V.create();

        this.vlambda = V.create();
        this.wlambda = 0;

        this.angle = 0;
        this.angularVelocity = 0;

        this.force = V.create();
        this.angularForce = 0;
    };
