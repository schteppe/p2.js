/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 */
exports.Shape = function(){};

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @extends Shape
 */
exports.Particle = function(){
    p2.Shape.apply(this);
};

/**
 * Circle shape class.
 * @class Circle
 * @extends Shape
 * @constructor
 * @param {number} radius
 */
exports.Circle = function(radius){
    p2.Shape.apply(this);

    /**
     * The radius of the circle.
     * @property radius
     * @type {number}
     */
    this.radius = radius || 1;
};

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends Shape
 * @constructor
 */
exports.Plane = function(){
    p2.Shape.apply(this);
};

