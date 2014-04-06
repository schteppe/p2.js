var vec2 = require('../math/vec2')
,   Shape = require('./Shape')
,   Convex = require('./Convex');

module.exports = Rectangle;

/**
 * Rectangle shape class.
 * @class Rectangle
 * @constructor
 * @param {Number} width Width
 * @param {Number} height Height
 * @extends Convex
 */
function Rectangle(width, height){
    width = width || 1;
    height = height || 1;

    var verts = [   vec2.fromValues(-width/2, -height/2),
                    vec2.fromValues( width/2, -height/2),
                    vec2.fromValues( width/2,  height/2),
                    vec2.fromValues(-width/2,  height/2)];

    /**
     * Total width of the rectangle
     * @property width
     * @type {Number}
     */
    this.width = width;

    /**
     * Total height of the rectangle
     * @property height
     * @type {Number}
     */
    this.height = height;

    Convex.call(this,verts);

    this.type = Shape.RECTANGLE;
}
Rectangle.prototype = new Convex([]);

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Rectangle.prototype.computeMomentOfInertia = function(mass){
    var w = this.width,
        h = this.height;
    return mass * (h*h + w*w) / 12;
};

/**
 * Update the bounding radius
 * @method updateBoundingRadius
 */
Rectangle.prototype.updateBoundingRadius = function(){
    var w = this.width,
        h = this.height;
    this.boundingRadius = Math.sqrt(w*w + h*h) / 2;
};

var corner1 = vec2.create(),
    corner2 = vec2.create(),
    corner3 = vec2.create(),
    corner4 = vec2.create();

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Rectangle.prototype.computeAABB = function(out, position, angle){
   out.setFromPoints(this.vertices,position,angle);
};

Rectangle.prototype.updateArea = function(){
    this.area = this.width * this.height;
};

