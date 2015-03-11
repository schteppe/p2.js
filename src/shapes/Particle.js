var Shape = require('./Shape')
,   vec2 = require('../math/vec2');

module.exports = Particle;

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @extends Shape
 */
function Particle(){
    Shape.call(this,Shape.PARTICLE);
}
Particle.prototype = new Shape();
Particle.prototype.constructor = Particle;

Particle.prototype.computeMomentOfInertia = function(mass){
    return 0; // Can't rotate a particle
};

Particle.prototype.updateBoundingRadius = function(){
    this.boundingRadius = 0;
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Particle.prototype.computeAABB = function(out, position, angle){
    vec2.copy(out.lowerBound, position);
    vec2.copy(out.upperBound, position);
};
