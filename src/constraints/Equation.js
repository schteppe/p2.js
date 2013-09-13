exports.Equation = Equation;

/**
 * Base class for constraint equations.
 * @class Equation
 * @constructor
 * @param {Body} bi First body participating in the equation
 * @param {Body} bj Second body participating in the equation
 * @param {number} minForce Minimum force to apply. Default: -1e6
 * @param {number} maxForce Maximum force to apply. Default: 1e6
 */
function Equation(bi,bj,minForce,maxForce){
    this.id = -1;
    this.minForce = typeof(minForce)=="undefined" ? -1e6 : minForce;
    this.maxForce = typeof(maxForce)=="undefined" ? 1e6 : maxForce;

    this.bi = bi;
    this.bj = bj;

    this.h = 1/60;
    this.k = 0;
    this.a = 0;
    this.b = 0;
    this.eps = 0;
    this.setSpookParams(1e6,4);
};
Equation.prototype.constructor = Equation;

/**
 * Set stiffness parameters
 *
 * @method setSpookParams
 * @param  {number} k
 * @param  {number} d
 */
Equation.prototype.setSpookParams = function(k,d){
    var h=this.h;
    this.k = k;
    this.d = d;
    this.a = 4.0 / (h * (1 + 4 * d));
    this.b = (4.0 * d) / (1 + 4 * d);
    this.eps = 4.0 / (h * h * k * (1 + 4 * d));
};
