var Shape = require('./Shape')
,   vec2 = require('../math/vec2')
,   polyk = require('../math/polyk')
,   decomp = require('poly-decomp');

module.exports = Convex;

/**
 * Convex shape class.
 * @class Convex
 * @constructor
 * @extends Shape
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {Array} [options.vertices] An array of vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
 * @param {Array} [options.axes] An array of unit length vectors, representing the symmetry axes in the convex.
 * @example
 *     // Create a box
 *     var vertices = [[-1,-1], [1,-1], [1,1], [-1,1]];
 *     var convexShape = new Convex({ vertices: vertices });
 *     body.addShape(convexShape);
 */
function Convex(options){
    if(Array.isArray(arguments[0])){
        options = {
            vertices: arguments[0],
            axes: arguments[1]
        };
        console.warn('The Convex constructor signature has changed. Please use the following format: new Convex({ vertices: [...], ... })');
    }
    options = options || {};

    /**
     * Vertices defined in the local frame.
     * @property vertices
     * @type {Array}
     */
    this.vertices = [];

    // Copy the verts
    var vertices = options.vertices !== undefined ? options.vertices : [];
    for(var i=0; i < vertices.length; i++){
        var v = vec2.create();
        vec2.copy(v, vertices[i]);
        this.vertices.push(v);
    }

    /**
     * Axes defined in the local frame.
     * @property axes
     * @type {Array}
     */
    this.axes = [];

    if(options.axes){

        // Copy the axes
        for(var i=0; i < options.axes.length; i++){
            var axis = vec2.create();
            vec2.copy(axis, options.axes[i]);
            this.axes.push(axis);
        }

    } else {

        // Construct axes from the vertex data
        for(var i = 0; i < this.vertices.length; i++){
            // Get the world edge
            var worldPoint0 = this.vertices[i];
            var worldPoint1 = this.vertices[(i+1) % this.vertices.length];

            var normal = vec2.create();
            vec2.sub(normal, worldPoint1, worldPoint0);

            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2.rotate90cw(normal, normal);
            vec2.normalize(normal, normal);

            this.axes.push(normal);
        }

    }

    /**
     * The center of mass of the Convex
     * @property centerOfMass
     * @type {Array}
     */
    this.centerOfMass = vec2.fromValues(0,0);

    /**
     * Triangulated version of this convex. The structure is Array of 3-Arrays, and each subarray contains 3 integers, referencing the vertices.
     * @property triangles
     * @type {Array}
     */
    this.triangles = [];

    if(this.vertices.length){
        this.updateTriangles();
        this.updateCenterOfMass();
    }

    /**
     * The bounding radius of the convex
     * @property boundingRadius
     * @type {Number}
     */
    this.boundingRadius = 0;

    options.type = Shape.CONVEX;
    Shape.call(this, options);

    this.updateBoundingRadius();
    this.updateArea();
    if(this.area < 0){
        throw new Error("Convex vertices must be given in conter-clockwise winding.");
    }
}
Convex.prototype = new Shape();
Convex.prototype.constructor = Convex;

var tmpVec1 = vec2.create();
var tmpVec2 = vec2.create();

/**
 * Project a Convex onto a world-oriented axis
 * @method projectOntoAxis
 * @static
 * @param  {Array} offset
 * @param  {Array} localAxis
 * @param  {Array} result
 */
Convex.prototype.projectOntoLocalAxis = function(localAxis, result){
    var max=null,
        min=null,
        v,
        value,
        localAxis = tmpVec1;

    // Get projected position of all vertices
    for(var i=0; i<this.vertices.length; i++){
        v = this.vertices[i];
        value = vec2.dot(v, localAxis);
        if(max === null || value > max){
            max = value;
        }
        if(min === null || value < min){
            min = value;
        }
    }

    if(min > max){
        var t = min;
        min = max;
        max = t;
    }

    vec2.set(result, min, max);
};

Convex.prototype.projectOntoWorldAxis = function(localAxis, shapeOffset, shapeAngle, result){
    var worldAxis = tmpVec2;

    this.projectOntoLocalAxis(localAxis, result);

    // Project the position of the body onto the axis - need to add this to the result
    if(shapeAngle !== 0){
        vec2.rotate(worldAxis, localAxis, shapeAngle);
    } else {
        worldAxis = localAxis;
    }
    var offset = vec2.dot(shapeOffset, worldAxis);

    vec2.set(result, result[0] + offset, result[1] + offset);
};


/**
 * Update the .triangles property
 * @method updateTriangles
 */
Convex.prototype.updateTriangles = function(){

    this.triangles.length = 0;

    // Rewrite on polyk notation, array of numbers
    var polykVerts = [];
    for(var i=0; i<this.vertices.length; i++){
        var v = this.vertices[i];
        polykVerts.push(v[0],v[1]);
    }

    // Triangulate
    var triangles = polyk.Triangulate(polykVerts);

    // Loop over all triangles, add their inertia contributions to I
    for(var i=0; i<triangles.length; i+=3){
        var id1 = triangles[i],
            id2 = triangles[i+1],
            id3 = triangles[i+2];

        // Add to triangles
        this.triangles.push([id1,id2,id3]);
    }
};

var updateCenterOfMass_centroid = vec2.create(),
    updateCenterOfMass_centroid_times_mass = vec2.create(),
    updateCenterOfMass_a = vec2.create(),
    updateCenterOfMass_b = vec2.create(),
    updateCenterOfMass_c = vec2.create(),
    updateCenterOfMass_ac = vec2.create(),
    updateCenterOfMass_ca = vec2.create(),
    updateCenterOfMass_cb = vec2.create(),
    updateCenterOfMass_n = vec2.create();

/**
 * Update the .centerOfMass property.
 * @method updateCenterOfMass
 */
Convex.prototype.updateCenterOfMass = function(){
    var triangles = this.triangles,
        verts = this.vertices,
        cm = this.centerOfMass,
        centroid = updateCenterOfMass_centroid,
        n = updateCenterOfMass_n,
        a = updateCenterOfMass_a,
        b = updateCenterOfMass_b,
        c = updateCenterOfMass_c,
        ac = updateCenterOfMass_ac,
        ca = updateCenterOfMass_ca,
        cb = updateCenterOfMass_cb,
        centroid_times_mass = updateCenterOfMass_centroid_times_mass;

    vec2.set(cm,0,0);
    var totalArea = 0;

    for(var i=0; i!==triangles.length; i++){
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];

        vec2.centroid(centroid,a,b,c);

        // Get mass for the triangle (density=1 in this case)
        // http://math.stackexchange.com/questions/80198/area-of-triangle-via-vectors
        var m = Convex.triangleArea(a,b,c);
        totalArea += m;

        // Add to center of mass
        vec2.scale(centroid_times_mass, centroid, m);
        vec2.add(cm, cm, centroid_times_mass);
    }

    vec2.scale(cm,cm,1/totalArea);
};

/**
 * Compute the mass moment of inertia of the Convex.
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 * @see http://www.gamedev.net/topic/342822-moment-of-inertia-of-a-polygon-2d/
 */
Convex.prototype.computeMomentOfInertia = function(mass){
    var denom = 0.0,
        numer = 0.0,
        N = this.vertices.length;
    for(var j = N-1, i = 0; i < N; j = i, i ++){
        var p0 = this.vertices[j];
        var p1 = this.vertices[i];
        var a = Math.abs(vec2.crossLength(p0,p1));
        var b = vec2.dot(p1,p1) + vec2.dot(p1,p0) + vec2.dot(p0,p0);
        denom += a * b;
        numer += a;
    }
    return (mass / 6.0) * (denom / numer);
};

/**
 * Updates the .boundingRadius property
 * @method updateBoundingRadius
 */
Convex.prototype.updateBoundingRadius = function(){
    var verts = this.vertices,
        r2 = 0;

    for(var i=0; i!==verts.length; i++){
        var l2 = vec2.squaredLength(verts[i]);
        if(l2 > r2){
            r2 = l2;
        }
    }

    this.boundingRadius = Math.sqrt(r2);
};

/**
 * Get the area of the triangle spanned by the three points a, b, c. The area is positive if the points are given in counter-clockwise order, otherwise negative.
 * @static
 * @method triangleArea
 * @param {Array} a
 * @param {Array} b
 * @param {Array} c
 * @return {Number}
 */
Convex.triangleArea = function(a,b,c){
    return (((b[0] - a[0])*(c[1] - a[1]))-((c[0] - a[0])*(b[1] - a[1]))) * 0.5;
};

/**
 * Update the .area
 * @method updateArea
 */
Convex.prototype.updateArea = function(){
    this.updateTriangles();
    this.area = 0;

    var triangles = this.triangles,
        verts = this.vertices;
    for(var i=0; i!==triangles.length; i++){
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];

        // Get mass for the triangle (density=1 in this case)
        var m = Convex.triangleArea(a,b,c);
        this.area += m;
    }
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Convex.prototype.computeAABB = function(out, position, angle){
    out.setFromPoints(this.vertices, position, angle, 0);
};

var intersectConvex_rayStart = vec2.create();
var intersectConvex_rayEnd = vec2.create();
var intersectConvex_normal = vec2.create();

/**
 * @method raycast
 * @param  {RaycastResult} result
 * @param  {Ray} ray
 * @param  {array} position
 * @param  {number} angle
 */
Convex.prototype.raycast = function(result, ray, position, angle){
    var rayStart = intersectConvex_rayStart;
    var rayEnd = intersectConvex_rayEnd;
    var normal = intersectConvex_normal;
    var vertices = this.vertices;

    // Transform to local shape space
    vec2.toLocalFrame(rayStart, ray.from, position, angle);
    vec2.toLocalFrame(rayEnd, ray.to, position, angle);

    var n = vertices.length;

    for (var i = 0; i < n && !result.shouldStop(ray); i++) {
        var q1 = vertices[i];
        var q2 = vertices[(i+1) % n];
        var delta = vec2.getLineSegmentsIntersectionFraction(rayStart, rayEnd, q1, q2);

        if(delta >= 0){
            vec2.sub(normal, q2, q1);
            vec2.rotate(normal, normal, -Math.PI / 2 + angle);
            vec2.normalize(normal, normal);
            ray.reportIntersection(result, delta, normal, i);
        }
    }
};
