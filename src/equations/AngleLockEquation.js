var Equation = require("./Equation"),
    vec2 = require('../math/vec2');

module.exports = AngleLockEquation;

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 *
 * @class AngleLockEquation
 * @constructor
 * @extends Equation
 * @param {Body} bi
 * @param {Body} bj
 * @param {Object} options
 * @param {Number} options.angle Angle to add to the local vector in body i.
 * @param {Number} options.ratio Gear ratio
 */
function AngleLockEquation(bi,bj,options){
    options = options || {};
    Equation.call(this,bi,bj,-Number.MAX_VALUE,Number.MAX_VALUE);
    this.angle = options.angle || 0;
    this.ratio = typeof(options.ratio)=="number" ? options.ratio : 1;
    this.setRatio(this.ratio);
};
AngleLockEquation.prototype = new Equation();
AngleLockEquation.prototype.constructor = AngleLockEquation;

AngleLockEquation.prototype.computeGq = function(){
    return this.ratio*this.bi.angle - this.bj.angle + this.angle;
};

AngleLockEquation.prototype.setRatio = function(ratio){
    var G = this.G;
    G[2] =  ratio;
    G[5] = -1;
    this.ratio = ratio;
};
