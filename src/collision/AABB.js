var vec2 = require('../math/vec2')
,   Utils = require('../utils/Utils');

module.exports = AABB;

/**
 * Axis aligned bounding box class.
 * @class AABB
 * @constructor
 * @param {Object}  [options]
 * @param {Array}   [options.upperBound]
 * @param {Array}   [options.lowerBound]
 */
function AABB(options){

    /**
     * The lower bound of the bounding box.
     * @property lowerBound
     * @type {Array}
     */
    this.lowerBound = vec2.create();
    if(options && options.lowerBound){
        vec2.copy(this.lowerBound, options.lowerBound);
    }

    /**
     * The upper bound of the bounding box.
     * @property upperBound
     * @type {Array}
     */
    this.upperBound = vec2.create();
    if(options && options.upperBound){
        vec2.copy(this.upperBound, options.upperBound);
    }
}

var tmp = vec2.create();

/**
 * Set the AABB bounds from a set of points, transformed by the given position and angle.
 * @method setFromPoints
 * @param {Array} points An array of vec2's.
 * @param {Array} position
 * @param {number} angle
 * @param {number} skinSize Some margin to be added to the AABB.
 */
AABB.prototype.setFromPoints = function(points, position, angle, skinSize){
    var l = this.lowerBound,
        u = this.upperBound;

    if(typeof(angle) !== "number"){
        angle = 0;
    }

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
        vec2.add(this.lowerBound, this.lowerBound, position);
        vec2.add(this.upperBound, this.upperBound, position);
    }

    if(skinSize){
        this.lowerBound[0] -= skinSize;
        this.lowerBound[1] -= skinSize;
        this.upperBound[0] += skinSize;
        this.upperBound[1] += skinSize;
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
    // Loop over x and y
    var i = 2;
    while(i--){
        // Extend lower bound
        var l = aabb.lowerBound[i];
        if(this.lowerBound[i] > l){
            this.lowerBound[i] = l;
        }

        // Upper
        var u = aabb.upperBound[i];
        if(this.upperBound[i] < u){
            this.upperBound[i] = u;
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
 * @return {number} -1 if no hit, a number between 0 and 1 if hit.
 */
AABB.prototype.overlapsRay = function(ray){
    var t = 0;

    // ray.direction is unit direction vector of ray
    var dirFracX = 1 / ray.direction[0];
    var dirFracY = 1 / ray.direction[1];

    // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
    var t1 = (this.lowerBound[0] - ray.from[0]) * dirFracX;
    var t2 = (this.upperBound[0] - ray.from[0]) * dirFracX;
    var t3 = (this.lowerBound[1] - ray.from[1]) * dirFracY;
    var t4 = (this.upperBound[1] - ray.from[1]) * dirFracY;

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

    return tmin;
};