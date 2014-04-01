var Equation = require("./Equation"),
    vec2 = require('../math/vec2');

module.exports = AngleLockEquation;

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 *
 * @class AngleLockEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {Number} [options.angle] Angle to add to the local vector in body A.
 * @param {Number} [options.ratio] Gear ratio
 */
function AngleLockEquation(bodyA, bodyB, options){
    options = options || {};
    Equation.call(this,bodyA,bodyB,-Number.MAX_VALUE,Number.MAX_VALUE);
    this.angle = options.angle || 0;

    /**
     * The gear ratio.
     * @property {Number} ratio
     * @private
     * @see setRatio
     */
    this.ratio = typeof(options.ratio)==="number" ? options.ratio : 1;

    this.setRatio(this.ratio);
}
AngleLockEquation.prototype = new Equation();
AngleLockEquation.prototype.constructor = AngleLockEquation;

AngleLockEquation.prototype.computeGq = function(){
    return this.ratio * this.bodyA.angle - this.bodyB.angle + this.angle;
};

/**
 * Set the gear ratio for this equation
 * @method setRatio
 * @param {Number} ratio
 */
AngleLockEquation.prototype.setRatio = function(ratio){
    var G = this.G;
    G[2] =  ratio;
    G[5] = -1;
    this.ratio = ratio;
};

/**
 * Set the max force for the equation.
 * @method setMaxTorque
 * @param {Number} torque
 */
AngleLockEquation.prototype.setMaxTorque = function(torque){
    this.maxForce =  torque;
    this.minForce = -torque;
};
