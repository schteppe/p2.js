var Shape =  require('./Shape')
,    vec2 =  require('../math/vec2')
,    Utils = require('../utils/Utils');

module.exports = Plane;

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends Shape
 * @constructor
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 */
function Plane(options){
    options = options || {};
    options.type = Shape.PLANE;
    Shape.call(this, options);
}
Plane.prototype = new Shape();
Plane.prototype.constructor = Plane;

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 */
Plane.prototype.computeMomentOfInertia = function(mass){
    return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
};

/**
 * Update the bounding radius
 * @method updateBoundingRadius
 */
Plane.prototype.updateBoundingRadius = function(){
    this.boundingRadius = Number.MAX_VALUE;
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Plane.prototype.computeAABB = function(out, position, angle){
    var a = angle % (2 * Math.PI);
    var set = vec2.set;
    var max = 1e7;
    var lowerBound = out.lowerBound;
    var upperBound = out.upperBound;

    // Set max bounds
    set(lowerBound, -max, -max);
    set(upperBound,  max,  max);

    if(a === 0){
        // y goes from -inf to 0
        upperBound[1] = 0;
        // set(lowerBound, -max, -max);
        // set(upperBound,  max,  0);

    } else if(a === Math.PI / 2){

        // x goes from 0 to inf
        lowerBound[0] = 0;
        // set(lowerBound, 0, -max);
        // set(upperBound,      max,  max);

    } else if(a === Math.PI){

        // y goes from 0 to inf
        lowerBound[1] = 0;
        // set(lowerBound, -max, 0);
        // set(upperBound,  max, max);

    } else if(a === 3*Math.PI/2){

        // x goes from -inf to 0
        upperBound[0] = 0;
        // set(lowerBound, -max,     -max);
        // set(upperBound,  0,  max);

    }
};

Plane.prototype.updateArea = function(){
    this.area = Number.MAX_VALUE;
};

var intersectPlane_planePointToFrom = vec2.create();
var intersectPlane_dir_scaled_with_t = vec2.create();
var intersectPlane_hitPoint = vec2.create();
var intersectPlane_normal = vec2.create();
var intersectPlane_len = vec2.create();

/**
 * @method raycast
 * @param  {RayResult} result
 * @param  {Ray} ray
 * @param  {array} position
 * @param  {number} angle
 */
Plane.prototype.raycast = function(result, ray, position, angle){
    var from = ray.from;
    var to = ray.to;
    var direction = ray.direction;
    var planePointToFrom = intersectPlane_planePointToFrom;
    var dir_scaled_with_t = intersectPlane_dir_scaled_with_t;
    var hitPoint = intersectPlane_hitPoint;
    var normal = intersectPlane_normal;
    var len = intersectPlane_len;

    // Get plane normal
    vec2.set(normal, 0, 1);
    vec2.rotate(normal, normal, angle);

    vec2.sub(len, from, position);
    var planeToFrom = vec2.dot(len, normal);
    vec2.sub(len, to, position);
    var planeToTo = vec2.dot(len, normal);

    if(planeToFrom * planeToTo > 0){
        // "from" and "to" are on the same side of the plane... bail out
        return;
    }

    if(vec2.squaredDistance(from, to) < planeToFrom * planeToFrom){
        return;
    }

    var n_dot_dir = vec2.dot(normal, direction);

    vec2.sub(planePointToFrom, from, position);
    var t = -vec2.dot(normal, planePointToFrom) / n_dot_dir / ray.length;

    ray.reportIntersection(result, t, normal, -1);
};