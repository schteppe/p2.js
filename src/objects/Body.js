    /**
     * A spring, connecting two bodies.
     * 
     * Options
     * - restLength: A number > 0. Default is 1.
     * - stiffness: A number >= 0 . Default is 100.
     * - damping: A number >= 0.
     * 
     * @class
     * @param {p2.Body} bodyA
     * @param {p2.Body} bodyB
     * @param {Object} options
     */
    p2.Spring = function(bodyA,bodyB,options){
        options = options || {};
        this.restLength = options.restLength || 1;
        this.stiffness = options.stiffness || 100;
        this.damping = options.damping || 1;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
    };
    
    /**
     * A physics body.
     * 
     * Options:
     * - mass: A number >= 0. If zero, the body becomes static. Default is 0.
     * - position (vec2)
     * - velocity (vec2)
     * - angle (vec2)
     * - angularVelocity (vec2)
     * - force (vec2)
     * - angularForce (vec2)
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
