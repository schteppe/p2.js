var polyk = require('../math/polyk');

exports.Shape = Shape;
exports.Particle = Particle;
exports.Rectangle = Rectangle;
exports.Circle = Circle;
exports.Plane = Plane;
exports.Convex = Convex;
exports.Line = Line;

/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 */
function Shape(type){
    this.type = type;
};

Shape.CIRCLE =      1;
Shape.PARTICLE =    2;
Shape.PLANE =       4;
Shape.CONVEX =      8;
Shape.LINE =        16;
Shape.RECTANGLE =   32;

/**
 * Should return the moment of inertia around the Z axis of the body given the total mass. See <a href="http://en.wikipedia.org/wiki/List_of_moments_of_inertia">Wikipedia's list of moments of inertia</a>.
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number} If the inertia is infinity or if the object simply isn't possible to rotate, return 0.
 */
Shape.prototype.computeMomentOfInertia = function(mass){
    throw new Error("Shape.computeMomentOfInertia is not implemented in this Shape...");
};

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @extends {Shape}
 */
function Particle(){
    Shape.call(this,Shape.PARTICLE);
};
Particle.prototype = new Shape();
Particle.prototype.computeMomentOfInertia = function(mass){
    return 0; // Can't rotate a particle
};

/**
 * Rectangle shape class.
 * @class Rectangle
 * @constructor
 * @extends {Convex}
 */
function Rectangle(w,h){
    var verts = [   vec2.fromValues(-w/2, -h/2),
                    vec2.fromValues( w/2, -h/2),
                    vec2.fromValues( w/2,  h/2),
                    vec2.fromValues(-w/2,  h/2)];
    Convex.call(this,verts);
    this.width = w;
    this.height = h;
};
Rectangle.prototype = new Convex();

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Rectangle.prototype.computeMomentOfInertia = function(mass){
    var w = this.width,
        h = this.height;
    return mass * (h*h + w*w) / 12;
};


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

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends {Shape}
 * @constructor
 */
function Plane(){
    Shape.call(this,Shape.PLANE);
};
Plane.prototype = new Shape();
Plane.prototype.computeMomentOfInertia = function(mass){
    return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
};

/**
 * Convex shape class.
 * @class Convex
 * @constructor
 * @extends {Shape}
 * @param {Array} vertices An array of Float32Array vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
 */
function Convex(vertices){
    Shape.call(this,Shape.CONVEX);

    /**
     * Vertices defined in the local frame.
     * @property vertices
     * @type {Array}
     */
    this.vertices = vertices || [];
};
Convex.prototype = new Shape();

/**
 * Compute the mass moment of inertia of the Convex.
 * @param  {Number} mass
 * @return {Number}
 */
Convex.prototype.computeMomentOfInertia = function(mass){

    // In short: Triangulate the Convex, compute centroid and inertia of
    // each sub-triangle. Add up to total using parallel axis theorem.

    var I = 0;

    // Rewrite on polyk notation, array of numbers
    var polykVerts = [];
    for(var i=0; i<this.vertices.length; i++){
        var v = this.vertices[i];
        polykVerts.push(v[0],v[1]);
    }

    // Triangulate
    var triangles = polyk.Triangulate(polykVerts);

    // Get total convex area and density
    var area = polyk.GetArea(polykVerts);
    var density = mass / area;

    // Temp vectors
    var a = vec2.create(),
        b = vec2.create(),
        c = vec2.create(),
        centroid = vec2.create(),
        n = vec2.create();
        ac = vec2.create();

    // Loop over all triangles, add their inertia contributions to I
    for(var i=0; i<triangles.length; i+=3){
        var id1 = triangles[i],
            id2 = triangles[i+1],
            id3 = triangles[i+2];

        // a,b,c are triangle corners
        vec2.set(a, polykVerts[2*id1], polykVerts[2*id1+1]);
        vec2.set(b, polykVerts[2*id2], polykVerts[2*id2+1]);
        vec2.set(c, polykVerts[2*id3], polykVerts[2*id3+1]);

        // Compute centroid: http://easycalculation.com/analytical/learn-centroid.php
        vec2.add(centroid, a, b);
        vec2.add(centroid, centroid, c);
        vec2.scale(centroid, centroid, 1/3);

        // Construct normal, orthogonal to (a-b)
        vec2.sub(n, b, a);
        var base = vec2.length(n);
        vec2.rotate(n, n, Math.PI/2);
        vec2.normalize(n, n);
        vec2.sub(ac, c, a);
        var height = Math.abs( vec2.dot(ac, n) );

        // Get inertia for this triangle: http://answers.yahoo.com/question/index?qid=20080721030038AA3oE1m
        var I_triangle = (base * (Math.pow(height,3))) / 36;

        // Get mass for the triangle
        var m = base*height/2 * density;

        // Add to total inertia using parallel axis theorem
        var r2 = vec2.squaredLength(centroid);
        I += I_triangle + m*r2;
    }
    return I;
};

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 * @class Plane
 * @extends {Shape}
 * @constructor
 */
function Line(length){
    Shape.call(this,Shape.LINE);

    /**
     * Length of this line
     * @property length
     * @type {Number}
     */
    this.length = length;
};
Line.prototype = new Shape();
Line.prototype.computeMomentOfInertia = function(mass){
    return mass * Math.pow(this.length,2) / 12;
};
