var Shape = require('./Shape');

module.exports = Circle;

/**
 * Circle shape class.
 * @class Circle
 * @extends {Shape}
 * @constructor
 * @param {number} radius
 */
function Circle(radius){
    Shape.call(this,Shape.CIRCLE);

    /**
     * The radius of the circle.
     * @property radius
     * @type {number}
     */
    this.radius = radius || 1;
};
Circle.prototype = new Shape();
Circle.prototype.computeMomentOfInertia = function(mass){
    var r = this.radius;
    return mass * r * r / 2;
};
