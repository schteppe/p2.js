var FrictionEquation = require('../equations/FrictionEquation');
var Pool = require('./Pool');

module.exports = FrictionEquationPool;

/**
 * @class
 */
function FrictionEquationPool() {
	Pool.apply(this, arguments);
}
FrictionEquationPool.prototype = new Pool();
FrictionEquationPool.prototype.constructor = FrictionEquationPool;

/**
 * @method create
 * @return {ContactEquation}
 */
FrictionEquationPool.prototype.create = function () {
	return new FrictionEquation();
};

/**
 * @method destroy
 * @param {ContactEquation} equation
 * @return {FrictionEquationPool}
 */
FrictionEquationPool.prototype.destroy = function (equation) {
	equation.bodyA = equation.bodyB = null;
	return this;
};
