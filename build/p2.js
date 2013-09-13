/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013 p2.js authors
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(e){if("function"==typeof bootstrap)bootstrap("p2",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeP2=e}else"undefined"!=typeof window?window.p2=e():self.p2=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */
var vec2 = {};

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}
 
/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    return new Float32Array(2);
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new Float32Array(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new Float32Array(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {vec2} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Caclulates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Caclulates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Caclulates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = x * m[0] + y * m[1];
    out[1] = x * m[2] + y * m[3];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = new Float32Array(2);

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}

},{}],2:[function(require,module,exports){
var vec2 = require('../math/vec2')
,   ContactEquation = require('../constraints/ContactEquation').ContactEquation
,   FrictionEquation = require('../constraints/FrictionEquation').FrictionEquation

// Temp things
var dist = vec2.create();
var worldNormal = vec2.create();
var yAxis = vec2.fromValues(0,1);

exports.checkCircleCircle = checkCircleCircle;
function checkCircleCircle(c1, offset1, c2, offset2){
    vec2.sub(dist,offset1,offset2);
    var R1 = c1.radius;
    var R2 = c2.radius;
    return vec2.sqrLen(dist) < (R1+R2)*(R1+R2);
};

// Generate contacts / do nearphase
exports.nearphaseCircleCircle = nearphaseCircleCircle;
function nearphaseCircleCircle( c1,c2,
                                result,
                                oldContacts,
                                doFriction,
                                frictionResult,
                                oldFrictionEquations,
                                slipForce,
                                offset1,
                                offset2){
    var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(c1,c2);
    c.bi = c1;
    c.bj = c2;
    vec2.sub(c.ni,c2.position,c1.position);
    if(offset1){
        vec2.add(c.ni,c.ni,offset2);
        vec2.sub(c.ni,c.ni,offset1);
    }
    vec2.normalize(c.ni,c.ni);

    vec2.scale( c.ri,c.ni, c1.shape.radius);
    vec2.scale( c.rj,c.ni,-c2.shape.radius);

    if(offset1){
        vec2.add(c.ri,c.ri,offset1);
        vec2.add(c.rj,c.rj,offset2);
    }

    result.push(c);

    if(doFriction){
        var eq = oldFrictionEquations.length ? oldFrictionEquations.pop() : new FrictionEquation(c1,c2);
        eq.bi = c1;
        eq.bj = c2;
        eq.setSlipForce(slipForce);
        // Use same ri and rj, but the tangent vector needs to be constructed from the collision normal
        vec2.copy(eq.ri, c.ri);
        vec2.copy(eq.rj, c.rj);
        vec2.rotate(eq.t, c.ni, -Math.PI / 2);
        frictionResult.push(eq);
    }
};

exports.checkCompoundPlane = checkCompoundPlane;
function checkCompoundPlane(compound,plane,result){
    for(var i=0; i<compound.shape.children.length; i++){
        var s = compound.shape.children[i],
            offset = compound.shape.childOffsets[i],
            angle = compound.shape.childAngles[i];

        if(s instanceof Circle){
            // Compute distance vector between plane center and circle center
            vec2.sub(dist, compound.position, plane.position);
            vec2.add(dist, dist, offset);

            // Collision normal is the plane normal in world coords
            vec2.rotate(worldNormal,yAxis,plane.angle);
            if(vec2.dot(dist,worldNormal) <= s.radius){
                result.push(compound,plane);
                return;
            }
        }
    }
};

exports.nearphaseCompoundPlane = nearphaseCompoundPlane;
function nearphaseCompoundPlane(compound,plane,result){
    for(var i=0; i<compound.shape.children.length; i++){
        var s = compound.shape.children[i],
            offset = compound.shape.childOffsets[i],
            angle = compound.shape.childAngles[i];

        if(s instanceof Circle){
            //exports.nearphaseCirclePlane();
        }
    }
};

exports.checkParticlePlane = checkParticlePlane;
function checkParticlePlane(particle,plane,result){
    vec2.sub(dist, particle.position, plane.position);
    vec2.rotate(worldNormal, yAxis, plane.angle);
    if(vec2.dot(dist,worldNormal) < 0){
        result.push(particle);
        result.push(plane);
    }
};

exports.nearphaseParticlePlane = nearphaseParticlePlane;
function nearphaseParticlePlane(particle,plane,result,oldContacts){
    var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(plane,particle);
    c.bi = plane;
    c.bj = particle;

    vec2.sub(dist, particle.position, plane.position);
    vec2.rotate(c.ni, yAxis, plane.angle);

    vec2.scale( dist, c.ni, vec2.dot(dist, c.ni) );
    // dist is now the distance vector in the normal direction

    // ri is the particle position projected down onto the plane
    vec2.copy( c.ri, particle.position);
    vec2.sub( c.ri, c.ri, plane.position);
    vec2.sub( c.ri, c.ri, dist);
    vec2.set( c.rj, 0, 0 );
    result.push(c);
};

exports.checkCircleParticle = checkCircleParticle;
function checkCircleParticle(c,p,result){
    var r = c.shape.radius;
    vec2.sub(dist, c.position, p.position);
    if( vec2.squaredLength(dist) < r*r ){
        result.push(c,p);
    }
};

exports.nearphaseCircleParticle = nearphaseCircleParticle;
function nearphaseCircleParticle(circle, particle, result, oldContacts){
    var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(circle,particle);
    c.bi = circle;
    c.bj = particle;

    vec2.sub(dist, particle.position, circle.position);
    vec2.copy(c.ni, dist);
    vec2.normalize(c.ni,c.ni);
    vec2.copy(c.ri, dist);
    vec2.set(c.rj,0,0);

    result.push(c);
};

exports.checkCirclePlane = checkCirclePlane;
function checkCirclePlane(c,p,result,circleOffset,circleAngle,planeOffset,planeAngle){
    planeAngle = planeAngle || 0;

    // Compute distance vector between plane center and circle center
    vec2.sub(dist,c.position,p.position);
    if(circleOffset){
        vec2.add(dist, dist, circleOffset);
        vec2.sub(dist, dist, planeOffset);
    }

    // Collision normal is the plane normal in world coords
    vec2.rotate(worldNormal,yAxis,p.angle + planeAngle);
    if(vec2.dot(dist,worldNormal) <= c.shape.radius){
        result.push(c);
        result.push(p);
    }
};

var nearphaseCirclePlane_planeToCircle = vec2.create();
var nearphaseCirclePlane_temp = vec2.create();

exports.nearphaseCirclePlane = nearphaseCirclePlane;
function nearphaseCirclePlane(c,p,
                                        result,
                                        oldContacts,
                                        doFriction,
                                        frictionResult,
                                        oldFrictionEquations,
                                        slipForce,
                                        circleOffset,
                                        circleAngle,
                                        planeOffset,
                                        planeAngle){
    var contact = oldContacts.length ? oldContacts.pop() : new ContactEquation(p,c);
    contact.bi = p;
    contact.bj = c;
    var planeToCircle = nearphaseCirclePlane_planeToCircle;
    var temp = nearphaseCirclePlane_temp;
    vec2.rotate(contact.ni, yAxis, p.angle);

    vec2.scale( contact.rj, contact.ni, -c.shape.radius);

    vec2.sub(planeToCircle,c.position,p.position);
    var d = vec2.dot(contact.ni , planeToCircle );
    vec2.scale(temp,contact.ni,d);
    vec2.sub( contact.ri ,planeToCircle , temp );

    result.push(contact);

    if(doFriction){
        var eq = oldFrictionEquations.length ? oldFrictionEquations.pop() : new FrictionEquation(p,c);
        eq.bi = p;
        eq.bj = c;
        eq.setSlipForce(slipForce);
        // Use same ri and rj, but the tangent vector needs to be constructed from the plane normal
        vec2.copy(eq.ri, contact.ri);
        vec2.copy(eq.rj, contact.rj);
        vec2.rotate(eq.t, contact.ni, -Math.PI / 2);
        frictionResult.push(eq);
    }
};

var localAxis = vec2.create();
exports.projectConvexOntoAxis = projectConvexOntoAxis;
function projectConvexOntoAxis(c,axis,result){
    var max=null,
        min=null,
        v,
        value;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, axis, c.angle);

    // Project the position of the body onto the axis - need to add this to the result
    var offset = vec2.dot(c.position, axis);

    for(var i=1; i<c.shape.vertices.length; i++){
        v = c.shape.vertices[i];
        value = vec2.dot(v,localAxis);
        if(max === null || value > max) max = value;
        if(min === null || value < min) min = value;
    }

    vec2.set( result, min + offset, max + offset);
};

var edge =      vec2.create();
var normal =    vec2.create();
var span1 =     vec2.create();
var span2 =     vec2.create();
exports.findSeparatingAxis = findSeparatingAxis;
function findSeparatingAxis(c1,c2,sepAxis){

    var maxDist = null,
        overlap = false;

    for(var j=0; j<2; j++){
        var c = j==0 ? c1 : c2;

        for(var i=1; i<c1.shape.vertices.length; i++){
            // Get the edge
            vec2.subtract(edge, c.shape.vertices[i], c.shape.vertices[i-1]);

            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2.rotate(normal, edge, -Math.PI / 2);
            vec2.normalize(normal,normal);

            // Project hulls onto that normal
            projectConvexOntoAxis(c1,normal,span1);
            projectConvexOntoAxis(c2,normal,span2);

            var a=span1,
                b=span2;
            if(span1[0] > span2[0]){
                b=span1;
                a=span2;
            }

            // Get separating distance
            var dist = b[1] - a[0];
            if(maxDist===null || dist > maxDist){
                vec2.copy(sepAxis, normal);
                maxDist = dist;
                overlap = dist > 0;
            }
        }
    }

    return overlap;
};

// Returns either -1 (failed) or an index of a vertex. This vertex and the next makes the closest edge.
function getClosestEdge(c,axis){

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, axis, c.angle);

    var closestEdge = -1;
    for(var i=1; i<c.shape.vertices.length; i++){
        // Get the edge
        vec2.subtract(edge, c.shape.vertices[i], c.shape.vertices[i-1]);

        // Get normal - just rotate 90 degrees since vertices are given in CCW
        vec2.rotate(normal, edge, -Math.PI / 2);
        vec2.normalize(normal,normal);

        var dot = vec2.dot(normal,axis);
        if(closestEdge == -1 || dot > maxDot){
            closestEdge = i-1;
            maxDot = dot;
        }
    }

    return closestEdge;
};

// See http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/
exports.nearphaseConvexConvex = function(c1,c2,sepAxis){
    // Find edges with normals closest to the separating axis
    var closestEdge1 = getClosestEdge(c1,sepAxis);
    var closestEdge2 = getClosestEdge(c2,sepAxis);

    if(closestEdge1==-1 || closestEdge2==-1) return false;

    // Get the edges incident to those
    var edge1_0 = vec2.create(),
        edge1_1 = vec2.create(),
        edge1_2 = vec2.create(),
        edge2_0 = vec2.create(),
        edge2_1 = vec2.create(),
        edge2_2 = vec2.create();

    // Cases:
    // 1. No contact
    // 2. One corner on A is crossing an edge on B
    // 3. Two corners on A are crossing an edge on B
    // 4. Two corners on A are crossing an edge on B, two from B are crossing A
    // 4. Both A and B have a corner inside the other

    // Check overlaps

}

/**
 * Base class for broadphase implementations.
 * @class Broadphase
 * @constructor
 */
exports.Broadphase = function(){

};

/**
 * Get all potential intersecting body pairs.
 *
 * @method getCollisionPairs
 * @param  {World} world The world to search in.
 * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
 */
exports.Broadphase.prototype.getCollisionPairs = function(world){
    throw new Error("getCollisionPairs must be implemented in a subclass!");
};


},{"../constraints/ContactEquation":6,"../constraints/FrictionEquation":9,"../math/vec2":12}],3:[function(require,module,exports){
var Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase,
    vec2 = require('../math/vec2');

/**
 * Broadphase that uses axis-aligned bins.
 * @class GridBroadphase
 * @constructor
 * @extends Broadphase
 * @param {number} xmin Lower x bound of the grid
 * @param {number} xmax Upper x bound
 * @param {number} ymin Lower y bound
 * @param {number} ymax Upper y bound
 * @param {number} nx Number of bins along x axis
 * @param {number} ny Number of bins along y axis
 */
exports.GridBroadphase = function(xmin,xmax,ymin,ymax,nx,ny){
    Broadphase.apply(this);

    nx = nx || 10;
    ny = ny || 10;
    var binsizeX = (xmax-xmin) / nx;
    var binsizeY = (ymax-ymin) / ny;

    function getBinIndex(x,y){
        var xi = Math.floor(nx * (x - xmin) / (xmax-xmin));
        var yi = Math.floor(ny * (y - ymin) / (ymax-ymin));
        return xi*ny + yi;
    }

    this.getCollisionPairs = function(world){
        var result = [];
        var collidingBodies = world.bodies;
        var Ncolliding = Ncolliding=collidingBodies.length;

        var bins=[], Nbins=nx*ny;
        for(var i=0; i<Nbins; i++)
            bins.push([]);

        var xmult = nx / (xmax-xmin);
        var ymult = ny / (ymax-ymin);

        // Put all bodies into bins
        for(var i=0; i!==Ncolliding; i++){
            var bi = collidingBodies[i];
            var si = bi.shape;
            if (si === undefined) {
                continue;
            } else if(si instanceof Circle){
                // Put in bin
                // check if overlap with other bins
                var x = bi.position[0];
                var y = bi.position[1];
                var r = si.radius;

                var xi1 = Math.floor(xmult * (x-r - xmin));
                var yi1 = Math.floor(ymult * (y-r - ymin));
                var xi2 = Math.floor(xmult * (x+r - xmin));
                var yi2 = Math.floor(ymult * (y+r - ymin));

                for(var j=xi1; j<=xi2; j++){
                    for(var k=yi1; k<=yi2; k++){
                        var xi = j;
                        var yi = k;
                        if(xi*(ny-1) + yi >= 0 && xi*(ny-1) + yi < Nbins)
                            bins[ xi*(ny-1) + yi ].push(bi);
                    }
                }
            } else if(si instanceof Plane){
                // Put in all bins for now
                if(bi.angle == 0){
                    var y = bi.position[1];
                    for(var j=0; j!==Nbins && ymin+binsizeY*(j-1)<y; j++){
                        for(var k=0; k<nx; k++){
                            var xi = k;
                            var yi = Math.floor(ymult * (binsizeY*j - ymin));
                            bins[ xi*(ny-1) + yi ].push(bi);
                        }
                    }
                } else if(bi.angle == Math.PI*0.5){
                    var x = bi.position[0];
                    for(var j=0; j!==Nbins && xmin+binsizeX*(j-1)<x; j++){
                        for(var k=0; k<ny; k++){
                            var yi = k;
                            var xi = Math.floor(xmult * (binsizeX*j - xmin));
                            bins[ xi*(ny-1) + yi ].push(bi);
                        }
                    }
                } else {
                    for(var j=0; j!==Nbins; j++)
                        bins[j].push(bi);
                }
            } else {
                throw new Error("Shape not supported in GridBroadphase!");
            }
        }

        // Check each bin
        for(var i=0; i!==Nbins; i++){
            var bin = bins[i];
            for(var j=0, NbodiesInBin=bin.length; j!==NbodiesInBin; j++){
                var bi = bin[j];
                var si = bi.shape;

                for(var k=0; k!==j; k++){
                    var bj = bin[k];
                    var sj = bj.shape;

                    if(si instanceof Circle){
                             if(sj instanceof Circle)   bp.checkCircleCircle  (bi,bj,result);
                        else if(sj instanceof Particle) bp.checkCircleParticle(bi,bj,result);
                        else if(sj instanceof Plane)    bp.checkCirclePlane   (bi,bj,result);
                    } else if(si instanceof Particle){
                             if(sj instanceof Circle)   bp.checkCircleParticle(bj,bi,result);
                    } else if(si instanceof Plane){
                             if(sj instanceof Circle)   bp.checkCirclePlane   (bj,bi,result);
                    }
                }
            }
        }
        return result;
    };
};
exports.GridBroadphase.prototype = new Broadphase();


},{"../collision/Broadphase":2,"../math/vec2":12,"../objects/Shape":14}],4:[function(require,module,exports){
var Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase,
    vec2 = require('../math/vec2');

exports.NaiveBroadphase = NaiveBroadphase;

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
function NaiveBroadphase(){
    Broadphase.apply(this);
};
NaiveBroadphase.prototype = new Object(Broadphase.prototype);

/**
 * Get the colliding pairs
 * @param  {World} world
 * @return {Array}
 */
NaiveBroadphase.prototype.getCollisionPairs = function(world){
    var collidingBodies = world.bodies;
    var result = [];
    for(var i=0, Ncolliding=collidingBodies.length; i!==Ncolliding; i++){
        var bi = collidingBodies[i];
        var si = bi.shape;
        if (si === undefined) continue;
        for(var j=0; j!==i; j++){
            var bj = collidingBodies[j];
            var sj = bj.shape;
            if (sj === undefined) {
                continue;

            } else if(si instanceof Circle){
                     if(sj instanceof Circle)   bp.checkCircleCircle  (bi.shape,bi.position,bj.shape,bj.position) && result.push(bi,bj);
                else if(sj instanceof Particle) bp.checkCircleParticle(bi,bj,result);
                else if(sj instanceof Plane)    bp.checkCirclePlane   (bi,bj,result);

            } else if(si instanceof Particle){
                     if(sj instanceof Circle)   bp.checkCircleParticle(bj,bi,result);
                else if(sj instanceof Plane)    bp.checkParticlePlane (bi,bj,result);

            } else if(si instanceof Plane){
                     if(sj instanceof Circle)   bp.checkCirclePlane   (bj,bi,result);
                     if(sj instanceof Compound) bp.checkCompoundPlane (bj,bi,result);
                else if(sj instanceof Particle) bp.checkParticlePlane (bj,bi,result);

            } else if(si instanceof Compound){
                     if(sj instanceof Plane)   bp.checkCompoundPlane  (bi,bj,result);

            }
        }
    }
    return result;
};

},{"../collision/Broadphase":2,"../math/vec2":12,"../objects/Shape":14}],5:[function(require,module,exports){
exports.Constraint = Constraint;

/**
 * Base constraint class.
 *
 * @class Constraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
function Constraint(bodyA,bodyB){

    /**
     * Equations to be solved in this constraint
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * First body participating in the constraint.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;
};

/**
 * To be implemented by subclasses. Should update the internal constraint parameters.
 * @method update
 */
/*Constraint.prototype.update = function(){
    throw new Error("method update() not implmemented in this Constraint subclass!");
};*/

},{}],6:[function(require,module,exports){
var Equation = require("./Equation").Equation,
    vec2 = require('../math/vec2');

exports.ContactEquation = ContactEquation;

/**
 * Non-penetration constraint equation.
 *
 * @class ContactEquation
 * @constructor
 * @extends Equation
 * @param {Body} bi
 * @param {Body} bj
 */
function ContactEquation(bi,bj){
    Equation.call(this,bi,bj,0,1e6);
    this.penetration = 0.0;
    this.ri = vec2.create();
    this.penetrationVec = vec2.create();
    this.rj = vec2.create();
    this.ni = vec2.create();
    this.rixn = vec2.create();
    this.rjxn = vec2.create();
    this.rixw = vec2.create();
    this.rjxw = vec2.create();
    this.relVel = vec2.create();
    this.relForce = vec2.create();
};
ContactEquation.prototype = new Equation();
ContactEquation.prototype.constructor = ContactEquation;
ContactEquation.prototype.computeB = function(a,b,h){
    var bi = this.bi,
        bj = this.bj,
        ri = this.ri,
        rj = this.rj,
        xi = bi.position,
        xj = bj.position;

    var vi = bi.velocity,
        wi = bi.angularVelocity,
        fi = bi.force,
        taui = bi.angularForce;

    var vj = bj.velocity,
        wj = bj.angularVelocity,
        fj = bj.force,
        tauj = bj.angularForce;

    var relVel = this.relVel,
        relForce = this.relForce,
        penetrationVec = this.penetrationVec,
        invMassi = bi.invMass,
        invMassj = bj.invMass,
        invIi = bi.invInertia,
        invIj = bj.invInertia,
        n = this.ni;

    // Caluclate cross products
    var rixn = this.rixn = vec2.crossLength(ri,n);
    var rjxn = this.rjxn = vec2.crossLength(rj,n);

    // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
    vec2.set(penetrationVec,0,0);
    vec2.add(penetrationVec,xj,rj);
    vec2.sub(penetrationVec,penetrationVec,xi);
    vec2.sub(penetrationVec,penetrationVec,ri);

    var Gq = vec2.dot(n,penetrationVec);

    // Compute iteration
    var GW = vec2.dot(vj,n) - vec2.dot(vi,n) + wj * rjxn - wi * rixn;
    var GiMf = vec2.dot(fj,n)*invMassj - vec2.dot(fi,n)*invMassi + invIj*tauj*rjxn - invIi*taui*rixn;

    var B = - Gq * a - GW * b - h*GiMf;

    return B;
};

// Compute C = GMG+eps in the SPOOK equation
ContactEquation.prototype.computeC = function(eps){
    var bi = this.bi;
    var bj = this.bj;
    var rixn = this.rixn;
    var rjxn = this.rjxn;

    var C = bi.invMass + bj.invMass + eps;

    C += bi.invInertia * rixn * rixn;
    C += bj.invInertia * rjxn * rjxn;

    return C;
};
var computeGWlambda_ulambda = vec2.create();
ContactEquation.prototype.computeGWlambda = function(){
    var bi = this.bi;
    var bj = this.bj;
    var ulambda = computeGWlambda_ulambda;

    var GWlambda = 0.0;

    GWlambda -= vec2.dot(this.ni, bi.vlambda);
    GWlambda -= bi.wlambda * this.rixn;
    GWlambda += vec2.dot(this.ni, bj.vlambda);
    GWlambda += bj.wlambda * this.rjxn;

    return GWlambda;
};

var addToWlambda_temp = vec2.create();
ContactEquation.prototype.addToWlambda = function(deltalambda){
    var bi = this.bi,
        bj = this.bj,
        rixn = this.rixn,
        rjxn = this.rjxn,
        n = this.ni,
        temp = addToWlambda_temp;

    // Add to linear velocity
    vec2.scale(temp,n,-bi.invMass*deltalambda);
    vec2.add( bi.vlambda,bi.vlambda, temp );

    vec2.scale(temp,n,bj.invMass*deltalambda);
    vec2.add( bj.vlambda,bj.vlambda, temp);

    // Add to angular velocity
    bi.wlambda -= bi.invInertia * rixn * deltalambda;
    bj.wlambda += bj.invInertia * rjxn * deltalambda;
};


},{"../math/vec2":12,"./Equation":8}],7:[function(require,module,exports){
var Constraint = require('./Constraint').Constraint
,   ContactEquation = require('./ContactEquation').ContactEquation
,   vec2 = require('../math/vec2')

exports.DistanceConstraint = DistanceConstraint;

/**
 * Constraint that tries to keep the distance between two bodies constant.
 *
 * @class DistanceConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {number} dist The distance to keep between the bodies.
 * @param {number} maxForce
 * @extends {Constraint}
 */
function DistanceConstraint(bodyA,bodyB,distance,maxForce){
    Constraint.call(this,bodyA,bodyB);

    this.distance = distance;

    if(typeof(maxForce)==="undefined" ) {
        maxForce = 1e6;
    }

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new ContactEquation(bodyA,bodyB), // Just in the normal direction
    ];

    var normal = eqs[0];

    // Make the contact constraint bilateral
    normal.minForce = -maxForce;
    normal.maxForce =  maxForce;

}

DistanceConstraint.prototype = new Constraint();

/**
 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
 */
DistanceConstraint.prototype.update = function(){
    var normal = this.equations[0],
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        distance = this.distance;

    vec2.subtract(normal.ni, bodyB.position, bodyA.position);
    vec2.normalize(normal.ni,normal.ni);
    vec2.scale(normal.ri, normal.ni,  distance*0.5);
    vec2.scale(normal.rj, normal.ni, -distance*0.5);
};

},{"../math/vec2":12,"./Constraint":5,"./ContactEquation":6}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
var vec2 = require('../math/vec2')
,   Equation = require('./Equation').Equation

exports.FrictionEquation = FrictionEquation;

// 3D cross product from glmatrix, until we get this to work...
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

var dot = vec2.dot;

/**
 * Constrains the slipping in a contact along a tangent
 * @class FrictionEquation
 * @author schteppe
 * @param Body bi
 * @param Body bj
 * @param float slipForce should be +-F_friction = +-mu * F_normal = +-mu * m * g
 * @extends {Equation}
 */
function FrictionEquation(bi,bj,slipForce){
    Equation.call(this,bi,bj,-slipForce,slipForce);
    this.ri = vec2.create(); // Vector from center of body i to the contact point
    this.rj = vec2.create(); // Vector from center of body j to the contact point
    this.t = vec2.create();  // Tangent vector so that
    this.rixt = 0;
    this.rjxt = 0;
};
FrictionEquation.prototype = new Equation();
FrictionEquation.prototype.constructor = FrictionEquation;

/**
 * Set the slipping condition for the constraint. If the force
 * @method setSlipForce
 * @param  {Number} slipForce
 */
FrictionEquation.prototype.setSlipForce = function(slipForce){
    this.maxForce = slipForce;
    this.minForce = -slipForce;
};

var rixtVec = [0,0,0];
var rjxtVec = [0,0,0];
FrictionEquation.prototype.computeB = function(a,b,h){
    var a = this.a,
        b = this.b,
        bi = this.bi,
        bj = this.bj,
        ri = this.ri,
        rj = this.rj,
        rixt = this.rixt,
        rjxt = this.rjxt,
        t = this.t;

    // Caluclate cross products
    cross(rixtVec, [ri[0], ri[1], 0], [t[0], t[1], 0]);//ri.cross(t,rixt);
    cross(rjxtVec, [rj[0], rj[1], 0], [t[0], t[1], 0]);//rj.cross(t,rjxt);
    var rixt = this.rixt = rixtVec[2];
    var rjxt = this.rjxt = rjxtVec[2];

    var Gq = 0; // we do only want to constrain motion
    var GW = -dot(bi.velocity,t) + dot(bj.velocity,t) - rixt*bi.angularVelocity + rjxt*bj.angularVelocity; // eq. 40
    var GiMf = -dot(bi.force,t)*bi.invMass +dot(bj.force,t)*bj.invMass -rixt*bi.invInertia*bi.angularForce + rjxt*bj.invInertia*bj.angularForce;

    var B = - Gq * a - GW * b - h*GiMf;

    return B;
};

// Compute C = G * iM * G' + eps
//
// G*iM*G' =
//
//                             [ iM1          ] [-t     ]
// [-t (-ri x t) t (rj x t)] * [    iI1       ] [-ri x t]
//                             [       iM2    ] [t      ]
//                             [          iI2 ] [rj x t ]
//
// = (-t)*iM1*(-t) + (-ri x t)*iI1*(-ri x t) + t*iM2*t + (rj x t)*iI2*(rj x t)
//
// = t*iM1*t + (ri x t)*iI1*(ri x t) + t*iM2*t + (rj x t)*iI2*(rj x t)
//
FrictionEquation.prototype.computeC = function(eps){
    var bi = this.bi,
        bj = this.bj,
        rixt = this.rixt,
        rjxt = this.rjxt,
        C;

    C = bi.invMass + bj.invMass + eps;

    C += bi.invInertia * rixt * rixt;
    C += bj.invInertia * rjxt * rjxt;

    return C;
};

FrictionEquation.prototype.computeGWlambda = function(){
    var bi = this.bi;
    var bj = this.bj;
    var GWlambda = 0.0;

    GWlambda -= vec2.dot(this.t, bi.vlambda);
    GWlambda -= bi.wlambda * this.rixt;
    GWlambda += vec2.dot(this.t, bj.vlambda);
    GWlambda += bj.wlambda * this.rjxt;

    return GWlambda;
};

var FrictionEquation_addToWlambda_tmp = vec2.create();
FrictionEquation.prototype.addToWlambda = function(deltalambda){
    var bi = this.bi,
        bj = this.bj,
        rixt = this.rixt,
        rjxt = this.rjxt,
        t = this.t,
        tmp = FrictionEquation_addToWlambda_tmp;

    vec2.scale(tmp, t, -bi.invMass * deltalambda);  //t.mult(invMassi * deltalambda, tmp);
    vec2.add(bi.vlambda, bi.vlambda, tmp);          //bi.vlambda.vsub(tmp,bi.vlambda);

    vec2.scale(tmp, t, bj.invMass * deltalambda);   //t.mult(invMassj * deltalambda, tmp);
    vec2.add(bj.vlambda, bj.vlambda, tmp);          //bj.vlambda.vadd(tmp,bj.vlambda);

    bi.wlambda -= bi.invInertia * rixt * deltalambda;
    bj.wlambda += bj.invInertia * rjxt * deltalambda;
};

},{"../math/vec2":12,"./Equation":8}],10:[function(require,module,exports){
var Constraint = require('./Constraint').Constraint
,   ContactEquation = require('./ContactEquation').ContactEquation
,   vec2 = require('../math/vec2')

exports.PointToPointConstraint = PointToPointConstraint;

/**
 * Connects two bodies at given offset points
 * @class PointToPointConstraint
 * @constructor
 * @author schteppe
 * @param {Body}            bodyA
 * @param {Float32Array}    pivotA The point relative to the center of mass of bodyA which bodyA is constrained to.
 * @param {Body}            bodyB Body that will be constrained in a similar way to the same point as bodyA. We will therefore get sort of a link between bodyA and bodyB. If not specified, bodyA will be constrained to a static point.
 * @param {Float32Array}    pivotB See pivotA.
 * @param {Number}          maxForce The maximum force that should be applied to constrain the bodies.
 * @extends {Constraint}
 */
function PointToPointConstraint(bodyA, pivotA, bodyB, pivotB, maxForce){
    Constraint.call(this,bodyA,bodyB);

    maxForce = typeof(maxForce)!="undefined" ? maxForce : 1e7;

    this.pivotA = pivotA;
    this.pivotB = pivotB;

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new ContactEquation(bodyA,bodyB), // Normal
        new ContactEquation(bodyA,bodyB), // Tangent
    ];

    var normal =  eqs[0];
    var tangent = eqs[1];

    tangent.minForce = normal.minForce = -maxForce;
    tangent.maxForce = normal.maxForce =  maxForce;
}
PointToPointConstraint.prototype = new Constraint();

PointToPointConstraint.prototype.update = function(){
    var bodyA =  this.bodyA,
        bodyB =  this.bodyB,
        pivotA = this.pivotA,
        pivotB = this.pivotB,
        eqs =    this.equations,
        normal = eqs[0],
        tangent= eqs[1];

    vec2.subtract(normal.ni, bodyB.position, bodyA.position);
    vec2.normalize(normal.ni,normal.ni);
    vec2.rotate(normal.ri, pivotA, bodyA.angle);
    vec2.rotate(normal.rj, pivotB, bodyB.angle);

    vec2.rotate(tangent.ni, normal.ni, Math.PI / 2);
    vec2.copy(tangent.ri, normal.ri);
    vec2.copy(tangent.rj, normal.rj);
};

},{"../math/vec2":12,"./Constraint":5,"./ContactEquation":6}],11:[function(require,module,exports){
var EventEmitter = function () {}

exports.EventEmitter = EventEmitter;

EventEmitter.prototype = {
    constructor: EventEmitter,
    on: function ( type, listener ) {
        if ( this._listeners === undefined ) this._listeners = {};
        var listeners = this._listeners;
        if ( listeners[ type ] === undefined ) {
            listeners[ type ] = [];
        }
        if ( listeners[ type ].indexOf( listener ) === - 1 ) {
            listeners[ type ].push( listener );
        }
        return this;
    },
    has: function ( type, listener ) {
        if ( this._listeners === undefined ) return false;
        var listeners = this._listeners;
        if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {
            return true;
        }
        return false;
    },
    off: function ( type, listener ) {
        if ( this._listeners === undefined ) return;
        var listeners = this._listeners;
        var index = listeners[ type ].indexOf( listener );
        if ( index !== - 1 ) {
            listeners[ type ].splice( index, 1 );
        }
    },
    emit: function ( event ) {
        if ( this._listeners === undefined ) return;
        var listeners = this._listeners;
        var listenerArray = listeners[ event.type ];
        if ( listenerArray !== undefined ) {
            event.target = this;
            for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {
                listenerArray[ i ].call( this, event );
            }
        }
        return this;
    }
};

},{}],12:[function(require,module,exports){
/**
 * The vec2 object from glMatrix, extended with the functions documented here. See http://glmatrix.net for full doc.
 * @class vec2
 */

// Only import vec2 from gl-matrix and skip the rest
var vec2 = require('../../node_modules/gl-matrix/src/gl-matrix/vec2').vec2;

// Now add some extensions

/**
 * Get the vector x component
 * @method getX
 * @static
 * @param  {Float32Array} a
 * @return {Number}
 */
vec2.getX = function(a){
    return a[0];
};

/**
 * Get the vector y component
 * @method getY
 * @static
 * @param  {Float32Array} a
 * @return {Number}
 */
vec2.getY = function(a){
    return a[1];
};

/**
 * Make a cross product and only return the z component
 * @method crossLength
 * @static
 * @param  {Float32Array} a
 * @param  {Float32Array} b
 * @return {Number}
 */
vec2.crossLength = function(a,b){
    return a[0] * b[1] - a[1] * b[0];
};

/**
 * Cross product between a vector and the Z component of a vector
 * @method crossVZ
 * @static
 * @param  {Float32Array} out
 * @param  {Float32Array} vec
 * @param  {Number} zcomp
 * @return {Number}
 */
vec2.crossVZ = function(out, vec, zcomp){
    vec2.rotate(out,vec,-Math.PI/2);// Rotate according to the right hand rule
    vec2.scale(out,out,zcomp);      // Scale with z
    return out;
};

/**
 * Cross product between a vector and the Z component of a vector
 * @method crossZV
 * @static
 * @param  {Float32Array} out
 * @param  {Number} zcomp
 * @param  {Float32Array} vec
 * @return {Number}
 */
vec2.crossZV = function(out, zcomp, vec){
    vec2.rotate(out,vec,Math.PI/2); // Rotate according to the right hand rule
    vec2.scale(out,out,zcomp);      // Scale with z
    return out;
};

/**
 * Rotate a vector by an angle
 * @method rotate
 * @static
 * @param  {Float32Array} out
 * @param  {Float32Array} a
 * @param  {Number} angle
 */
vec2.rotate = function(out,a,angle){
    var c = Math.cos(angle),
        s = Math.sin(angle);
    out[0] = c*a[0] -s*a[1];
    out[1] = s*a[0] +c*a[1];
};

// Export everything
module.exports = vec2;

},{"../../node_modules/gl-matrix/src/gl-matrix/vec2":1}],13:[function(require,module,exports){
var vec2 = require('../math/vec2');

exports.Body = Body;
exports.Spring = Spring;

/**
 * A spring, connecting two bodies.
 *
 * @class Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} options.restLength A number > 0. Default: 1
 * @param {number} options.stiffness A number >= 0. Default: 100
 * @param {number} options.damping A number >= 0. Default: 1
 */
function Spring(bodyA,bodyB,options){
    options = options || {};

    /**
     * Rest length of the spring.
     * @property restLength
     * @type {number}
     */
    this.restLength = options.restLength || 1;

    /**
     * Stiffness of the spring.
     * @property stiffness
     * @type {number}
     */
    this.stiffness = options.stiffness || 100;

    /**
     * Damping of the spring.
     * @property damping
     * @type {number}
     */
    this.damping = options.damping || 1;

    /**
     * First connected body.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second connected body.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;
};

/**
 * A physics body.
 *
 * @class Body
 * @constructor
 * @param {Object}          [options]
 * @param {Shape}           options.shape           Used for collision detection. If absent the body will not collide.
 * @param {number}          options.mass            A number >= 0. If zero, the body becomes static. Defaults to static [0].
 * @param {Float32Array}    options.position
 * @param {Float32Array}    options.velocity
 * @param {number}          options.angle
 * @param {number}          options.angularVelocity
 * @param {Float32Array}    options.force
 * @param {number}          options.angularForce
 */
function Body(options){
    options = options || {};

    /**
     * The body identifyer
     * @property id
     * @type {Number}
     */
    this.id = ++Body._idCounter;

    /**
     * The shape belonging to the body.
     * @property shape
     * @type {Shape}
     */
    this.shape = options.shape;

    /**
     * The mass of the body.
     * @property mass
     * @type {number}
     */
    this.mass = options.mass || 0;

    /**
     * The inverse mass of the body.
     * @property invMass
     * @type {number}
     */
    this.invMass = 0;

    /**
     * The inertia of the body around the Z axis.
     * @property inertia
     * @type {number}
     */
    this.inertia = 0;

    /**
     * The inverse inertia of the body.
     * @property invInertia
     * @type {number}
     */
    this.invInertia = 0;

    this.updateMassProperties();

    /**
     * The position of the body
     * @property position
     * @type {Float32Array}
     */
    this.position = vec2.create();
    if(options.position) vec2.copy(this.position, options.position);

    /**
     * The velocity of the body
     * @property velocity
     * @type {Float32Array}
     */
    this.velocity = vec2.create();
    if(options.velocity) vec2.copy(this.velocity, options.velocity);

    this.vlambda = vec2.fromValues(0,0);
    this.wlambda = 0;

    /**
     * The angle of the body
     * @property angle
     * @type {number}
     */
    this.angle = options.angle || 0;

    /**
     * The angular velocity of the body
     * @property angularVelocity
     * @type {number}
     */
    this.angularVelocity = options.angularVelocity || 0;

    /**
     * The force acting on the body
     * @property force
     * @type {Float32Array}
     */
    this.force = vec2.create();
    if(options.force) vec2.copy(this.force, options.force);

    /**
     * The angular force acting on the body
     * @property angularForce
     * @type {number}
     */
    this.angularForce = options.angularForce || 0;

    /**
     * The type of motion this body has. Should be one of: Body.STATIC, Body.DYNAMIC and Body.KINEMATIC.
     * @property motionState
     * @type {number}
     */
    this.motionState = this.mass == 0 ? Body.STATIC : Body.DYNAMIC;
};

Body._idCounter = 0;

Body.prototype.updateMassProperties = function(){
    // Mass should already be given
    var m = this.mass,
        I = this.inertia,
        s = this.shape;

    if(s){
        I = s.computeMomentOfInertia(m);
    } else {
        m = 0;
        I = 0;
    }

    this.mass = m;
    this.inertia = I;

    // Inverse mass properties are easy
    this.invMass = m > 0 ? 1/m : 0;
    this.invInertia = I>0 ? 1/I : 0;
};

/**
 * Apply force to a world point. This could for example be a point on the RigidBody surface. Applying force this way will add to Body.force and Body.angularForce.
 * @method applyForce
 * @param {Float32Array} force The force to add.
 * @param {Float32Array} worldPoint A world point to apply the force on.
 */
var Body_applyForce_r = vec2.create();
Body.prototype.applyForce = function(force,worldPoint){
    // Compute point position relative to the body center
    var r = Body_applyForce_r;
    vec2.sub(r,worldPoint,this.position);

    // Add linear force
    vec2.add(this.force,this.force,force);

    // Compute produced rotational force
    var rotForce = vec2.crossLength(r,force);

    // Add rotational force
    this.angularForce += rotForce;
};

/**
 * Dynamic body.
 * @property DYNAMIC
 * @type {Number}
 * @static
 */
Body.DYNAMIC = 1;

/**
 * Static body.
 * @property STATIC
 * @type {Number}
 * @static
 */
Body.STATIC = 2;

/**
 * Kinematic body.
 * @property KINEMATIC
 * @type {Number}
 * @static
 */
Body.KINEMATIC = 4;

},{"../math/vec2":12}],14:[function(require,module,exports){
exports.Shape = Shape;
exports.Particle = Particle;
exports.Compound = Compound;
exports.Circle = Circle;
exports.Plane = Plane;
exports.Convex = Convex;
exports.Line = Line;

/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 */
function Shape(){

};

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
    Shape.apply(this);
};
Particle.prototype = new Shape();
Particle.prototype.computeMomentOfInertia = function(mass){
    return 0; // Can't rotate a particle
};


/**
 * Circle shape class.
 * @class Circle
 * @extends {Shape}
 * @constructor
 * @param {number} radius
 */
function Circle(radius){
    Shape.apply(this);

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
    Shape.apply(this);
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
    Shape.apply(this);

    /**
     * Vertices defined in the local frame.
     * @property vertices
     * @type {Array}
     */
    this.vertices = vertices;
};
Convex.prototype = new Shape();
Convex.prototype.computeMomentOfInertia = function(mass){
    return 1;
};

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 * @class Plane
 * @extends {Shape}
 * @constructor
 */
function Line(length){
    Shape.apply(this);
    this.length = length;
};
Line.prototype = new Shape();
Line.prototype.computeMomentOfInertia = function(mass){
    return 1;
};

/**
 * Compound shape class. Use it if you need several basic shapes in your body.
 * @class Compound
 * @extends {Shape}
 * @constructor
 */
function Compound(){
    Shape.apply(this);
    this.children       = [];
    this.childOffsets   = [];
    this.childAngles    = [];
};
Compound.prototype = new Shape();
Compound.prototype.computeMomentOfInertia = function(mass){
    return 1; // Todo
};

Compound.prototype.addChild = function(shape,offset,angle){
    this.children.push(shape);
    this.childOffsets.push(offset);
    this.childAngles.push(angle);
};

},{}],15:[function(require,module,exports){
// Export p2 classes
exports.Body =                  require('./objects/Body')                       .Body;
exports.Broadphase =            require('./collision/Broadphase')               .Broadphase;
exports.Circle =                require('./objects/Shape')                      .Circle;
exports.Compound =              require('./objects/Shape')                      .Compound;
exports.Constraint =            require('./constraints/Constraint')             .Constraint;
exports.ContactEquation =       require('./constraints/ContactEquation')        .ContactEquation;
exports.DistanceConstraint=     require('./constraints/DistanceConstraint')     .DistanceConstraint;
exports.Equation =              require('./constraints/Equation')               .Equation;
exports.EventEmitter =          require('./events/EventEmitter')                .EventEmitter;
exports.FrictionEquation =      require('./constraints/FrictionEquation')       .FrictionEquation;
exports.GridBroadphase =        require('./collision/GridBroadphase')           .GridBroadphase;
exports.GSSolver =              require('./solver/GSSolver')                    .GSSolver;
exports.Island =                require('./solver/IslandSolver')                .Island;
exports.IslandSolver =          require('./solver/IslandSolver')                .IslandSolver;
exports.Line =                  require('./objects/Shape')                      .Line;
exports.NaiveBroadphase =       require('./collision/NaiveBroadphase')          .NaiveBroadphase;
exports.Particle =              require('./objects/Shape')                      .Particle;
exports.Plane =                 require('./objects/Shape')                      .Plane;
exports.PointToPointConstraint= require('./constraints/PointToPointConstraint') .PointToPointConstraint;
exports.Shape =                 require('./objects/Shape')                      .Shape;
exports.Solver =                require('./solver/Solver')                      .Solver;
exports.Spring =                require('./objects/Body')                       .Spring;
exports.World =                 require('./world/World')                        .World;

// Export the gl-matrix stuff we already use internally. Why shouldn't we? It's already in the bundle.
exports.vec2 = require('./math/vec2');

},{"./collision/Broadphase":2,"./collision/GridBroadphase":3,"./collision/NaiveBroadphase":4,"./constraints/Constraint":5,"./constraints/ContactEquation":6,"./constraints/DistanceConstraint":7,"./constraints/Equation":8,"./constraints/FrictionEquation":9,"./constraints/PointToPointConstraint":10,"./events/EventEmitter":11,"./math/vec2":12,"./objects/Body":13,"./objects/Shape":14,"./solver/GSSolver":16,"./solver/IslandSolver":17,"./solver/Solver":18,"./world/World":19}],16:[function(require,module,exports){
var vec2 = require('../math/vec2'),
    Solver = require('./Solver').Solver;

exports.GSSolver = GSSolver;

var ARRAY_TYPE = Float32Array || Array;

/**
 * Iterative Gauss-Seidel constraint equation solver.
 *
 * @class GSSolver
 * @constructor
 * @extends Solver
 * @param {Object} [options]
 * @param {Number} options.iterations
 * @param {Number} options.timeStep
 * @param {Number} options.stiffness
 * @param {Number} options.relaxation
 * @param {Number} options.tolerance
 */
function GSSolver(options){
    Solver.call(this);
    options = options || {};
    this.iterations = options.iterations || 10;
    this.h = options.timeStep || 1.0/60.0;
    this.k = options.stiffness || 1e7;
    this.d = options.relaxation || 6;
    this.a = 0.0;
    this.b = 0.0;
    this.eps = 0.0;
    this.tolerance = options.tolerance || 0;
    this.setSpookParams(this.k, this.d);
    this.debug = options.debug || false;
    this.arrayStep = 30;
    this.lambda = new ARRAY_TYPE(this.arrayStep);
    this.Bs =     new ARRAY_TYPE(this.arrayStep);
    this.invCs =  new ARRAY_TYPE(this.arrayStep);

    this.setSpookParams(1e6,4);
};
GSSolver.prototype = new Solver();

/**
 * Set stiffness parameters
 *
 * @method setSpookParams
 * @param  {number} k
 * @param  {number} d
 */
GSSolver.prototype.setSpookParams = function(k,d){
    var h=this.h;
    this.k = k;
    this.d = d;
    this.a = 4.0 / (h * (1 + 4 * d));
    this.b = (4.0 * d) / (1 + 4 * d);
    this.eps = 4.0 / (h * h * k * (1 + 4 * d));
};

/**
 * Solve the system of equations
 * @method solve
 * @param  {Number}  dt       Time step
 * @param  {World}   world    World to solve
 */
GSSolver.prototype.solve = function(dt,world){
    var d = this.d,
        ks = this.k,
        iter = 0,
        maxIter = this.iterations,
        tolSquared = this.tolerance*this.tolerance,
        a = this.a,
        b = this.b,
        eps = this.eps,
        equations = this.equations,
        Neq = equations.length,
        bodies = world.bodies,
        Nbodies = world.bodies.length,
        h = dt;

    // Things that does not change during iteration can be computed once
    if(this.lambda.length < Neq){
        this.lambda = new ARRAY_TYPE(Neq + this.arrayStep);
        this.Bs =     new ARRAY_TYPE(Neq + this.arrayStep);
        this.invCs =  new ARRAY_TYPE(Neq + this.arrayStep);
    }
    var invCs = this.invCs;
    var Bs = this.Bs;
    var lambda = this.lambda;

    // Create array for lambdas
    for(var i=0; i!==Neq; i++){
        var c = equations[i];
        lambda[i] = 0.0;
        Bs[i] = c.computeB(a,b,h);
        invCs[i] = 1.0 / c.computeC(eps);
    }

    var q, B, c, invC, deltalambda, deltalambdaTot, GWlambda, lambdaj;

    if(Neq !== 0){
        var i,j, minForce, maxForce, lambdaj_plus_deltalambda;

        // Reset vlambda
        for(i=0; i!==Nbodies; i++){
            var b=bodies[i], vlambda=b.vlambda;
            vec2.set(vlambda,0,0);
            b.wlambda = 0;
        }

        // Iterate over equations
        for(iter=0; iter!==maxIter; iter++){

            // Accumulate the total error for each iteration.
            deltalambdaTot = 0.0;

            for(j=0; j!==Neq; j++){

                c = equations[j];

                // Compute iteration
                maxForce = c.maxForce;
                minForce = c.minForce;
                B = Bs[j];
                invC = invCs[j];
                lambdaj = lambda[j];
                GWlambda = c.computeGWlambda(eps);
                deltalambda = invC * ( B - GWlambda - eps * lambdaj );

                // Clamp if we are not within the min/max interval
                lambdaj_plus_deltalambda = lambdaj + deltalambda;
                if(lambdaj_plus_deltalambda < minForce){
                    deltalambda = minForce - lambdaj;
                } else if(lambdaj_plus_deltalambda > maxForce){
                    deltalambda = maxForce - lambdaj;
                }
                lambda[j] += deltalambda;

                deltalambdaTot += Math.abs(deltalambda);

                c.addToWlambda(deltalambda);
            }

            // If the total error is small enough - stop iterate
            if(deltalambdaTot*deltalambdaTot <= tolSquared) break;
        }

        // Add result to velocity
        for(i=0; i!==Nbodies; i++){
            var b=bodies[i], v=b.velocity;
            vec2.add( v, v, b.vlambda);
            b.angularVelocity += b.wlambda;
        }
    }
    errorTot = deltalambdaTot;
};


},{"../math/vec2":12,"./Solver":18}],17:[function(require,module,exports){
var Solver = require('./Solver').Solver
,   ContactEquation = require('../constraints/ContactEquation').ContactEquation
,   vec2 = require('../math/vec2')
,   Body = require('../objects/Body').Body
,   STATIC = Body.STATIC

exports.IslandSolver = IslandSolver;
exports.Island = Island;

/**
 * Splits the system of bodies and equations into independent islands
 *
 * @class IslandSolver
 * @constructor
 * @param {Solver} subsolver
 * @extends Solver
 */
function IslandSolver(subsolver){
    Solver.call(this);
    var that = this;

    /**
     * The solver used in the workers.
     * @property subsolver
     * @type {Solver}
     */
    this.subsolver = subsolver;

    /**
     * Number of islands
     * @property numIslands
     * @type {number}
     */
    this.numIslands = 0;

    // Pooling of node objects saves some GC load
    this._nodePool = [];
};
IslandSolver.prototype = new Object(Solver.prototype);

function getUnvisitedNode(nodes){
    var Nnodes = nodes.length;
    for(var i=0; i!==Nnodes; i++){
        var node = nodes[i];
        if(!node.visited && !(node.body.motionState & STATIC)){ // correct?
            return node;
        }
    }
    return false;
}

function bfs(root,visitFunc){
    var queue = [];
    queue.push(root);
    root.visited = true;
    visitFunc(root);
    while(queue.length) {
        var node = queue.pop();
        // Loop over unvisited child nodes
        var child;
        while((child = getUnvisitedNode(node.children))) {
            child.visited = true;
            visitFunc(child);
            queue.push(child);
        }
    }
}

/**
 * Solves the full system.
 * @method solve
 * @param  {Number} dt
 * @param  {World} world
 */
IslandSolver.prototype.solve = function(dt,world){
    var nodes = [],
        bodies=world.bodies,
        equations=this.equations,
        Neq=equations.length,
        Nbodies=bodies.length,
        subsolver=this.subsolver,
        workers = this._workers,
        workerData = this._workerData,
        workerIslandGroups = this._workerIslandGroups;

    // Create needed nodes, reuse if possible
    for(var i=0; i!==Nbodies; i++){
        if(this._nodePool.length)
            nodes.push( this._nodePool.pop() );
        else {
            nodes.push({
                body:bodies[i],
                children:[],
                eqs:[],
                visited:false
            });
        }
    }

    // Reset node values
    for(var i=0; i!==Nbodies; i++){
        var node = nodes[i];
        node.body = bodies[i];
        node.children.length = 0;
        node.eqs.length = 0;
        node.visited = false;
    }

    // Add connectivity data. Each equation connects 2 bodies.
    for(var k=0; k!==Neq; k++){
        var eq=equations[k],
            i=bodies.indexOf(eq.bi),
            j=bodies.indexOf(eq.bj),
            ni=nodes[i],
            nj=nodes[j];
        ni.children.push(nj);
        ni.eqs.push(eq);
        nj.children.push(ni);
        nj.eqs.push(eq);
    }

    // The BFS search algorithm needs a traversal function. What we do is gather all bodies and equations connected.
    var child, n=0, eqs=[], bds=[];
    function visitFunc(node){
        bds.push(node.body);
        var Neqs = node.eqs.length;
        for(var i=0; i!==Neqs; i++){
            var eq = node.eqs[i];
            if(eqs.indexOf(eq) === -1){
                eqs.push(eq);
            }
        }
    }

    // Get islands
    var islands = [];
    while((child = getUnvisitedNode(nodes))){
        var island = new Island(); // @todo Should be reused from somewhere
        eqs.length = 0;
        bds.length = 0;
        bfs(child,visitFunc); // run search algo to gather an island of bodies

        // Add equations to island
        var Neqs = eqs.length;
        for(var i=0; i!==Neqs; i++){
            var eq = eqs[i];
            island.equations.push(eq);
        }

        n++;
        islands.push(island);
    }

    this.numIslands = n;

    // Solve islands
    for(var i=0; i<islands.length; i++){
        islands[i].solve(dt,this.subsolver);
    }
};

/**
 * An island of bodies connected with equations.
 * @class Island
 * @constructor
 */
function Island(){

    /**
     * Current equations in this island.
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Current bodies in this island.
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];
}

/**
 * Clean this island from bodies and equations.
 * @method reset
 */
Island.prototype.reset = function(){
    this.equations.length = this.bodies.length = 0;
}


/**
 * Get all unique bodies in this island.
 * @method getBodies
 * @return {Array} An array of Body
 */
Island.prototype.getBodies = function(){
    var bodies = [],
        bodyIds = [],
        eqs = this.equations;
    for(var i=0; i!==eqs.length; i++){
        var eq = eqs[i];
        if(bodyIds.indexOf(eq.bi.id)===-1){
            bodies.push(eq.bi);
            bodyIds.push(eq.bi.id);
        }
        if(bodyIds.indexOf(eq.bj.id)===-1){
            bodies.push(eq.bj);
            bodyIds.push(eq.bj.id);
        }
    }
    return bodies;
};

/**
 * Solves all constraints in the group of islands.
 * @method solve
 * @param  {Number} dt
 * @param  {Solver} solver
 */
Island.prototype.solve = function(dt,solver){
    var bodies = [];

    solver.removeAllEquations();

    // Add equations to solver
    var numEquations = this.equations.length;
    for(var j=0; j!==numEquations; j++){
        solver.addEquation(this.equations[j]);
    }
    var islandBodies = this.getBodies();
    var numBodies = islandBodies.length;
    for(var j=0; j!==numBodies; j++){
        bodies.push(islandBodies[j]);
    }

    // Solve
    solver.solve(dt,{bodies:bodies});
};

},{"../constraints/ContactEquation":6,"../math/vec2":12,"../objects/Body":13,"./Solver":18}],18:[function(require,module,exports){
exports.Solver = Solver;

/**
 * Base class for constraint solvers.
 * @class Solver
 * @constructor
 */
function Solver(){

    /**
     * Current equations in the solver.
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];
};

Solver.prototype.solve = function(dt,world){
    throw new Error("Solver.solve should be implemented by subclasses!");
};

/**
 * Add an equation to be solved.
 *
 * @method addEquation
 * @param {Equation} eq
 */
Solver.prototype.addEquation = function(eq){
    this.equations.push(eq);
};

/**
 * Remove an equation.
 *
 * @method removeEquation
 * @param {Equation} eq
 */
Solver.prototype.removeEquation = function(eq){
    var i = this.equations.indexOf(eq);
    if(i!=-1)
        this.equations.splice(i,1);
};

/**
 * Remove all currently added equations.
 *
 * @method removeAllEquations
 */
Solver.prototype.removeAllEquations = function(){
    this.equations = [];
};


},{}],19:[function(require,module,exports){
var GSSolver = require('../solver/GSSolver').GSSolver,
    NaiveBroadphase = require('../collision/NaiveBroadphase').NaiveBroadphase,
    vec2 = require('../math/vec2'),
    Circle = require('../objects/Shape').Circle,
    Compound = require('../objects/Shape').Compound,
    Line = require('../objects/Shape').Line,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    EventEmitter = require('../events/EventEmitter').EventEmitter,
    Body = require('../objects/Body').Body,
    DistanceConstraint = require('../constraints/DistanceConstraint').DistanceConstraint,
    PointToPointConstraint = require('../constraints/PointToPointConstraint').PointToPointConstraint,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase;

exports.World = World;

function now(){
    if(performance.now)
        return performance.now();
    else if(performance.webkitNow)
        return performance.webkitNow();
    else
        return new Date().getTime();
}

/**
 * The dynamics world, where all bodies and constraints lives.
 *
 * @class World
 * @constructor
 * @param {Object}          [options]
 * @param {Solver}          options.solver Defaults to GSSolver.
 * @param {Float32Array}    options.gravity Defaults to [0,-9.78]
 * @param {Broadphase}      options.broadphase Defaults to NaiveBroadphase
 * @extends {EventEmitter}
 */
function World(options){
    EventEmitter.apply(this);

    options = options || {};

    /**
     * All springs in the world.
     *
     * @property springs
     * @type {Array}
     */
    this.springs = [];

    /**
     * All bodies in the world.
     *
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];

    /**
     * The solver used to satisfy constraints and contacts.
     *
     * @property solver
     * @type {Solver}
     */
    this.solver = options.solver || new GSSolver();

    /**
     * The contacts in the world that were generated during the last step().
     *
     * @property contacts
     * @type {Array}
     */
    this.contacts = [];
    this.oldContacts = [];

    this.frictionEquations = [];
    this.oldFrictionEquations = [];

    /**
     * Gravity in the world. This is applied on all bodies in the beginning of each step().
     *
     * @property
     * @type {Float32Array}
     */
    this.gravity = options.gravity || vec2.fromValues(0, -9.78);

    /**
     * Whether to do timing measurements during the step() or not.
     *
     * @property doPofiling
     * @type {Boolean}
     */
    this.doProfiling = options.doProfiling || false;

    /**
     * How many millisecconds the last step() took. This is updated each step if .doProfiling is set to true.
     *
     * @property lastStepTime
     * @type {Number}
     */
    this.lastStepTime = 0.0;

    /**
     * The broadphase algorithm to use.
     *
     * @property broadphase
     * @type {Broadphase}
     */
    this.broadphase = options.broadphase || new NaiveBroadphase();

    /**
     * User-added constraints.
     *
     * @property constraints
     * @type {Array}
     */
    this.constraints = [];

    // Id counters
    this._constraintIdCounter = 0;
    this._bodyIdCounter = 0;

    // Event objects that are reused
    this.postStepEvent = {
        type : "postStep",
    };
    this.addBodyEvent = {
        type : "addBody",
        body : null
    };
    this.addSpringEvent = {
        type : "addSpring",
        body : null
    };
};
World.prototype = new Object(EventEmitter.prototype);

/**
 * Add a constraint to the simulation.
 *
 * @method addConstraint
 * @param {Constraint} c
 */
World.prototype.addConstraint = function(c){
    this.constraints.push(c);
    c.id = this._constraintIdCounter++;
};

/**
 * Removes a constraint
 *
 * @method removeConstraint
 * @param {Constraint} c
 */
World.prototype.removeConstraint = function(c){
    var idx = this.constraints.indexOf(c);
    if(idx!==-1){
        this.constraints.splice(idx,1);
    }
};

var step_r = vec2.create();
var step_runit = vec2.create();
var step_u = vec2.create();
var step_f = vec2.create();
var step_fhMinv = vec2.create();
var step_velodt = vec2.create();

/**
 * Step the physics world forward in time.
 *
 * @method step
 * @param {Number} dt The time step size to use.
 * @param {Function} callback Called when done.
 */
World.prototype.step = function(dt){
    var that = this,
        doProfiling = this.doProfiling,
        Nsprings = this.springs.length,
        springs = this.springs,
        bodies = this.bodies,
        g = this.gravity,
        solver = this.solver,
        Nbodies = this.bodies.length,
        broadphase = this.broadphase,
        constraints = this.constraints,
        t0, t1;

    if(doProfiling){
        t0 = now();
    }

    // add gravity to bodies
    for(var i=0; i!==Nbodies; i++){
        var fi = bodies[i].force;
        vec2.add(fi,fi,g);
    }

    // Calculate all new spring forces
    for(var i=0; i!==Nsprings; i++){
        var s = springs[i];
        var k = s.stiffness;
        var d = s.damping;
        var l = s.restLength;
        var bodyA = s.bodyA;
        var bodyB = s.bodyB;
        var r = step_r;
        var r_unit = step_runit;
        var u = step_u;
        var f = step_f;

        vec2.sub(r,bodyA.position,bodyB.position);
        vec2.sub(u,bodyA.velocity,bodyB.velocity);
        var rlen = vec2.len(r);
        vec2.normalize(r_unit,r);
        vec2.scale(f, r_unit, k*(rlen-l) + d*vec2.dot(u,r_unit));
        vec2.sub( bodyA.force,bodyA.force, f);
        vec2.add( bodyB.force,bodyB.force, f);
    }

    // Broadphase
    var result = broadphase.getCollisionPairs(this);

    // Nearphase
    var oldContacts = this.contacts.concat(this.oldContacts);
    var oldFrictionEquations = this.frictionEquations.concat(this.oldFrictionEquations);
    var contacts = this.contacts = [];
    var frictionEquations = this.frictionEquations = [];
    var glen = vec2.length(this.gravity);
    for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
        var bi = result[i],
            bj = result[i+1],
            si = bi.shape,
            sj = bj.shape;

        var reducedMass = (bi.invMass + bj.invMass);
        if(reducedMass > 0)
            reducedMass = 1/reducedMass;

        var mu = 0.1; // Todo: Should be looked up in a material table
        var mug = mu * glen * reducedMass;
        var doFriction = mu>0;

        if(si instanceof Circle){
                 if(sj instanceof Circle)   bp.nearphaseCircleCircle  (bi,bj,contacts,oldContacts,doFriction,frictionEquations,oldFrictionEquations,mug);
            else if(sj instanceof Particle) bp.nearphaseCircleParticle(bi,bj,contacts,oldContacts);
            else if(sj instanceof Plane)    bp.nearphaseCirclePlane   (bi,bj,contacts,oldContacts,doFriction,frictionEquations,oldFrictionEquations,mug);

        } else if(si instanceof Particle){
                 if(sj instanceof Circle)   bp.nearphaseCircleParticle(bj,bi,contacts,oldContacts);
            else if(sj instanceof Plane)    bp.nearphaseParticlePlane (bi,bj,contacts,oldContacts);

        } else if(si instanceof Plane){
                 if(sj instanceof Circle)   bp.nearphaseCirclePlane   (bj,bi,contacts,oldContacts,doFriction,frictionEquations,oldFrictionEquations,mug);
            else if(sj instanceof Particle) bp.nearphaseParticlePlane (bj,bi,contacts,oldContacts);
            else if(sj instanceof Compound) bp.nearphaseCompoundPlane (bj,bi,contacts,oldContacts,doFriction,frictionEquations,oldFrictionEquations,mug);

        } else if(si instanceof Compound){
                 if(sj instanceof Plane)    bp.nearphaseCompoundPlane (bi,bj,contacts,oldContacts,doFriction,frictionEquations,oldFrictionEquations,mug);

        }
    }
    this.oldContacts = oldContacts;
    this.oldFrictionEquations = oldFrictionEquations;

    // Add contact equations to solver
    for(var i=0, Ncontacts=contacts.length; i!==Ncontacts; i++){
        solver.addEquation(contacts[i]);
    }
    for(var i=0, Nfriction=frictionEquations.length; i!==Nfriction; i++){
        solver.addEquation(frictionEquations[i]);
    }

    // Add user-defined constraint equations
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        var c = constraints[i];
        c.update();
        for(var j=0, Neq=c.equations.length; j!==Neq; j++){
            var eq = c.equations[j];
            solver.addEquation(eq);
        }
    }
    solver.solve(dt,this);

    solver.removeAllEquations();

    // Step forward
    var fhMinv = step_fhMinv;
    var velodt = step_velodt;
    for(var i=0; i!==Nbodies; i++){
        var body = bodies[i];
        if(body.mass>0){
            var minv = 1.0 / body.mass,
                f = body.force,
                pos = body.position,
                velo = body.velocity;

            // Angular step
            body.angularVelocity += body.angularForce * body.invInertia * dt;
            body.angle += body.angularVelocity * dt;

            // Linear step
            vec2.scale(fhMinv,f,dt*minv);
            vec2.add(velo,fhMinv,velo);
            vec2.scale(velodt,velo,dt);
            vec2.add(pos,pos,velodt);
        }
    }

    // Reset force
    for(var i=0; i!==Nbodies; i++){
        var bi = bodies[i];
        vec2.set(bi.force,0.0,0.0);
        bi.angularForce = 0.0;
    }

    if(doProfiling){
        t1 = now();
        that.lastStepTime = t1-t0;
    }

    this.emit(this.postStepEvent);
};

/**
 * Add a spring to the simulation
 *
 * @method addSpring
 * @param {Spring} s
 */
World.prototype.addSpring = function(s){
    this.springs.push(s);
    this.addSpringEvent.spring = s;
    this.emit(this.addSpringEvent);
};

/**
 * Remove a spring
 *
 * @method removeSpring
 * @param {Spring} s
 */
World.prototype.removeSpring = function(s){
    var idx = this.springs.indexOf(s);
    if(idx===-1)
        this.springs.splice(idx,1);
};

/**
 * Add a body to the simulation
 *
 * @method addBody
 * @param {Body} body
 */
World.prototype.addBody = function(body){
    this.bodies.push(body);
    this.addBodyEvent.body = body;
    this.emit(this.addBodyEvent);
};

/**
 * Remove a body from the simulation
 *
 * @method removeBody
 * @param {Body} body
 */
World.prototype.removeBody = function(body){
    var idx = this.bodies.indexOf(body);
    if(idx!==-1)
        this.bodies.splice(idx,1);
};

/**
 * Convert the world to a JSON-serializable Object.
 *
 * @method toJSON
 * @return {Object}
 */
World.prototype.toJSON = function(){
    var json = {
        p2 : "0.1.0",
        bodies : [],
        springs : [],
        solver : {},
        gravity : v2a(this.gravity),
        broadphase : {},
        constraints : [],
    };

    // Serialize springs
    for(var i=0; i<this.springs.length; i++){
        var s = this.springs[i];
        json.springs.push({
            bodyA : this.bodies.indexOf(s.bodyA),
            bodyB : this.bodies.indexOf(s.bodyB),
            stiffness : s.stiffness,
            damping : s.damping,
            restLength : s.restLength,
        });
    }

    // Serialize constraints
    for(var i=0; i<this.constraints.length; i++){
        var c = this.constraints[i];
        var jc = {
            bodyA : this.bodies.indexOf(c.bodyA),
            bodyB : this.bodies.indexOf(c.bodyB),
        }
        if(c instanceof DistanceConstraint){
            jc.type = "DistanceConstraint";
            jc.distance = c.distance;
        } else if(c instanceof PointToPointConstraint){
            jc.type = "PointToPointConstraint";
            jc.pivotA = v2a(c.pivotA);
            jc.pivotB = v2a(c.pivotB);
            jc.maxForce = c.maxForce;
        } else
            throw new Error("Constraint not supported yet!");

        json.constraints.push(jc);
    }

    // Serialize bodies
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i],
            s = b.shape,
            jsonShape = null;
        if(!s){
            // No shape
        } else if(s instanceof Circle){
            jsonShape = {
                type : "Circle",
                radius : s.radius,
            };
        } else if(s instanceof Plane){
            jsonShape = {
                type : "Plane",
            };
        } else if(s instanceof Particle){
            jsonShape = {
                type : "Particle",
            };
        } else if(s instanceof Line){
            jsonShape = {
                type : "Line",
                length : s.length
            };
        } else if(s instanceof Compound){
            jsonShape = {
                type : "Compound",
                // TODO: CHILDREN
            };
        } else {
            throw new Error("Shape type not supported yet!");
        }
        json.bodies.push({
            mass : b.mass,
            angle : b.angle,
            position : v2a(b.position),
            velocity : v2a(b.velocity),
            angularVelocity : b.angularVelocity,
            force : v2a(b.force),
            shape : jsonShape,
        });
    }
    return json;

    function v2a(v){
        return [v[0],v[1]];
    }
};

/**
 * Load a scene from a serialized state.
 *
 * @method fromJSON
 * @param  {Object} json
 * @return {Boolean} True on success, else false.
 */
World.prototype.fromJSON = function(json){
    this.clear();

    if(!json.p2)
        return false;

    switch(json.p2){

        case "0.1.0":

            // Set gravity
            vec2.copy(world.gravity, json.gravity);

            // Load bodies
            for(var i=0; i<json.bodies.length; i++){
                var jb = json.bodies[i],
                    js = jb.shape,
                    shape = null;
                if(js){
                    switch(js.type){
                        case "Circle":
                            shape = new Circle(js.radius);
                            break;
                        case "Plane":
                            shape = new Plane();
                            break;
                        case "Particle":
                            shape = new Particle();
                            break;
                        case "Line":
                            shape = new Line(js.length);
                            break;
                        case "Compound":
                            shape = new Compound();
                            break;
                        default:
                            throw new Error("Shape type not supported: "+js.type);
                            break;
                    }
                }
                var b = new Body({
                    mass :              jb.mass,
                    position :          jb.position,
                    angle :             jb.angle,
                    velocity :          jb.velocity,
                    angularVelocity :   jb.angularVelocity,
                    force :             jb.force,
                    shape :             shape,
                });
                this.addBody(b);
            }

            // Load springs
            for(var i=0; i<json.springs.length; i++){
                var js = json.springs[i];
                var s = new Spring(this.bodies[js.bodyA], this.bodies[js.bodyB], {
                    stiffness : js.stiffness,
                    damping : js.damping,
                    restLength : js.restLength,
                });
                this.addSpring(s);
            }

            // Load constraints
            for(var i=0; i<json.constraints.length; i++){
                var jc = json.constraints[i],
                    c;
                switch(jc.type){
                    case "DistanceConstraint":
                        c = new DistanceConstraint(this.bodies[jc.bodyA], this.bodies[jc.bodyB], jc.distance);
                        break;
                    case "PointToPointConstraint":
                        c = new PointToPointConstraint(this.bodies[jc.bodyA], jc.pivotA, this.bodies[jc.bodyB], jc.pivotB, jc.maxForce);
                        break;
                    default:
                        throw new Error("Constraint type not recognized: "+jc.type);
                }
                this.addConstraint(c);
            }

            break;

        default:
            return false;
            break;
    }

    return true;
};

/**
 * Resets the World, removes all bodies, constraints and springs.
 *
 * @method clear
 */
World.prototype.clear = function(){

    // Remove all constraints
    var cs = this.constraints;
    for(var i=cs.length-1; i>=0; i--){
        this.removeConstraint(cs[i]);
    }

    // Remove all bodies
    var bodies = this.bodies;
    for(var i=bodies.length-1; i>=0; i--){
        this.removeBody(bodies[i]);
    }

    // Remove all springs
    var springs = this.springs;
    for(var i=springs.length-1; i>=0; i--){
        this.removeSpring(springs[i]);
    }
};

},{"../collision/Broadphase":2,"../collision/NaiveBroadphase":4,"../constraints/DistanceConstraint":7,"../constraints/PointToPointConstraint":10,"../events/EventEmitter":11,"../math/vec2":12,"../objects/Body":13,"../objects/Shape":14,"../solver/GSSolver":16}]},{},[15])(15)
});
;