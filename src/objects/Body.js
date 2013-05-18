    /**
     * A spring, connecting two bodies.
     *
     * Options:
     *   - restLength: A number > 0. Default: 1
     *   - stiffness: A number >= 0. Default: 100
     *   - damping: A number >= 0. Default: 1
     *
     * @class
     * @param {p2.Body} bodyA
     * @param {p2.Body} bodyB
     * @param {Object} options
     */
    p2.Spring = function(bodyA,bodyB,options){
        options = options || {};

        /**
         * Rest length of the spring.
         * @member {number}
         * @memberof p2.Spring
         */
        this.restLength = options.restLength || 1;

        /**
         * Stiffness of the spring.
         * @member {number}
         * @memberof p2.Spring
         */
        this.stiffness = options.stiffness || 100;

        /**
         * Damping of the spring.
         * @member {number}
         * @memberof p2.Spring
         */
        this.damping = options.damping || 1;

        /**
         * First connected body.
         * @member {p2.Body}
         * @memberof p2.Spring
         */
        this.bodyA = bodyA;

        /**
         * Second connected body.
         * @member {p2.Body}
         * @memberof p2.Spring
         */
        this.bodyB = bodyB;
    };

    /**
     * A physics body.
     *
     * Options:
     *   - shape: A {p2.Shape} used for collision detection. If absent the body will not collide.
     *   - mass: A number >= 0. If zero, the body becomes static. Defaults to static [0].
     *   - position (vec2)
     *   - velocity (vec2)
     *   - angle (number)
     *   - angularVelocity (number)
     *   - force (vec2)
     *   - angularForce (number)
     *
     * @class
     * @param {Object} options
     */
    p2.Body = function(options){
        options = options || {};

        /**
         * The shape belonging to the body.
         * @member {p2.Shape}
         * @memberof p2.Body
         */
        this.shape = options.shape;

        /**
         * The mass of the body.
         * @member {number}
         * @memberof p2.Body
         */
        this.mass = options.mass || 0;
        this.invMass = this.mass > 0 ? 1 / this.mass : 0;
        this.inertia = options.inertia || this.mass; // todo
        this.invInertia = this.invMass; // todo

        /**
         * The position of the body
         * @member {vec2}
         * @memberof p2.Body
         */
        this.position = options.position || V.create();

        /**
         * The velocity of the body
         * @member {vec2}
         * @memberof p2.Body
         */
        this.velocity = options.velocity || V.create();

        this.vlambda = V.create();
        this.wlambda = 0;

        /**
         * The angle of the body
         * @member {number}
         * @memberof p2.Body
         */
        this.angle = options.angle || 0;

        /**
         * The angular velocity of the body
         * @member {number}
         * @memberof p2.Body
         */
        this.angularVelocity = options.angularVelocity || 0;

        /**
         * The force acting on the body
         * @member {vec2}
         * @memberof p2.Body
         */
        this.force = options.force || V.create();

        /**
         * The angular force acting on the body
         * @member {number}
         * @memberof p2.Body
         */
        this.angularForce = options.angularForce || 0;
    };
