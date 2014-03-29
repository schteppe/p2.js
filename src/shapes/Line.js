var Shape = require('./Shape')
,   vec2 = require('../math/vec2')

module.exports = Line;

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 * @class Line
 * @param {Number} length The total length of the line
 * @extends Shape
 * @constructor
 */
function Line(length){

    /**
     * Length of this line
     * @property length
     * @type {Number}
     */
    this.length = length;

    Shape.call(this,Shape.LINE);
};
Line.prototype = new Shape();
Line.prototype.computeMomentOfInertia = function(mass){
    return mass * Math.pow(this.length,2) / 12;
};

Line.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.length/2;
};

var points = [vec2.create(),vec2.create()];

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Line.prototype.computeAABB = function(out, position, angle){
    var l = this.length;
    vec2.set(points[0], -l/2,  0);
    vec2.set(points[1],  l/2,  0);
    out.setFromPoints(points,position,angle);
};

