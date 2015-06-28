var Shape = require('./Shape')
,    vec2 = require('../math/vec2')
,    Utils = require('../utils/Utils');

module.exports = Heightfield;

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a distance "elementWidth".
 * @class Heightfield
 * @extends Shape
 * @constructor
 * @param {Array} data An array of Y values that will be used to construct the terrain.
 * @param {object} options
 * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
 * @param {Number} [options.maxValue] Maximum value.
 * @param {Number} [options.elementWidth=0.1] World spacing between the data points in X direction.
 * @todo Should be possible to use along all axes, not just y
 *
 * @example
 *     // Generate some height data (y-values).
 *     var data = [];
 *     for(var i = 0; i < 1000; i++){
 *         var y = 0.5 * Math.cos(0.2 * i);
 *         data.push(y);
 *     }
 *
 *     // Create the heightfield shape
 *     var heightfieldShape = new Heightfield(data, {
 *         elementWidth: 1 // Distance between the data points in X direction
 *     });
 *     var heightfieldBody = new Body();
 *     heightfieldBody.addShape(heightfieldShape);
 *     world.addBody(heightfieldBody);
 */
function Heightfield(data, options){
    options = Utils.defaults(options, {
        maxValue : null,
        minValue : null,
        elementWidth : 0.1
    });

    if(options.minValue === null || options.maxValue === null){
        options.maxValue = data[0];
        options.minValue = data[0];
        for(var i=0; i !== data.length; i++){
            var v = data[i];
            if(v > options.maxValue){
                options.maxValue = v;
            }
            if(v < options.minValue){
                options.minValue = v;
            }
        }
    }

    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     * @property {array} data
     */
    this.data = data;

    /**
     * Max value of the data
     * @property {number} maxValue
     */
    this.maxValue = options.maxValue;

    /**
     * Max value of the data
     * @property {number} minValue
     */
    this.minValue = options.minValue;

    /**
     * The width of each element
     * @property {number} elementWidth
     */
    this.elementWidth = options.elementWidth;

    Shape.call(this,Shape.HEIGHTFIELD);
}
Heightfield.prototype = new Shape();
Heightfield.prototype.constructor = Heightfield;

/**
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Heightfield.prototype.computeMomentOfInertia = function(mass){
    return Number.MAX_VALUE;
};

Heightfield.prototype.updateBoundingRadius = function(){
    this.boundingRadius = Number.MAX_VALUE;
};

Heightfield.prototype.updateArea = function(){
    var data = this.data,
        area = 0;
    for(var i=0; i<data.length-1; i++){
        area += (data[i]+data[i+1]) / 2 * this.elementWidth;
    }
    this.area = area;
};

var points = [
    vec2.create(),
    vec2.create(),
    vec2.create(),
    vec2.create()
];

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Heightfield.prototype.computeAABB = function(out, position, angle){
    vec2.set(points[0], 0, this.maxValue);
    vec2.set(points[1], this.elementWidth * this.data.length, this.maxValue);
    vec2.set(points[2], this.elementWidth * this.data.length, this.minValue);
    vec2.set(points[3], 0, this.minValue);
    out.setFromPoints(points, position, angle);
};

/**
 * Get a line segment in the heightfield
 * @param  {array} start Where to store the resulting start point
 * @param  {array} end Where to store the resulting end point
 * @param  {number} i
 */
Heightfield.prototype.getLineSegment = function(start, end, i){
    var data = this.data;
    var width = this.elementWidth;
    vec2.set(start, i * width, data[i]);
    vec2.set(end, (i + 1) * width, data[i + 1]);
};

Heightfield.prototype.getSegmentIndex = function(position){
    return Math.floor(position[0] / this.elementWidth);
};

Heightfield.prototype.getClampedSegmentIndex = function(position){
    var i = this.getSegmentIndex(position);
    i = Math.min(this.data.length, Math.max(i, 0)); // clamp
    return i;
};

