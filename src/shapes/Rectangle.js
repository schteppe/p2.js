var vec2 = require('../math/vec2')
,   Shape = require('./Shape')
,   Convex = require('./Convex')

module.exports = Rectangle;

/**
 * Rectangle shape class.
 * @class Rectangle
 * @constructor
 * @param {Number} w Width
 * @param {Number} h Height
 * @extends {Convex}
 */
function Rectangle(w,h){
    var verts = [   vec2.fromValues(-w/2, -h/2),
                    vec2.fromValues( w/2, -h/2),
                    vec2.fromValues( w/2,  h/2),
                    vec2.fromValues(-w/2,  h/2)];

    /**
     * Total width of the rectangle
     * @property width
     * @type {Number}
     */
    this.width = w;

    /**
     * Total height of the rectangle
     * @property height
     * @type {Number}
     */
    this.height = h;

    Convex.call(this,verts);
};
Rectangle.prototype = new Convex();

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
    /*
    // Get world corners
    vec2.rotate(corner1,this.vertices[0],angle);
    vec2.rotate(corner2,this.vertices[1],angle);
    vec2.rotate(corner3,this.vertices[2],angle);
    vec2.rotate(corner4,this.vertices[3],angle);
    vec2.set(out.upperBound, Math.max(corner1[0],corner2[0],corner3[0],corner4[0]),
                             Math.max(corner1[1],corner2[1],corner3[1],corner4[1]));
    vec2.set(out.lowerBound, Math.min(corner1[0],corner2[0],corner3[0],corner4[0]),
                             Math.min(corner1[1],corner2[1],corner3[1],corner4[1]));

    // Add world offset
    vec2.add(out.lowerBound, out.lowerBound, position);
    vec2.add(out.upperBound, out.upperBound, position);
    */
   out.setFromPoints(this.vertices,position,angle);
};

Rectangle.prototype.updateArea = function(){
    this.area = this.width * this.height;
};

