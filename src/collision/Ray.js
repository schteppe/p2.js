module.exports = Ray;

var vec2 = require('../math/vec2');
var RaycastResult = require('../collision/RaycastResult');
var Shape = require('../shapes/Shape');
var AABB = require('../collision/AABB');

/**
 * A line with a start and end point that is used to intersect shapes. For an example, see {{#crossLink "World/raycast:method"}}World.raycast{{/crossLink}}
 * @class Ray
 * @constructor
 * @param {object} [options]
 * @param {array} [options.from]
 * @param {array} [options.to]
 * @param {boolean} [options.checkCollisionResponse=true]
 * @param {boolean} [options.skipBackfaces=false]
 * @param {number} [options.collisionMask=-1]
 * @param {number} [options.collisionGroup=-1]
 * @param {number} [options.mode=Ray.ANY]
 * @param {number} [options.callback]
 */
function Ray(options){
    options = options || {};

    /**
     * Ray start point.
     * @property {array} from
     */
    this.from = options.from ? vec2.fromValues(options.from[0], options.from[1]) : vec2.create();

    /**
     * Ray end point
     * @property {array} to
     */
    this.to = options.to ? vec2.fromValues(options.to[0], options.to[1]) : vec2.create();

    /**
     * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
     * @property {Boolean} checkCollisionResponse
     */
    this.checkCollisionResponse = options.checkCollisionResponse !== undefined ? options.checkCollisionResponse : true;

    /**
     * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
     * @property {Boolean} skipBackfaces
     */
    this.skipBackfaces = !!options.skipBackfaces;

    /**
     * @property {number} collisionMask
     * @default -1
     */
    this.collisionMask = options.collisionMask !== undefined ? options.collisionMask : -1;

    /**
     * @property {number} collisionGroup
     * @default -1
     */
    this.collisionGroup = options.collisionGroup !== undefined ? options.collisionGroup : -1;

    /**
     * The intersection mode. Should be {{#crossLink "Ray/ANY:property"}}Ray.ANY{{/crossLink}}, {{#crossLink "Ray/ALL:property"}}Ray.ALL{{/crossLink}} or {{#crossLink "Ray/CLOSEST:property"}}Ray.CLOSEST{{/crossLink}}.
     * @property {number} mode
     */
    this.mode = options.mode !== undefined ? options.mode : Ray.ANY;

    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     * @property {Function} callback
     */
    this.callback = options.callback || function(result){};

    /**
     * @readOnly
     * @property {array} direction
     */
    this.direction = vec2.create();

    /**
     * Length of the ray
     * @readOnly
     * @property {number} length
     */
    this.length = 1;

    this.update();
}
Ray.prototype.constructor = Ray;

/**
 * This raycasting mode will make the Ray traverse through all intersection points and only return the closest one.
 * @static
 * @property {Number} CLOSEST
 */
Ray.CLOSEST = 1;

/**
 * This raycasting mode will make the Ray stop when it finds the first intersection point.
 * @static
 * @property {Number} ANY
 */
Ray.ANY = 2;

/**
 * This raycasting mode will traverse all intersection points and executes a callback for each one.
 * @static
 * @property {Number} ALL
 */
Ray.ALL = 4;

/**
 * Should be called if you change the from or to point.
 * @method update
 */
Ray.prototype.update = function(){

    // Update .direction and .length
    var d = this.direction;
    vec2.sub(d, this.to, this.from);
    this.length = vec2.length(d);
    vec2.normalize(d, d);

};

/**
 * @method intersectBodies
 * @param {Array} bodies An array of Body objects.
 */
Ray.prototype.intersectBodies = function (result, bodies) {
    for (var i = 0, l = bodies.length; !result.shouldStop(this) && i < l; i++) {
        var body = bodies[i];
        var aabb = body.getAABB();
        if(aabb.overlapsRay(this) >= 0 || aabb.containsPoint(this.from)){
            this.intersectBody(result, body);
        }
    }
};

var intersectBody_worldPosition = vec2.create();

/**
 * Shoot a ray at a body, get back information about the hit.
 * @method intersectBody
 * @private
 * @param {Body} body
 */
Ray.prototype.intersectBody = function (result, body) {
    var checkCollisionResponse = this.checkCollisionResponse;

    if(checkCollisionResponse && !body.collisionResponse){
        return;
    }

    var worldPosition = intersectBody_worldPosition;

    for (var i = 0, N = body.shapes.length; i < N; i++) {
        var shape = body.shapes[i];

        if(checkCollisionResponse && !shape.collisionResponse){
            continue; // Skip
        }

        if((this.collisionGroup & shape.collisionMask) === 0 || (shape.collisionGroup & this.collisionMask) === 0){
            continue;
        }

        // Get world angle and position of the shape
        vec2.rotate(worldPosition, shape.position, body.angle);
        vec2.add(worldPosition, worldPosition, body.position);
        var worldAngle = shape.angle + body.angle;

        this.intersectShape(
            result,
            shape,
            worldAngle,
            worldPosition,
            body
        );

        if(result.shouldStop(this)){
            break;
        }
    }
};

/**
 * @method intersectShape
 * @private
 * @param {Shape} shape
 * @param {number} angle
 * @param {array} position
 * @param {Body} body
 */
Ray.prototype.intersectShape = function(result, shape, angle, position, body){
    var from = this.from;

    // Checking radius
    var distance = distanceFromIntersectionSquared(from, this.direction, position);
    if (distance > shape.boundingRadius * shape.boundingRadius) {
        return;
    }

    this._currentBody = body;
    this._currentShape = shape;

    shape.raycast(result, this, position, angle);

    this._currentBody = this._currentShape = null;
};

/**
 * Get the AABB of the ray.
 * @method getAABB
 * @param  {AABB} aabb
 */
Ray.prototype.getAABB = function(result){
    var to = this.to;
    var from = this.from;
    vec2.set(
        result.lowerBound,
        Math.min(to[0], from[0]),
        Math.min(to[1], from[1])
    );
    vec2.set(
        result.upperBound,
        Math.max(to[0], from[0]),
        Math.max(to[1], from[1])
    );
};

var hitPointWorld = vec2.create();

/**
 * @method reportIntersection
 * @private
 * @param  {number} fraction
 * @param  {array} normal
 * @param  {number} [faceIndex=-1]
 * @return {boolean} True if the intersections should continue
 */
Ray.prototype.reportIntersection = function(result, fraction, normal, faceIndex){
    var from = this.from;
    var to = this.to;
    var shape = this._currentShape;
    var body = this._currentBody;

    // Skip back faces?
    if(this.skipBackfaces && vec2.dot(normal, this.direction) > 0){
        return;
    }

    switch(this.mode){

    case Ray.ALL:
        result.set(
            normal,
            shape,
            body,
            fraction,
            faceIndex
        );
        this.callback(result);
        break;

    case Ray.CLOSEST:

        // Store if closer than current closest
        if(fraction < result.fraction || !result.hasHit()){
            result.set(
                normal,
                shape,
                body,
                fraction,
                faceIndex
            );
        }
        break;

    case Ray.ANY:

        // Report and stop.
        result.set(
            normal,
            shape,
            body,
            fraction,
            faceIndex
        );
        break;
    }
};

var v0 = vec2.create(),
    intersect = vec2.create();
function distanceFromIntersectionSquared(from, direction, position) {

    // v0 is vector from from to position
    vec2.sub(v0, position, from);
    var dot = vec2.dot(v0, direction);

    // intersect = direction * dot + from
    vec2.scale(intersect, direction, dot);
    vec2.add(intersect, intersect, from);

    return vec2.squaredDistance(position, intersect);
}

