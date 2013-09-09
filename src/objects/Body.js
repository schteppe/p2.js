var glMatrix = require("gl-matrix"),
    vec2 = glMatrix.vec2;

exports.Body = Body;
exports.Spring = Spring;

/**
 * A spring, connecting two bodies.
 *
 * @class Spring
 * @constructor
 * @param {p2.Body} bodyA
 * @param {p2.Body} bodyB
 * @param {Object} [options]
 * @param {number} options.restLength A number > 0. Default: 1
 * @param {number} options.stiffness A number >= 0. Default: 100
 * @param {number} options.damping A number >= 0. Default: 1
 */
function Spring(bodyA,bodyB,options){
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
 * @class Body
 * @constructor
 * @param {Object} [options]
 * @param {Shape}   options.shape           Used for collision detection. If absent the body will not collide.
 * @param {number}  options.mass            A number >= 0. If zero, the body becomes static. Defaults to static [0].
 * @param {vec2}    options.position
 * @param {vec2}    options.velocity
 * @param {number}  options.angle
 * @param {number}  options.angularVelocity
 * @param {vec2}    options.force
 * @param {number}  options.angularForce
 */
function Body(options){
    options = options || {};

    /**
     * The body identifyer
     * @property id
     * @type {Number}
     */
    this.id = ++Body._idCounter;

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
    this.position = vec2.create();
    if(options.position) vec2.copy(this.position, options.position);

    /**
     * The velocity of the body
     * @member {vec2}
     * @memberof p2.Body
     */
    this.velocity = vec2.create();
    if(options.velocity) vec2.copy(this.velocity, options.velocity);

    this.vlambda = vec2.create();
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
    this.force = vec2.create();
    if(options.force) vec2.copy(this.force, options.force);

    /**
     * The angular force acting on the body
     *
     * @property angularForce
     * @type {number}
     */
    this.angularForce = options.angularForce || 0;

    /**
     * The type of motion this body has. Should be one of: Body.MotionState.STATIC, Body.MotionState.DYNAMIC and Body.MotionState.KINEMATIC.
     *
     * @property motionState
     * @type {number}
     */
    this.motionState = this.mass == 0 ? Body.MotionState.STATIC : Body.MotionState.DYNAMIC;
};

Body._idCounter = 0;


/**
 * Apply force to a world point. This could for example be a point on the RigidBody surface. Applying force this way will add to Body.force and Body.angularForce.
 * @method
 * @memberof p2.Body
 * @param {vec2} force The force to add.
 * @param {vec2} worldPoint A world point to apply the force on.
 */
var Body_applyForce_r = vec2.create();
Body.prototype.applyForce = function(force,worldPoint){
    // Compute point position relative to the body center
    var r = Body_applyForce_r;
    vec2.sub(r,worldPoint,this.position);

    // Add linear force
    vec2.add(this.force,this.force,force);

    // Compute produced rotational force
    var rotForce = vec2.crossLength(r,force);

    // Add rotational force
    this.angularForce += rotForce;
};

/*
 * The available motionstates.
 * @property MotionState
 * @type {Object}
 */
Body.MotionState = {

    /**
     * Dynamic body.
     * @property DYNAMIC
     * @type {Number}
     * @static
     */
    DYNAMIC : 1,

    /**
     * Static body.
     * @property STATIC
     * @type {Number}
     * @static
     */
    STATIC : 2,

    /**
     * Kinematic body.
     * @property KINEMATIC
     * @type {Number}
     * @static
     */
    KINEMATIC : 4
};
