var Shape =  require('./Shape')
,    vec2 =  require('../math/vec2')
,    Utils = require('../utils/Utils');

module.exports = Plane;

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends Shape
 * @constructor
 */
function Plane(){
    Shape.call(this,Shape.PLANE);
}
Plane.prototype = new Shape();
Plane.prototype.constructor = Plane;

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
    var a = angle % (2 * Math.PI);
    var set = vec2.set;
    var max = Number.MAX_VALUE;
    var lowerBound = out.lowerBound;
    var upperBound = out.upperBound;

    if(a === 0){
        // y goes from -inf to 0
        set(lowerBound, -max, -max);
        set(upperBound,  max,  0);

    } else if(a === Math.PI / 2){

        // x goes from 0 to inf
        set(lowerBound, 0, -max);
        set(upperBound,      max,  max);

    } else if(a === Math.PI){

        // y goes from 0 to inf
        set(lowerBound, -max, 0);
        set(upperBound,  max, max);

    } else if(a === 3*Math.PI/2){

        // x goes from -inf to 0
        set(lowerBound, -max,     -max);
        set(upperBound,  0,  max);

    } else {

        // Set max bounds
        set(lowerBound, -max, -max);
        set(upperBound,  max,  max);
    }

    vec2.add(lowerBound, lowerBound, position);
    vec2.add(upperBound, upperBound, position);
};

Plane.prototype.updateArea = function(){
    this.area = Number.MAX_VALUE;
};

