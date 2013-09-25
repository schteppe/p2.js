var Shape = require('./Shape')
,   vec2 = require('../math/vec2')

module.exports = Capsule;

/**
 * Capsule shape class.
 * @class Capsule
 * @constructor
 * @extends {Shape}
 * @param {Number} length The distance between the end points
 * @param {Number} radius Radius of the capsule
 */
function Capsule(length,radius){
    Shape.call(this,Shape.CAPSULE);
    this.length = length || 1;
    this.radius = radius || 1;
};
Capsule.prototype = new Shape();

/**
 * Compute the mass moment of inertia of the Capsule.
 * @method conputeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 * @todo
 */
Capsule.prototype.computeMomentOfInertia = function(mass){
    return 1;
};
