var vec2 = require('../math/vec2');

module.exports = Body;

var zero = vec2.fromValues(0,0);

/**
 * A rigid body. Has got a center of mass, position, velocity and a number of
 * shapes that are used for collisions.
 *
 * @class Body
 * @constructor
 * @param {Object}              [options]
 * @param {Number}              options.mass    A number >= 0. If zero, the body becomes static. Defaults to static [0].
 * @param {Float32Array|Array}  options.position
 * @param {Float32Array|Array}  options.velocity
 * @param {Number}              options.angle
 * @param {Number}              options.angularVelocity
 * @param {Float32Array|Array}  options.force
 * @param {Number}              options.angularForce
 *
 * @todo Should not take mass as argument to Body, but as density to each Shape
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
     * The shapes of the body. The local transform of the shape in .shapes[i] is
     * defined by .shapeOffsets[i] and .shapeAngles[i].
     *
     * @property shapes
     * @type {Array}
     */
    this.shapes = [];

    /**
     * The local shape offsets, relative to the body center of mass. This is an
     * array of Float32Array.
     * @property shapeOffsets
     * @type {Array}
     */
    this.shapeOffsets = [];

    /**
     * The body-local shape angle transforms. This is an array of numbers (angles).
     * @property shapeAngles
     * @type {Array}
     */
    this.shapeAngles = [];

    /**
     * The mass of the body.
     * @property mass
     * @type {number}
     */
    this.mass = options.mass || 0;

    /**
     * The inverse mass of the body.
     * @property invMass
     * @type {number}
     */
    this.invMass = 0;

    /**
     * The inertia of the body around the Z axis.
     * @property inertia
     * @type {number}
     */
    this.inertia = 0;

    /**
     * The inverse inertia of the body.
     * @property invInertia
     * @type {number}
     */
    this.invInertia = 0;

    this.updateMassProperties();

    /**
     * The position of the body
     * @property position
     * @type {Float32Array}
     */
    this.position = vec2.fromValues(0,0);
    if(options.position) vec2.copy(this.position, options.position);

    /**
     * The velocity of the body
     * @property velocity
     * @type {Float32Array}
     */
    this.velocity = vec2.fromValues(0,0);
    if(options.velocity) vec2.copy(this.velocity, options.velocity);

    /**
     * Constraint velocity that was added to the body during the last step.
     * @property vlambda
     * @type {Float32Array}
     */
    this.vlambda = vec2.fromValues(0,0);

    /**
     * Angular constraint velocity that was added to the body during last step.
     * @property wlambda
     * @type {Float32Array}
     */
    this.wlambda = 0;

    /**
     * The angle of the body
     * @property angle
     * @type {number}
     */
    this.angle = options.angle || 0;

    /**
     * The angular velocity of the body
     * @property angularVelocity
     * @type {number}
     */
    this.angularVelocity = options.angularVelocity || 0;

    /**
     * The force acting on the body
     * @property force
     * @type {Float32Array}
     */
    this.force = vec2.create();
    if(options.force) vec2.copy(this.force, options.force);

    /**
     * The angular force acting on the body
     * @property angularForce
     * @type {number}
     */
    this.angularForce = options.angularForce || 0;

    /**
     * The type of motion this body has. Should be one of: Body.STATIC (the body
     * does not move), Body.DYNAMIC (body can move and respond to collisions)
     * and Body.KINEMATIC (only moves according to its .velocity).
     *
     * @property motionState
     * @type {number}
     */
    this.motionState = this.mass == 0 ? Body.STATIC : Body.DYNAMIC;

    /**
     * Bounding box max point, in world coordinates.
     * @property aabbMin
     * @type {Array}
     */
    this.boundingRadius = 0;
};

Body._idCounter = 0;

/**
 * Update the bounding radius of the body. Should be done if any of the shapes
 * are changed.
 * @method updateBoundingRadius
 */
Body.prototype.updateBoundingRadius = function(){
    var shapes = this.shapes,
        shapeOffsets = this.shapeOffsets,
        N = shapes.length,
        radius = 0;

    for(var i=0; i!==N; i++){
        var shape = shapes[i],
            offset = vec2.length(shapeOffsets[i] || zero),
            r = shape.boundingRadius;
        if(offset + r > radius)
            radius = offset + r;
    }

    this.boundingRadius = radius;
};

/**
 * Add a shape to the body. You can pass a local transform when adding a shape,
 * so that the shape gets an offset and angle relative to the body center of mass.
 * Will automatically update the mass properties and bounding radius.
 *
 * @method addShape
 * @param  {Shape}              shape
 * @param  {Float32Array|Array} [offset] Local body offset of the shape.
 * @param  {Number}             [angle]  Local body angle.
 */
Body.prototype.addShape = function(shape,offset,angle){
    this.shapes      .push(shape);
    this.shapeOffsets.push(offset);
    this.shapeAngles .push(angle);
    this.updateMassProperties();
    this.updateBoundingRadius();
};

/**
 * Updates .inertia, .invMass, .invInertia for this Body. Should be called when
 * changing the structure or mass of the Body.
 *
 * @method updateMassProperties
 */
Body.prototype.updateMassProperties = function(){
    var shapes = this.shapes,
        N = shapes.length,
        m = this.mass / N,
        I = 0;

    for(var i=0; i<N; i++){
        var shape = shapes[i],
            r2 = vec2.squaredLength(this.shapeOffsets[i] || zero),
            Icm = shape.computeMomentOfInertia(m);
        I += Icm + m*r2;
    }

    this.inertia = I;

    // Inverse mass properties are easy
    this.invMass = this.mass > 0 ? 1/this.mass : 0;
    this.invInertia = I>0 ? 1/I : 0;
};

var Body_applyForce_r = vec2.create();

/**
 * Apply force to a world point. This could for example be a point on the RigidBody surface. Applying force this way will add to Body.force and Body.angularForce.
 * @method applyForce
 * @param {Float32Array} force The force to add.
 * @param {Float32Array} worldPoint A world point to apply the force on.
 */
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

/**
 * Transform a world point to local body frame.
 * @method toLocalFrame
 * @param  {Float32Array|Array} out          The vector to store the result in
 * @param  {Float32Array|Array} worldPoint   The input world vector
 */
Body.prototype.toLocalFrame = function(out, worldPoint){
    vec2.toLocalFrame(out, worldPoint, this.position, this.angle);
};

/**
 * Transform a local point to world frame.
 * @method toWorldFrame
 * @param  {Array} out          The vector to store the result in
 * @param  {Array} localPoint   The input local vector
 */
Body.prototype.toWorldFrame = function(out, localPoint){
    vec2.toGlobalFrame(out, localPoint, this.position, this.angle);
};

/**
 * Dynamic body.
 * @property DYNAMIC
 * @type {Number}
 * @static
 */
Body.DYNAMIC = 1;

/**
 * Static body.
 * @property STATIC
 * @type {Number}
 * @static
 */
Body.STATIC = 2;

/**
 * Kinematic body.
 * @property KINEMATIC
 * @type {Number}
 * @static
 */
Body.KINEMATIC = 4;
