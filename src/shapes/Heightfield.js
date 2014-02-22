var Shape = require('./Shape')
,    vec2 = require('../math/vec2')

module.exports = Heightfield;

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a distance "elementWidth".
 * @class Heightfield
 * @extends {Shape}
 * @constructor
 */
function Heightfield(data,maxValue,elementWidth){
    this.data = data;
    this.maxValue = maxValue;
    this.elementWidth = elementWidth;
    Shape.call(this,Shape.HEIGHTFIELD);
};
Heightfield.prototype = new Shape();

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

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Heightfield.prototype.computeAABB = function(out, position, angle){
    // Use the max data rectangle
    out.upperBound[0] = this.elementWidth * this.data.length + position[0];
    out.upperBound[1] = this.maxValue + position[1];
    out.lowerBound[0] = position[0];
    out.lowerBound[1] = position[1];
};
