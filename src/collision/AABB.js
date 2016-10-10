var vec2 = require('../math/vec2');

module.exports = AABB;

/**
 * Axis aligned bounding box class.
 * @class AABB
 * @constructor
 * @param {Object}  [options]
 * @param {Array}   [options.upperBound]
 * @param {Array}   [options.lowerBound]
 * @example
 *     var aabb = new AABB({
 *         upperBound: [1, 1],
 *         lowerBound: [-1, -1]
 *     });
 */
function AABB(options){
    options = options || {};

    /**
     * The lower bound of the bounding box.
     * @property lowerBound
     * @type {Array}
     */
    this.lowerBound = options.lowerBound ? vec2.clone(options.lowerBound) : vec2.create();

    /**
     * The upper bound of the bounding box.
     * @property upperBound
     * @type {Array}
     */
    this.upperBound = options.upperBound ? vec2.clone(options.upperBound) : vec2.create();
}

var tmp = vec2.create();

/**
 * Set the AABB bounds from a set of points, transformed by the given position and angle.
 * @method setFromPoints
 * @param {Array} points An array of vec2's.
 * @param {Array} position
 * @param {number} [angle=0]
 * @param {number} [skinSize=0] Some margin to be added to the AABB.
 */
AABB.prototype.setFromPoints = function(points, position, angle, skinSize){
    var l = this.lowerBound,
        u = this.upperBound;

    angle = angle || 0;

    // Set to the first point
    if(angle !== 0){
        vec2.rotate(l, points[0], angle);
    } else {
        vec2.copy(l, points[0]);
    }
    vec2.copy(u, l);

    // Compute cosines and sines just once
    var cosAngle = Math.cos(angle),
        sinAngle = Math.sin(angle);
    for(var i = 1; i<points.length; i++){
        var p = points[i];

        if(angle !== 0){
            var x = p[0],
                y = p[1];
            tmp[0] = cosAngle * x -sinAngle * y;
            tmp[1] = sinAngle * x +cosAngle * y;
            p = tmp;
        }

        for(var j=0; j<2; j++){
            if(p[j] > u[j]){
                u[j] = p[j];
            }
            if(p[j] < l[j]){
                l[j] = p[j];
            }
        }
    }

    // Add offset
    if(position){
        vec2.add(l, l, position);
        vec2.add(u, u, position);
    }

    if(skinSize){
        l[0] -= skinSize;
        l[1] -= skinSize;
        u[0] += skinSize;
        u[1] += skinSize;
    }
};

/**
 * Copy bounds from an AABB to this AABB
 * @method copy
 * @param  {AABB} aabb
 */
AABB.prototype.copy = function(aabb){
    vec2.copy(this.lowerBound, aabb.lowerBound);
    vec2.copy(this.upperBound, aabb.upperBound);
};

/**
 * Extend this AABB so that it covers the given AABB too.
 * @method extend
 * @param  {AABB} aabb
 */
AABB.prototype.extend = function(aabb){
    var lower = this.lowerBound,
        upper = this.upperBound;

    // Loop over x and y
    var i = 2;
    while(i--){
        // Extend lower bound
        var l = aabb.lowerBound[i];
        if(lower[i] > l){
            lower[i] = l;
        }

        // Upper
        var u = aabb.upperBound[i];
        if(upper[i] < u){
            upper[i] = u;
        }
    }
};

/**
 * Returns true if the given AABB overlaps this AABB.
 * @method overlaps
 * @param  {AABB} aabb
 * @return {Boolean}
 */
AABB.prototype.overlaps = function(aabb){
    var l1 = this.lowerBound,
        u1 = this.upperBound,
        l2 = aabb.lowerBound,
        u2 = aabb.upperBound;

    //      l2        u2
    //      |---------|
    // |--------|
    // l1       u1

    return ((l2[0] <= u1[0] && u1[0] <= u2[0]) || (l1[0] <= u2[0] && u2[0] <= u1[0])) &&
           ((l2[1] <= u1[1] && u1[1] <= u2[1]) || (l1[1] <= u2[1] && u2[1] <= u1[1]));
};

/**
 * @method containsPoint
 * @param  {Array} point
 * @return {boolean}
 */
AABB.prototype.containsPoint = function(point){
    var l = this.lowerBound,
        u = this.upperBound;
    return l[0] <= point[0] && point[0] <= u[0] && l[1] <= point[1] && point[1] <= u[1];
};

/**
 * Check if the AABB is hit by a ray.
 * @method overlapsRay
 * @param  {Ray} ray
 * @return {number} -1 if no hit, a number between 0 and 1 if hit, indicating the position between the "from" and "to" points.
 * @example
 *     var aabb = new AABB({
 *         upperBound: [1, 1],
 *         lowerBound: [-1, -1]
 *     });
 *     var ray = new Ray({
 *         from: [-2, 0],
 *         to: [0, 0]
 *     });
 *     var fraction = aabb.overlapsRay(ray); // fraction == 0.5
 */
AABB.prototype.overlapsRay = function(ray){

    // ray.direction is unit direction vector of ray
    var dirFracX = 1 / ray.direction[0];
    var dirFracY = 1 / ray.direction[1];

    // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
    var from = ray.from;
    var lowerBound = this.lowerBound;
    var upperBound = this.upperBound;
    var t1 = (lowerBound[0] - from[0]) * dirFracX;
    var t2 = (upperBound[0] - from[0]) * dirFracX;
    var t3 = (lowerBound[1] - from[1]) * dirFracY;
    var t4 = (upperBound[1] - from[1]) * dirFracY;

    var tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
    var tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));

    // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
    if (tmax < 0){
        //t = tmax;
        return -1;
    }

    // if tmin > tmax, ray doesn't intersect AABB
    if (tmin > tmax){
        //t = tmax;
        return -1;
    }

    return tmin / ray.length;
};