module.exports = Shape;

var vec2 = require('../math/vec2');

/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 * @param {object} [options]
 * @param {array} [options.position]
 * @param {number} [options.angle=0]
 * @param {number} [options.collisionGroup=1]
 * @param {number} [options.collisionMask=1]
 * @param {boolean} [options.sensor=false]
 * @param {boolean} [options.collisionResponse=true]
 * @param {object} [options.type=0]
 */
function Shape(options){
    options = options || {};

    /**
     * The body this shape is attached to. A shape can only be attached to a single body.
     * @property {Body} body
     */
    this.body = null;

    /**
     * Body-local position of the shape.
     * @property {Array} position
     */
    this.position = vec2.fromValues(0,0);
    if(options.position){
        vec2.copy(this.position, options.position);
    }

    /**
     * Body-local angle of the shape.
     * @property {number} angle
     */
    this.angle = options.angle || 0;

    /**
     * The type of the shape. One of:
     *
     * * {{#crossLink "Shape/CIRCLE:property"}}Shape.CIRCLE{{/crossLink}}
     * * {{#crossLink "Shape/PARTICLE:property"}}Shape.PARTICLE{{/crossLink}}
     * * {{#crossLink "Shape/PLANE:property"}}Shape.PLANE{{/crossLink}}
     * * {{#crossLink "Shape/CONVEX:property"}}Shape.CONVEX{{/crossLink}}
     * * {{#crossLink "Shape/LINE:property"}}Shape.LINE{{/crossLink}}
     * * {{#crossLink "Shape/BOX:property"}}Shape.BOX{{/crossLink}}
     * * {{#crossLink "Shape/CAPSULE:property"}}Shape.CAPSULE{{/crossLink}}
     * * {{#crossLink "Shape/HEIGHTFIELD:property"}}Shape.HEIGHTFIELD{{/crossLink}}
     *
     * @property {number} type
     */
    this.type = options.type || 0;

    /**
     * Shape object identifier.
     * @type {Number}
     * @property id
     */
    this.id = Shape.idCounter++;

    /**
     * Bounding circle radius of this shape
     * @property boundingRadius
     * @type {Number}
     */
    this.boundingRadius = 0;

    /**
     * Collision group that this shape belongs to (bit mask). See <a href="http://www.aurelienribon.com/blog/2011/07/box2d-tutorial-collision-filtering/">this tutorial</a>.
     * @property collisionGroup
     * @type {Number}
     * @example
     *     // Setup bits for each available group
     *     var PLAYER = Math.pow(2,0),
     *         ENEMY =  Math.pow(2,1),
     *         GROUND = Math.pow(2,2)
     *
     *     // Put shapes into their groups
     *     player1Shape.collisionGroup = PLAYER;
     *     player2Shape.collisionGroup = PLAYER;
     *     enemyShape  .collisionGroup = ENEMY;
     *     groundShape .collisionGroup = GROUND;
     *
     *     // Assign groups that each shape collide with.
     *     // Note that the players can collide with ground and enemies, but not with other players.
     *     player1Shape.collisionMask = ENEMY | GROUND;
     *     player2Shape.collisionMask = ENEMY | GROUND;
     *     enemyShape  .collisionMask = PLAYER | GROUND;
     *     groundShape .collisionMask = PLAYER | ENEMY;
     *
     * @example
     *     // How collision check is done
     *     if(shapeA.collisionGroup & shapeB.collisionMask)!=0 && (shapeB.collisionGroup & shapeA.collisionMask)!=0){
     *         // The shapes will collide
     *     }
     */
    this.collisionGroup = options.collisionGroup !== undefined ? options.collisionGroup : 1;

    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this shape will move through other body shapes, but it will still trigger contact events, etc.
     * @property {Boolean} collisionResponse
     */
    this.collisionResponse = options.collisionResponse !== undefined ? options.collisionResponse : true;

    /**
     * Collision mask of this shape. See .collisionGroup.
     * @property collisionMask
     * @type {Number}
     */
    this.collisionMask = options.collisionMask !== undefined ? options.collisionMask : 1;

    /**
     * Material to use in collisions for this Shape. If this is set to null, the world will use default material properties instead.
     * @property material
     * @type {Material}
     */
    this.material = options.material || null;

    /**
     * Area of this shape.
     * @property area
     * @type {Number}
     */
    this.area = 0;

    /**
     * Set to true if you want this shape to be a sensor. A sensor does not generate contacts, but it still reports contact events. This is good if you want to know if a shape is overlapping another shape, without them generating contacts.
     * @property {Boolean} sensor
     */
    this.sensor = options.sensor !== undefined ? options.sensor : false;

    if(this.type){
        this.updateBoundingRadius();
    }

    this.updateArea();
}

Shape.idCounter = 0;

/**
 * @static
 * @property {Number} CIRCLE
 */
Shape.CIRCLE =      1;

/**
 * @static
 * @property {Number} PARTICLE
 */
Shape.PARTICLE =    2;

/**
 * @static
 * @property {Number} PLANE
 */
Shape.PLANE =       4;

/**
 * @static
 * @property {Number} CONVEX
 */
Shape.CONVEX =      8;

/**
 * @static
 * @property {Number} LINE
 */
Shape.LINE =        16;

/**
 * @static
 * @property {Number} BOX
 */
Shape.BOX =   32;

Object.defineProperty(Shape, 'RECTANGLE', {
    get: function() {
        console.warn('Shape.RECTANGLE is deprecated, use Shape.BOX instead.');
        return Shape.BOX;
    }
});

/**
 * @static
 * @property {Number} CAPSULE
 */
Shape.CAPSULE =     64;

/**
 * @static
 * @property {Number} HEIGHTFIELD
 */
Shape.HEIGHTFIELD = 128;

/**
 * Should return the moment of inertia around the Z axis of the body given the total mass. See <a href="http://en.wikipedia.org/wiki/List_of_moments_of_inertia">Wikipedia's list of moments of inertia</a>.
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number} If the inertia is infinity or if the object simply isn't possible to rotate, return 0.
 */
Shape.prototype.computeMomentOfInertia = function(mass){};

/**
 * Returns the bounding circle radius of this shape.
 * @method updateBoundingRadius
 * @return {Number}
 */
Shape.prototype.updateBoundingRadius = function(){};

/**
 * Update the .area property of the shape.
 * @method updateArea
 */
Shape.prototype.updateArea = function(){
    // To be implemented in all subclasses
};

/**
 * Compute the world axis-aligned bounding box (AABB) of this shape.
 * @method computeAABB
 * @param  {AABB} out The resulting AABB.
 * @param  {Array} position World position of the shape.
 * @param  {Number} angle World angle of the shape.
 */
Shape.prototype.computeAABB = function(out, position, angle){
    // To be implemented in each subclass
};

/**
 * Perform raycasting on this shape.
 * @method raycast
 * @param  {RayResult} result Where to store the resulting data.
 * @param  {Ray} ray The Ray that you want to use for raycasting.
 * @param  {array} position World position of the shape (the .position property will be ignored).
 * @param  {number} angle World angle of the shape (the .angle property will be ignored).
 */
Shape.prototype.raycast = function(result, ray, position, angle){
    // To be implemented in each subclass
};