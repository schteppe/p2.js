var Shape = require('./Shape')
,    vec2 = require('../math/vec2')

module.exports = Circle;

/**
 * Circle shape class.
 * @class Circle
 * @extends {Shape}
 * @constructor
 * @param {number} radius The radius of this circle
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
Circle.prototype.computeMomentOfInertia = function(mass){
    var r = this.radius;
    return mass * r * r / 2;
};

Circle.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.radius;
};

Circle.prototype.updateArea = function(){
    this.area = Math.PI * this.radius * this.radius;
};

Circle.prototype.controls = function(){
  var circleShape = this;
  
  // For now, we only return one control to adjust the radius
  // Each control needs a name, local coordinates and a callback function
  return [{ 
           name: 'radius',
           coords: {x: circleShape.radius, y: 0},
           callback: function(x,y){
             // set the radius as per control's current local co-ords
             circleShape.radius = Math.sqrt(x*x + y*y);
           } 
         }];
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
