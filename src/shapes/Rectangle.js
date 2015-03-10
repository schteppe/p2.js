import vec2 from '../math/vec2';
import Shape from './Shape';
import Convex from './Convex';

export default Rectangle;

/**
 * Rectangle shape class.
 * @class Rectangle
 * @constructor
 * @param {Number} [width=1] Width
 * @param {Number} [height=1] Height
 * @extends Convex
 */
function Rectangle(width, height){

    /**
     * Total width of the rectangle
     * @property width
     * @type {Number}
     */
    this.width = width || 1;

    /**
     * Total height of the rectangle
     * @property height
     * @type {Number}
     */
    this.height = height || 1;

    var verts = [   vec2.fromValues(-width/2, -height/2),
                    vec2.fromValues( width/2, -height/2),
                    vec2.fromValues( width/2,  height/2),
                    vec2.fromValues(-width/2,  height/2)];
    var axes = [vec2.fromValues(1, 0), vec2.fromValues(0, 1)];

    Convex.call(this, verts, axes);

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
    out.setFromPoints(this.vertices,position,angle,0);
};

Rectangle.prototype.updateArea = function(){
    this.area = this.width * this.height;
};

