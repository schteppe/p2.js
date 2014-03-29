var Constraint = require('./Constraint')
,   Equation = require('../equations/Equation')
,   AngleLockEquation = require('../equations/AngleLockEquation')
,   vec2 = require('../math/vec2')

module.exports = GearConstraint;

/**
 * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
 * @class GearConstraint
 * @constructor
 * @author schteppe
 * @param {Body}            bodyA
 * @param {Body}            bodyB
 * @param {Number}          maxForce The maximum force that should be applied to constrain the bodies.
 * @extends {Constraint}
 * @todo Ability to specify world points
 */
function GearConstraint(bodyA, bodyB, options){
    options = options || {};

    Constraint.call(this, bodyA, bodyB, Constraint.GEAR, options);

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new AngleLockEquation(bodyA,bodyB,options),
    ];

    /**
     * The relative angle
     * @property angle
     * @type {Number}
     */
    this.angle = typeof(options.angle) === "number" ? options.angle : 0;

    /**
     * The gear ratio.
     * @property ratio
     * @type {Number}
     */
    this.ratio = typeof(options.ratio) === "number" ? options.ratio : 1;
}
GearConstraint.prototype = new Constraint();

GearConstraint.prototype.update = function(){
    var eq = this.equations[0];
    if(eq.ratio !== this.ratio){
        eq.setRatio(this.ratio);
    }
    eq.angle = this.angle;
};