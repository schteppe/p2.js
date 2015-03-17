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
    options = options || {};

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
        vec2.copy(this.from, options.from);
    }
    if(options.to){
        vec2.copy(this.to, options.to);
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
        vec2.copy(worldPosition, body.shapeOffsets[i]);
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

    var method = this[shape.type];
    if(method){
        method.call(this, shape, angle, position, body);
    }
};

var vector = vec2.create();
var normal = vec2.create();
var intersectPoint = vec2.create();

var a = vec2.create();
var b = vec2.create();
var c = vec2.create();
var d = vec2.create();

var tmpRaycastResult = new RaycastResult();
var intersectRectangle_direction = vec2.create();
var intersectRectangle_rayStart = vec2.create();
var intersectRectangle_worldNormalMin = vec2.create();
var intersectRectangle_worldNormalMax = vec2.create();
var intersectRectangle_hitPointWorld = vec2.create();
var intersectRectangle_boxMin = vec2.create();
var intersectRectangle_boxMax = vec2.create();

/**
 * @method intersectRectangle
 * @private
 * @param  {Shape} shape
 * @param  {number} angle
 * @param  {array} position
 * @param  {Body} body
 */
Ray.prototype.intersectRectangle = function(shape, angle, position, body){
    var tmin = -Number.MAX_VALUE;
    var tmax = Number.MAX_VALUE;

    var direction = intersectRectangle_direction;
    var rayStart = intersectRectangle_rayStart;
    var worldNormalMin = intersectRectangle_worldNormalMin;
    var worldNormalMax = intersectRectangle_worldNormalMax;
    var hitPointWorld = intersectRectangle_hitPointWorld;
    var boxMin = intersectRectangle_boxMin;
    var boxMax = intersectRectangle_boxMax;

    vec2.set(boxMin, -shape.width * 0.5, -shape.height * 0.5);
    vec2.set(boxMax, shape.width * 0.5, shape.height * 0.5);

    // Transform the ray direction and start to local space
    vec2.rotate(direction, this._direction, -angle);
    body.toLocalFrame(rayStart, this.from);

    if (direction[0] !== 0) {
        var tx1 = (boxMin[0] - rayStart[0]) / direction[0];
        var tx2 = (boxMax[0] - rayStart[0]) / direction[0];

        var tminOld = tmin;
        tmin = Math.max(tmin, Math.min(tx1, tx2));
        if(tmin !== tminOld){
            vec2.set(worldNormalMin, tx1 > tx2 ? 1 : -1, 0);
        }

        var tmaxOld = tmax;
        tmax = Math.min(tmax, Math.max(tx1, tx2));
        if(tmax !== tmaxOld){
            vec2.set(worldNormalMax, tx1 < tx2 ? 1 : -1, 0);
        }
    }

    if (direction[1] !== 0) {
        var ty1 = (boxMin[1] - rayStart[1]) / direction[1];
        var ty2 = (boxMax[1] - rayStart[1]) / direction[1];

        var tminOld = tmin;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        if(tmin !== tminOld){
            vec2.set(worldNormalMin, 0, ty1 > ty2 ? 1 : -1);
        }

        var tmaxOld = tmax;
        tmax = Math.min(tmax, Math.max(ty1, ty2));
        if(tmax !== tmaxOld){
            vec2.set(worldNormalMax, 0, ty1 < ty2 ? 1 : -1);
        }
    }

    if(tmax >= tmin){
        // Hit point
        vec2.set(
            hitPointWorld,
            rayStart[0] + direction[0] * tmin,
            rayStart[1] + direction[1] * tmin
        );

        vec2.rotate(worldNormalMin, worldNormalMin, angle);

        body.toWorldFrame(hitPointWorld, hitPointWorld);

        this.reportIntersection(worldNormalMin, hitPointWorld, shape, body, -1);
        if(this._shouldStop){
            return;
        }

        vec2.rotate(worldNormalMax, worldNormalMax, angle);

        // Hit point
        vec2.set(
            hitPointWorld,
            rayStart[0] + direction[0] * tmax,
            rayStart[1] + direction[1] * tmax
        );
        body.toWorldFrame(hitPointWorld, hitPointWorld);

        this.reportIntersection(worldNormalMax, hitPointWorld, shape, body, -1);
    }
};
Ray.prototype[Shape.RECTANGLE] = Ray.prototype.intersectRectangle;

var intersectPlane_planePointToFrom = vec2.create();
var intersectPlane_dir_scaled_with_t = vec2.create();
var intersectPlane_hitPointWorld = vec2.create();
var intersectPlane_worldNormal = vec2.create();
var intersectPlane_len = vec2.create();

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

    var planePointToFrom = intersectPlane_planePointToFrom;
    var dir_scaled_with_t = intersectPlane_dir_scaled_with_t;
    var hitPointWorld = intersectPlane_hitPointWorld;
    var worldNormal = intersectPlane_worldNormal;
    var len = intersectPlane_len;

    // Get plane normal
    vec2.set(worldNormal, 0, 1);
    vec2.rotate(worldNormal, worldNormal, angle);

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

    // if (Math.abs(n_dot_dir) < this.precision) {
    //     // No intersection
    //     return;
    // }

    vec2.sub(planePointToFrom, from, position); // from.vsub(position, planePointToFrom);
    var t = -vec2.dot(worldNormal, planePointToFrom) / n_dot_dir; // - worldNormal.dot(planePointToFrom) / n_dot_dir;
    vec2.scale(dir_scaled_with_t, direction, t); // direction.scale(t, dir_scaled_with_t);
    vec2.add(hitPointWorld, from, dir_scaled_with_t); // from.vadd(dir_scaled_with_t, hitPointWorld);

    this.reportIntersection(worldNormal, hitPointWorld, shape, body, -1);
};
Ray.prototype[Shape.PLANE] = Ray.prototype.intersectPlane;

var Ray_intersectSphere_intersectionPoint = vec2.create();
var Ray_intersectSphere_normal = vec2.create();
Ray.prototype.intersectCircle = function(shape, angle, position, body){
    var from = this.from,
        to = this.to,
        r = shape.radius;

    var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
    var b = 2 * ((to[0] - from[0]) * (from[0] - position[0]) + (to[1] - from[1]) * (from[1] - position[1]));
    var c = Math.pow(from[0] - position[0], 2) + Math.pow(from[1] - position[1], 2) - Math.pow(r, 2);

    var delta = Math.pow(b, 2) - 4 * a * c;

    var intersectionPoint = Ray_intersectSphere_intersectionPoint;
    var normal = Ray_intersectSphere_normal;

    if(delta < 0){
        // No intersection
        return;

    } else if(delta === 0){
        // single intersection point
        vec2.lerp(intersectionPoint, from, to, delta); // from.lerp(to, delta, intersectionPoint);

        vec2.sub(normal, intersectionPoint, position); // intersectionPoint.vsub(position, normal);
        vec2.normalize(normal,normal); //normal.normalize();

        this.reportIntersection(normal, intersectionPoint, shape, body, -1);

    } else {
        var d1 = (- b - Math.sqrt(delta)) / (2 * a);
        var d2 = (- b + Math.sqrt(delta)) / (2 * a);

        vec2.lerp(intersectionPoint, from, to, d1); // from.lerp(to, d1, intersectionPoint);

        vec2.sub(normal, intersectionPoint, position); // intersectionPoint.vsub(position, normal);
        vec2.normalize(normal,normal); //normal.normalize();

        this.reportIntersection(normal, intersectionPoint, shape, body, -1);

        if(this.result._shouldStop){
            return;
        }

        vec2.lerp(intersectionPoint, from, to, d2); // from.lerp(to, d2, intersectionPoint);

        vec2.sub(normal, intersectionPoint, position); // intersectionPoint.vsub(position, normal);
        vec2.normalize(normal,normal); //normal.normalize();

        this.reportIntersection(normal, intersectionPoint, shape, body, -1);
    }
};
Ray.prototype[Shape.CIRCLE] = Ray.prototype.intersectCircle;

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

