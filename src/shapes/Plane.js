var Shape =  require('./Shape')
,    vec2 =  require('../math/vec2')
,    Utils = require('../utils/Utils')

module.exports = Plane;

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends Shape
 * @constructor
 */
function Plane(){
    Shape.call(this,Shape.PLANE);
};
Plane.prototype = new Shape();

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 */
Plane.prototype.computeMomentOfInertia = function(mass){
    return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
};

/**
 * Update the bounding radius
 * @method updateBoundingRadius
 */
Plane.prototype.updateBoundingRadius = function(){
    this.boundingRadius = Number.MAX_VALUE;
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Plane.prototype.computeAABB = function(out, position, angle){
    var a = 0,
        set = vec2.set;
    if(typeof(angle) == "number")
        a = angle % (2*Math.PI);

    if(a == 0){
        // y goes from -inf to 0
        set(out.lowerBound, -Number.MAX_VALUE, -Number.MAX_VALUE);
        set(out.upperBound,  Number.MAX_VALUE,  0);
    } else if(a == Math.PI / 2){
        // x goes from 0 to inf
        set(out.lowerBound,                 0, -Number.MAX_VALUE);
        set(out.upperBound,  Number.MAX_VALUE,  Number.MAX_VALUE);
    } else if(a == Math.PI){
        // y goes from 0 to inf
        set(out.lowerBound, -Number.MAX_VALUE, 0);
        set(out.upperBound,  Number.MAX_VALUE, Number.MAX_VALUE);
    } else if(a == 3*Math.PI/2){
        // x goes from -inf to 0
        set(out.lowerBound, -Number.MAX_VALUE, -Number.MAX_VALUE);
        set(out.upperBound,                 0,  Number.MAX_VALUE);
    } else {
        // Set max bounds
        set(out.lowerBound, -Number.MAX_VALUE, -Number.MAX_VALUE);
        set(out.upperBound,  Number.MAX_VALUE,  Number.MAX_VALUE);
    }

    vec2.add(out.lowerBound, out.lowerBound, position);
    vec2.add(out.upperBound, out.upperBound, position);
};

Plane.prototype.updateArea = function(){
    this.area = Number.MAX_VALUE;
};

