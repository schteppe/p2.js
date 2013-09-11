/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 */
exports.Shape = Shape;
function Shape(){

};

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @extends Shape
 */
exports.Particle = function(){
    Shape.apply(this);
};

/**
 * Circle shape class.
 * @class Circle
 * @extends Shape
 * @constructor
 * @param {number} radius
 */
exports.Circle = function(radius){
    Shape.apply(this);

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
    Shape.apply(this);
};

/**
 * Convex shape class.
 * @class Convex
 * @constructor
 * @extends Shape
 * @param {Array} vertices An array of Float32Array vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
 */
exports.Convex = Convex;
function Convex(vertices){
    Shape.apply(this);

    /**
     * Vertices defined in the local frame.
     * @property vertices
     * @type {Array}
     */
    this.vertices = vertices;
};

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 * @class Plane
 * @extends Shape
 * @constructor
 */
exports.Line = function(length){
    Shape.apply(this);
    this.length = length;
};
