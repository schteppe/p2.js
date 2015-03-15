module.exports = Ray;

var vec2 = require('../math/vec2');
var RaycastResult = require('../collision/RaycastResult');
var Shape = require('../shapes/Shape');
var AABB = require('../collision/AABB');

/**
 * A line with a start and end point that is used to intersect shapes.
 * @class Ray
 * @constructor
 */
function Ray(options){

    /**
     * @property {array} from
     */
    this.from = options.from ? vec2.fromValues(options.from[0], options.from[1]) : vec2.create();

    /**
     * @property {array} to
     */
    this.to = options.to ? vec2.fromValues(options.to[0], options.to[1]) : vec2.create();

    /**
     * @private
     * @property {array} _direction
     */
    this._direction = vec2.create();

    /**
     * The precision of the ray. Used when checking parallelity etc.
     * @property {Number} precision
     */
    this.precision = 0.0001;

    /**
     * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
     * @property {Boolean} checkCollisionResponse
     */
    this.checkCollisionResponse = true;

    /**
     * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
     * @property {Boolean} skipBackfaces
     */
    this.skipBackfaces = false;

    /**
     * @property {number} collisionMask
     * @default -1
     */
    this.collisionMask = -1;

    /**
     * @property {number} collisionGroup
     * @default -1
     */
    this.collisionGroup = -1;

    /**
     * The intersection mode. Should be Ray.ANY, Ray.ALL or Ray.CLOSEST.
     * @property {number} mode
     */
    this.mode = Ray.ANY;

    /**
     * Current result object.
     * @property {RaycastResult} result
     */
    this.result = new RaycastResult();

    /**
     * Will be set to true during intersectWorld() if the ray hit anything.
     * @property {Boolean} hasHit
     */
    this.hasHit = false;

    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     * @property {Function} callback
     */
    this.callback = function(result){};
}
Ray.prototype.constructor = Ray;

Ray.CLOSEST = 1;
Ray.ANY = 2;
Ray.ALL = 4;

var tmpAABB = new AABB();
var tmpArray = [];

/**
 * Do itersection against all bodies in the given World.
 * @method intersectWorld
 * @param  {World} world
 * @param  {object} options
 * @return {Boolean} True if the ray hit anything, otherwise false.
 */
Ray.prototype.intersectWorld = function (world, options) {
    this.mode = options.mode || Ray.ANY;
    this.result = options.result || new RaycastResult();
    this.skipBackfaces = !!options.skipBackfaces;
    this.collisionMask = typeof(options.collisionMask) !== 'undefined' ? options.collisionMask : -1;
    this.collisionGroup = typeof(options.collisionGroup) !== 'undefined' ? options.collisionGroup : -1;
    if(options.from){
        this.from.copy(options.from);
    }
    if(options.to){
        this.to.copy(options.to);
    }
    this.callback = options.callback || function(){};
    this.hasHit = false;

    this.result.reset();
    this._updateDirection();

    this.getAABB(tmpAABB);
    tmpArray.length = 0;
    world.broadphase.aabbQuery(world, tmpAABB, tmpArray);
    this.intersectBodies(tmpArray);

    return this.hasHit;
};

var v1 = vec2.create(),
    v2 = vec2.create();

var intersectBody_worldPosition = vec2.create();

/**
 * Shoot a ray at a body, get back information about the hit.
 * @method intersectBody
 * @private
 * @param {Body} body
 * @param {RaycastResult} [result] Deprecated - set the result property of the Ray instead.
 */
Ray.prototype.intersectBody = function (body, result) {

    if(result){
        this.result = result;
        this._updateDirection();
    }
    var checkCollisionResponse = this.checkCollisionResponse;

    if(checkCollisionResponse && !body.collisionResponse){
        return;
    }

    // if((this.collisionGroup & body.collisionMask)===0 || (body.collisionGroup & this.collisionMask)===0){
    //     return;
    // }

    var worldPosition = intersectBody_worldPosition;

    for (var i = 0, N = body.shapes.length; i < N; i++) {
        var shape = body.shapes[i];

        if(checkCollisionResponse && !shape.collisionResponse){
            continue; // Skip
        }

        // Get world angle and position of the shape
        vec2.rotate(worldPosition, worldPosition, body.angle);
        vec2.add(worldPosition, worldPosition, body.position);
        var worldAngle = body.shapeAngles[i] + body.angle;

        this.intersectShape(
            shape,
            worldAngle,
            worldPosition,
            body
        );

        if(this.result._shouldStop){
            break;
        }
    }
};

/**
 * @method intersectBodies
 * @param {Array} bodies An array of Body objects.
 * @param {RaycastResult} [result] Deprecated
 */
Ray.prototype.intersectBodies = function (bodies, result) {
    if(result){
        this.result = result;
        this._updateDirection();
    }

    for ( var i = 0, l = bodies.length; !this.result._shouldStop && i < l; i ++ ) {
        this.intersectBody(bodies[i]);
    }
};

/**
 * Updates the _direction vector.
 * @private
 * @method _updateDirection
 */
Ray.prototype._updateDirection = function(){
    var d = this._direction;
    vec2.sub(d, this.to, this.from); // this.to.vsub(this.from, this._direction);
    vec2.normalize(d, d); // this._direction.normalize();
};

/**
 * @method intersectShape
 * @private
 * @param {Shape} shape
 * @param {number} angle
 * @param {array} position
 * @param {Body} body
 */
Ray.prototype.intersectShape = function(shape, angle, position, body){
    var from = this.from;


    // Checking boundingSphere
    var distance = distanceFromIntersection(from, this._direction, position);
    if ( distance > shape.boundingSphereRadius ) {
        return;
    }

    this[shape.type](shape, angle, position, body);
};

var vector = vec2.create();
var normal = vec2.create();
var intersectPoint = vec2.create();

var a = vec2.create();
var b = vec2.create();
var c = vec2.create();
var d = vec2.create();

var tmpRaycastResult = new RaycastResult();

/**
 * @method intersectRectangle
 * @private
 * @param  {Shape} shape
 * @param  {number} angle
 * @param  {array} position
 * @param  {Body} body
 */
Ray.prototype.intersectRectangle = function(shape, angle, position, body){
    // TODO
};
Ray.prototype[Shape.RECTANGLE] = Ray.prototype.intersectRectangle;

/**
 * @method intersectPlane
 * @private
 * @param  {Shape} shape
 * @param  {number} angle
 * @param  {array} position
 * @param  {Body} body
 */
Ray.prototype.intersectPlane = function(shape, angle, position, body){
    var from = this.from;
    var to = this.to;
    var direction = this._direction;

    // Get plane normal
    var worldNormal = vec2.fromValues(0, 1);
    vec2.rotate(worldNormal, worldNormal, angle);

    var len = vec2.create();
    vec2.sub(len, from, position); //from.vsub(position, len);
    var planeToFrom = vec2.dot(len, worldNormal); // len.dot(worldNormal);
    vec2.sub(len, to, position); // to.vsub(position, len);
    var planeToTo = vec2.dot(len, worldNormal); // len.dot(worldNormal);

    if(planeToFrom * planeToTo > 0){
        // "from" and "to" are on the same side of the plane... bail out
        return;
    }

    if(vec2.distance(from, to) /* from.distanceTo(to) */ < planeToFrom){
        return;
    }

    var n_dot_dir = vec2.dot(worldNormal, direction); // worldNormal.dot(direction);

    if (Math.abs(n_dot_dir) < this.precision) {
        // No intersection
        return;
    }

    var planePointToFrom = vec2.create();
    var dir_scaled_with_t = vec2.create();
    var hitPointWorld = vec2.create();

    vec2.sub(planePointToFrom, from, position); // from.vsub(position, planePointToFrom);
    var t = -vec2.dot(worldNormal, planePointToFrom) / n_dot_dir; // - worldNormal.dot(planePointToFrom) / n_dot_dir;
    vec2.scale(dir_scaled_with_t, direction, t); // direction.scale(t, dir_scaled_with_t);
    vec2.add(hitPointWorld, from, dir_scaled_with_t); // from.vadd(dir_scaled_with_t, hitPointWorld);

    this.reportIntersection(worldNormal, hitPointWorld, shape, body, -1);
};
Ray.prototype[Shape.PLANE] = Ray.prototype.intersectPlane;

/**
 * Get the AABB of the ray.
 * @method getAABB
 * @param  {AABB} aabb
 */
Ray.prototype.getAABB = function(result){
    var to = this.to;
    var from = this.from;
    result.lowerBound[0] = Math.min(to[0], from[0]);
    result.lowerBound[1] = Math.min(to[1], from[1]);
    result.upperBound[0] = Math.max(to[0], from[0]);
    result.upperBound[1] = Math.max(to[1], from[1]);
};

/**
 * @method reportIntersection
 * @private
 * @param  {array} normal
 * @param  {array} hitPointWorld
 * @param  {Shape} shape
 * @param  {Body} body
 * @return {boolean} True if the intersections should continue
 */
Ray.prototype.reportIntersection = function(normal, hitPointWorld, shape, body, hitFaceIndex){
    var from = this.from;
    var to = this.to;
    var distance = vec2.distance(from, hitPointWorld); // from.distanceTo(hitPointWorld);
    var result = this.result;

    // Skip back faces?
    if(this.skipBackfaces && /* normal.dot(this._direction) */ vec2.dot(normal, this._direction) > 0){
        return;
    }

    result.hitFaceIndex = typeof(hitFaceIndex) !== 'undefined' ? hitFaceIndex : -1;

    switch(this.mode){
    case Ray.ALL:
        this.hasHit = true;
        result.set(
            from,
            to,
            normal,
            hitPointWorld,
            shape,
            body,
            distance
        );
        result.hasHit = true;
        this.callback(result);
        break;

    case Ray.CLOSEST:

        // Store if closer than current closest
        if(distance < result.distance || !result.hasHit){
            this.hasHit = true;
            result.hasHit = true;
            result.set(
                from,
                to,
                normal,
                hitPointWorld,
                shape,
                body,
                distance
            );
        }
        break;

    case Ray.ANY:

        // Report and stop.
        this.hasHit = true;
        result.hasHit = true;
        result.set(
            from,
            to,
            normal,
            hitPointWorld,
            shape,
            body,
            distance
        );
        result._shouldStop = true;
        break;
    }
};

var v0 = vec2.create(),
    intersect = vec2.create();
function distanceFromIntersection(from, direction, position) {

    // v0 is vector from from to position
    vec2.sub(v0, position, from); // position.vsub(from,v0);
    var dot = vec2.dot(v0, direction); // v0.dot(direction);

    // intersect = direction*dot + from
    vec2.scale(intersect, direction, dot); //direction.mult(dot,intersect);
    vec2.add(intersect, intersect, from); // intersect.vadd(from, intersect);

    var distance = vec2.distance(position, intersect); // position.distanceTo(intersect);

    return distance;
}

