var Shape = require('./Shape')
,   shallowClone = require('../utils/Utils').shallowClone
,   copy = require('../math/vec2').copy;

module.exports = Particle;

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @extends Shape
 * @example
 *     var body = new Body();
 *     var shape = new Particle();
 *     body.addShape(shape);
 */
function Particle(options){
    options = options ? shallowClone(options) : {};
	options.type = Shape.PARTICLE;
    Shape.call(this, options);
}
Particle.prototype = new Shape();
Particle.prototype.constructor = Particle;

Particle.prototype.computeMomentOfInertia = function(){
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
Particle.prototype.computeAABB = function(out, position/*, angle*/){
    copy(out.lowerBound, position);
    copy(out.upperBound, position);
};
