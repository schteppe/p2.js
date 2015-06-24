var Shape = require('./Shape')
,   vec2 = require('../math/vec2');

module.exports = Line;

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 * @class Line
 * @param {Number} [length=1] The total length of the line
 * @extends Shape
 * @constructor
 */
function Line(length) {

    /**
     * Length of this line
     * @property length
     * @type {Number}
     * @default 1
     */
    this.length = length || 1;

    var halfLength = this.length / 2;
    this.points = [
        vec2.fromValues(-halfLength, 0),
        vec2.fromValues( halfLength, 0)
    ];

    Shape.call(this, Shape.LINE);
}
Line.prototype = new Shape();
Line.prototype.constructor = Line;

/**
 * Constructs a line segment between two points
 * @method fromPoints
 * @param  {Number} x1 The x coordinate of the first point
 * @param  {Number} y1 The y coordinate of the first point
 * @param  {Number} x2 The x coordinate of the second point
 * @param  {Number} y2 The y coordinate of the second point
 */
Line.fromPoints = function(x1, y1, x2, y2) {
    var line = new Line();

    vec2.set(line.points[0], x1, y1);
    vec2.set(line.points[1], x2, y2);

    var dx = x2 - x1;
    var dy = y2 - y1;
    line.length = Math.sqrt(dx*dx + dy*dy);

    return line;
};

Line.prototype.computeMomentOfInertia = function(mass) {
    return mass * Math.pow(this.length,2) / 12;
};

Line.prototype.updateBoundingRadius = function() {
    this.boundingRadius = this.length/2;
};

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Line.prototype.computeAABB = function(out, position, angle) {
    out.setFromPoints(this.points, position, angle, 0);
};
