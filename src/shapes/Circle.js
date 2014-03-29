var Shape = require('./Shape')
,    vec2 = require('../math/vec2')

module.exports = Circle;

/**
 * Circle shape class.
 * @class Circle
 * @extends Shape
 * @constructor
 * @param {number} [radius=1] The radius of this circle
 */
function Circle(radius){

    /**
     * The radius of the circle.
     * @property radius
     * @type {number}
     */
    this.radius = radius || 1;

    Shape.call(this,Shape.CIRCLE);
};
Circle.prototype = new Shape();

/**
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Circle.prototype.computeMomentOfInertia = function(mass){
    var r = this.radius;
    return mass * r * r / 2;
};

/**
 * @method updateBoundingRadius
 * @return {Number}
 */
Circle.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.radius;
};

/**
 * @method updateArea
 * @return {Number}
 */
Circle.prototype.updateArea = function(){
    this.area = Math.PI * this.radius * this.radius;
};

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Circle.prototype.computeAABB = function(out, position, angle){
    var r = this.radius;
    vec2.set(out.upperBound,  r,  r);
    vec2.set(out.lowerBound, -r, -r);
    if(position){
        vec2.add(out.lowerBound, out.lowerBound, position);
        vec2.add(out.upperBound, out.upperBound, position);
    }
};
