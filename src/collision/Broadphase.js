var vec2 = require('../math/vec2')
,   ContactEquation = require('../constraints/ContactEquation').ContactEquation
,   FrictionEquation = require('../constraints/FrictionEquation').FrictionEquation

// Temp things
var dist = vec2.create();
var worldNormal = vec2.create();
var yAxis = vec2.fromValues(0,1);

exports.checkCircleConvex = checkCircleConvex;
function checkCircleConvex(circle, circleOffset, convex, convexOffset){
    return true; // For now
};

exports.checkConvexConvex = checkConvexConvex;
function checkConvexConvex(convex, convexOffset, convex, convexOffset){
    return true; // For now
};

exports.checkCircleRectangle = checkCircleRectangle;
// Just uses bounding spheres for now
function checkCircleRectangle(circle, circleOffset, rectangle, rectangleOffset){
    vec2.sub(dist,circleOffset,rectangleOffset);
    var R = circle.radius;
    var w = rectangle.width,
        h = rectangle.height;
    var D = Math.sqrt(w*w + h*h) / 2;
    var result = vec2.sqrLen(dist) < (R+D)*(R+D);
    return result;
};

var worldVertex0 = vec2.create();
var worldVertex1 = vec2.create();
var worldEdge = vec2.create();
var worldEdgeUnit = vec2.create();
var worldTangent = vec2.create();
var orthoDist = vec2.create();
var centerDist = vec2.create();
var convexToCircle = vec2.create();
var projectedPoint = vec2.create();
exports.nearphaseCircleConvex = nearphaseCircleConvex;
function nearphaseCircleConvex( bi,si,xi,ai, bj,sj,xj,aj,
                                result,
                                oldContacts,
                                doFriction,
                                frictionResult,
                                oldFrictionEquations,
                                slipForce){
    var convexShape = sj,
        convexAngle = aj,
        convexBody = bj,
        convexOffset = xj,
        circleOffset = xi,
        circleBody = bi,
        circleShape = si;

    var numReported = 0;

    verts = convexShape.vertices;

    // Check all edges first
    for(var i=0; i<verts.length; i++){
        var v0 = verts[i],
            v1 = verts[(i+1)%verts.length];

        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        vec2.add(worldVertex0, worldVertex0, convexOffset);
        vec2.add(worldVertex1, worldVertex1, convexOffset);
        vec2.sub(worldEdge, worldVertex1, worldVertex0);

        vec2.normalize(worldEdgeUnit, worldEdge);

        // Get tangent to the edge. Points out of the Convex
        vec2.rotate(worldTangent, worldEdgeUnit, -Math.PI/2);

        // Check distance from the plane spanned by the edge vs the circle
        vec2.sub(dist, circleOffset, worldVertex0);
        var d = vec2.dot(dist, worldTangent);
        vec2.sub(centerDist, worldVertex0, convexOffset);

        vec2.sub(convexToCircle, circleOffset, convexOffset);

        if(d < circleShape.radius && vec2.dot(centerDist,convexToCircle) > 0){

            // Now project the circle onto the edge
            vec2.scale(orthoDist, worldTangent, d);
            vec2.sub(projectedPoint, circleOffset, orthoDist);

            // Check if the point is within the edge span
            var pos =  vec2.dot(worldEdgeUnit, projectedPoint);
            var pos0 = vec2.dot(worldEdgeUnit, worldVertex0);
            var pos1 = vec2.dot(worldEdgeUnit, worldVertex1);

            if(pos > pos0 && pos < pos1){
                // We got contact!

                var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(circleBody,convexBody);
                c.bi = circleBody;
                c.bj = convexBody;

                vec2.scale(c.ni, orthoDist, -1);
                vec2.normalize(c.ni, c.ni);

                vec2.scale( c.ri, c.ni,  circleShape.radius);
                vec2.add(c.ri, c.ri, circleOffset);
                vec2.sub(c.ri, c.ri, circleBody.position);

                vec2.sub( c.rj, projectedPoint, convexOffset);
                vec2.add(c.rj, c.rj, convexOffset);
                vec2.sub(c.rj, c.rj, convexBody.position);

                if(doFriction)
                    addFrictionEquation(circleBody, convexBody, c, slipForce, oldFrictionEquations, frictionResult);

                result.push(c);

                return true; // We only need one contact
            }
        }
    }

    // Check all vertices
    for(var i=0; i<verts.length; i++){
        var localVertex = verts[i];
        vec2.rotate(worldVertex, localVertex, convexAngle);
        vec2.add(worldVertex, worldVertex, convexOffset);

        vec2.sub(dist, worldVertex, circleOffset);
        if(vec2.squaredLength(dist) < circleShape.radius*circleShape.radius){

            var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(circleBody,convexBody);
            c.bi = circleBody;
            c.bj = convexBody;

            vec2.copy(c.ni, dist);
            vec2.normalize(c.ni,c.ni);

            // Vector from circle to contact point is the normal times the circle radius
            vec2.scale(c.ri, c.ni, circleShape.radius);
            vec2.add(c.ri, c.ri, circleOffset);
            vec2.sub(c.ri, c.ri, circleBody.position);

            vec2.sub(c.rj, worldVertex, convexOffset);
            vec2.add(c.rj, c.rj, convexOffset);
            vec2.sub(c.rj, c.rj, convexBody.position);

            result.push(c);

            if(doFriction)
                addFrictionEquation(circleBody, convexBody, c, slipForce, oldFrictionEquations, frictionResult);

            return true;
        }
    }

    return false;
};

function addFrictionEquation(bodyA, bodyB, contactEquation, slipForce, oldFrictionEquations, result){
    var eq = oldFrictionEquations.length ? oldFrictionEquations.pop() : new FrictionEquation(bodyA,bodyB);
    eq.bi = bodyA;
    eq.bj = bodyB;
    eq.setSlipForce(slipForce);
    // Use same ri and rj, but the tangent vector needs to be constructed from the collision normal
    vec2.copy(eq.ri, contactEquation.ri);
    vec2.copy(eq.rj, contactEquation.rj);
    vec2.rotate(eq.t, contactEquation.ni, -Math.PI / 2);
    result.push(eq);
}

exports.checkCircleCircle = checkCircleCircle;
function checkCircleCircle(c1, offset1, c2, offset2){
    vec2.sub(dist,offset1,offset2);
    var R1 = c1.radius;
    var R2 = c2.radius;
    return vec2.sqrLen(dist) < (R1+R2)*(R1+R2);
};

// Generate contacts / do nearphase
exports.nearphaseCircleCircle = nearphaseCircleCircle;
function nearphaseCircleCircle(bi,si,xi,ai, bj,sj,xj,aj,
                                result,
                                oldContacts,
                                doFriction,
                                frictionResult,
                                oldFrictionEquations,
                                slipForce){
    var bodyA = bi,
        shapeA = si,
        offsetA = xi,
        bodyB = bj,
        shapeB = sj,
        offsetB = xj;

    var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(bodyA,bodyB);
    c.bi = bodyA;
    c.bj = bodyB;
    vec2.sub(c.ni, offsetB, offsetA);
    vec2.normalize(c.ni,c.ni);

    vec2.scale( c.ri, c.ni,  shapeA.radius);
    vec2.scale( c.rj, c.ni, -shapeB.radius);

    vec2.add(c.ri, c.ri, offsetA);
    vec2.sub(c.ri, c.ri, bodyA.position);

    vec2.add(c.rj, c.rj, offsetB);
    vec2.sub(c.rj, c.rj, bodyB.position);

    result.push(c);

    if(doFriction)
        addFrictionEquation(bodyA, bodyB, c, slipForce, oldFrictionEquations, frictionResult);
};

exports.checkConvexPlane = checkConvexPlane;
var checkConvexPlane_convexSpan = vec2.create();
function checkConvexPlane(  convexShape,
                            convexOffset,
                            convexAngle,
                            planeShape,
                            planeOffset,
                            planeAngle){
    var convexSpan = checkConvexPlane_convexSpan;

    vec2.rotate(worldNormal, yAxis, planeAngle);
    projectConvexOntoAxis(convexShape, convexOffset, convexAngle, worldNormal, convexSpan);

    // Project the plane position
    var planePos = vec2.dot(planeOffset,worldNormal);

    return convexSpan[0] < planePos;
}

var worldVertex = vec2.create();
exports.nearphaseConvexPlane = nearphaseConvexPlane;
function nearphaseConvexPlane ( bi,si,xi,ai, bj,sj,xj,aj,
                                result,
                                oldContacts,
                                doFriction,
                                frictionResult,
                                oldFrictionEquations,
                                slipForce){
    var convexBody = bi,
        convexOffset = xi,
        convexShape = si,
        convexAngle = ai,
        planeBody = bj,
        planeShape = sj,
        planeOffset = xj,
        planeAngle = aj;

    var numReported = 0;
    vec2.rotate(worldNormal, yAxis, planeAngle);

    for(var i=0; i<si.vertices.length; i++){
        var v = si.vertices[i];
        vec2.rotate(worldVertex, v, convexAngle);
        vec2.add(worldVertex, worldVertex, convexOffset);

        vec2.sub(dist, worldVertex, planeOffset);

        if(vec2.dot(dist,worldNormal) < 0){

            // Found vertex
            numReported++;

            var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(planeBody,convexBody);
            c.bi = planeBody;
            c.bj = convexBody;

            vec2.sub(dist, worldVertex, planeOffset);

            vec2.copy(c.ni, worldNormal);

            var d = vec2.dot(dist, c.ni);
            vec2.scale(dist, c.ni, d);

            // rj is from convex center to contact
            vec2.sub(c.rj, worldVertex, convexBody.position);


            // ri is from plane center to contact
            vec2.sub( c.ri, worldVertex, dist);
            vec2.sub( c.ri, c.ri, planeBody.position);

            result.push(c);

            // TODO: if we have 2 contacts, we do only need 1 friction equation

            if(doFriction)
                addFrictionEquation(planeBody, convexBody, c, slipForce, oldFrictionEquations, frictionResult);

            if(numReported >= 2)
                break;
        }
    }

    return numReported > 0;
}


exports.checkParticlePlane = checkParticlePlane;
function checkParticlePlane(particleShape,
                            particleOffset,
                            planeShape,
                            planeOffset,
                            planeAngle){
    planeAngle = planeAngle || 0;

    vec2.sub(dist, particleOffset, planeOffset);

    vec2.rotate(worldNormal, yAxis, planeAngle);
    if(vec2.dot(dist,worldNormal) < 0){
        return true;
    }
    return false;
};

exports.nearphaseParticlePlane = nearphaseParticlePlane;

/**
 * Nearphase for particle vs plane
 * @param  {Body}       bi The particle body
 * @param  {Shape}      si Particle shape
 * @param  {Array}      xi World position for the particle
 * @param  {Number}     ai World angle for the particle
 * @param  {Body}       bj Plane body
 * @param  {Shape}      sj Plane shape
 * @param  {Array}      xj World position for the plane
 * @param  {Number}     aj World angle for the plane
 * @param  {Array}      result
 * @param  {Array}      oldContacts
 * @param  {Boolean}    doFriction
 * @param  {Array}      frictionResult
 * @param  {Array}      oldFrictionEquations
 * @param  {Number}     slipForce
 * @return {Boolean}
 */
function nearphaseParticlePlane(bi,si,xi,ai, bj,sj,xj,aj,
                                result,
                                oldContacts,
                                doFriction,
                                frictionResult,
                                oldFrictionEquations,
                                slipForce){
    var particleBody = bi,
        particleShape = si,
        particleOffset = xi,
        planeBody = bj,
        planeShape = sj,
        planeOffset = xj,
        planeAngle = aj;

    planeAngle = planeAngle || 0;

    var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(planeBody,particleBody);
    c.bi = planeBody;
    c.bj = particleBody;

    vec2.sub(dist, particleOffset, planeOffset);
    vec2.rotate(c.ni, yAxis, planeAngle);
    var d = vec2.dot(dist, c.ni);

    if(d > 0) return false;

    vec2.scale( dist, c.ni, d );
    // dist is now the distance vector in the normal direction

    // ri is the particle position projected down onto the plane, from the plane center
    vec2.sub( c.ri, particleOffset, dist);
    vec2.sub( c.ri, c.ri, planeBody.position);

    // rj is from the body center to the particle center
    vec2.sub( c.rj, particleOffset, particleBody.position );

    result.push(c);

    if(doFriction){
        var eq = oldFrictionEquations.length ? oldFrictionEquations.pop() : new FrictionEquation(planeBody,particleBody);
        eq.bi = planeBody;
        eq.bj = particleBody;
        eq.setSlipForce(slipForce);

        // Use same ri and rj, but the tangent vector needs to be constructed from the collision normal
        vec2.copy(eq.ri, c.ri);
        vec2.copy(eq.rj, c.rj);
        vec2.rotate(eq.t, c.ni, -Math.PI / 2);
        frictionResult.push(eq);
    }

    return true;
};

exports.checkCircleParticle = checkCircleParticle;
function checkCircleParticle(   circleShape,
                                circleOffset,
                                particleShape,
                                particleOffset ){
    var r = circleShape.radius;
    vec2.sub(dist, circleOffset, particleOffset);
    return vec2.squaredLength(dist) < r*r;
};

exports.nearphaseCircleParticle = nearphaseCircleParticle;
function nearphaseCircleParticle(   bi,si,xi,ai, bj,sj,xj,aj,
                                    result,
                                    oldContacts,
                                    doFriction,
                                    frictionResult,
                                    oldFrictionEquations,
                                    slipForce){
    var circleBody = bi,
        circleShape = si,
        circleOffset = xi,
        particleBody = bj,
        particleShape = sj,
        particleOffset = xj;

    var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(circleBody,particleBody);
    c.bi = circleBody;
    c.bj = particleBody;

    vec2.sub(dist, particleOffset, circleOffset);

    if(vec2.squaredLength(dist) > circleShape.radius) return false;

    vec2.copy(c.ni, dist);
    vec2.normalize(c.ni,c.ni);

    // Vector from circle to contact point is the normal times the circle radius
    vec2.scale(c.ri, c.ni, circleShape.radius);
    vec2.add(c.ri, c.ri, circleOffset);
    vec2.sub(c.ri, c.ri, circleBody.position);

    // Vector from particle center to contact point is zero
    vec2.sub(c.rj, particleOffset, particleBody.position);

    result.push(c);

    if(doFriction){
        var eq = oldFrictionEquations.length ? oldFrictionEquations.pop() : new FrictionEquation(circleBody,particleBody);
        eq.bi = circleBody;
        eq.bj = particleBody;
        eq.setSlipForce(slipForce);

        // Use same ri and rj, but the tangent vector needs to be constructed from the collision normal
        vec2.copy(eq.ri, c.ri);
        vec2.copy(eq.rj, c.rj);
        vec2.rotate(eq.t, c.ni, -Math.PI / 2);
        frictionResult.push(eq);
    }

    return true;
};

exports.checkCirclePlane = checkCirclePlane;

/**
 * Check whether a circle and a plane collides. See nearphaseCirclePlane() for param details.
 * @param  {Body}    circleBody
 * @param  {Circle}  circleShape
 * @param  {Array}   circleOffset
 * @param  {Body}    planeBody
 * @param  {Plane}   planeShape
 * @param  {Array}   planeOffset
 * @param  {Number}  planeAngle
 * @param  {Array}   result         The Bodies will be pushed into this array if they collide.
 * @return {Boolean} True if collision.
 */
function checkCirclePlane(  circleShape,
                            circleOffset, // Rotated offset!
                            planeShape,
                            planeOffset,
                            planeAngle ){

    planeAngle = planeAngle || 0;

    // Compute distance vector between plane center and circle center
    vec2.sub(dist, circleOffset, planeOffset);

    // Collision normal is the plane normal in world coords
    vec2.rotate(worldNormal, yAxis, planeAngle);
    if(vec2.dot(dist,worldNormal) <= circleShape.radius){
        //result.push(circleBody, planeBody);
        return true;
    }

    return false;
};

var nearphaseCirclePlane_planeToCircle = vec2.create();
var nearphaseCirclePlane_temp = vec2.create();

exports.nearphaseCirclePlane = nearphaseCirclePlane;

/**
 * Creates ContactEquations and FrictionEquations for a collision.
 * @param  {Body}    circleBody           The first body that should be connected to the equations.
 * @param  {Circle}  circleShape          The circle shape participating in the collision.
 * @param  {Array}   circleOffset         Extra offset to take into account for the Shape, in addition to the one in circleBody.position. Will *not* be rotated by circleBody.angle (maybe it should, for sake of homogenity?). Set to null if none.
 * @param  {Body}    planeBody            The second body that should be connected to the equations.
 * @param  {Shape}   shapeB               The Plane shape that is participating
 * @param  {Array}   planeOffset          Extra offset for the plane shape.
 * @param  {Number}  planeAngle           Extra angle to apply to the plane
 * @param  {Array}   result               Resulting ContactEquations will be pushed into this array
 * @param  {Array}   oldContacts          Reusable ContactEquations
 * @param  {Array}   doFriction           Whether to create FrictionEquations
 * @param  {Array}   frictionResult       Resulting FrictionEquations will be pushed into this array
 * @param  {Array}   oldFrictionEquations Reusable FrictionEquation objects
 * @param  {Number}  slipForce            To be passed to created FrictionEquations
 * @return {Boolean}                      True if we created any Equations.
 */
function nearphaseCirclePlane(  bi,si,xi,ai, bj,sj,xj,aj,
                                result,
                                oldContacts,
                                doFriction,
                                frictionResult,
                                oldFrictionEquations,
                                slipForce){
    var circleBody = bi,
        circleShape = si,
        circleOffset = xi, // Offset from body center, rotated!
        planeBody = bj,
        shapeB = sj,
        planeOffset = xj,
        planeAngle = aj;

    planeAngle = planeAngle || 0;

    // Vector from plane to circle
    var planeToCircle = nearphaseCirclePlane_planeToCircle;
    vec2.sub(planeToCircle, circleOffset, planeOffset);

    // World plane normal
    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Normal direction distance
    var d = vec2.dot(worldNormal, planeToCircle);

    if(d > circleShape.radius) return false; // No overlap. Abort.

    // Create contact
    var contact = oldContacts.length ? oldContacts.pop() : new ContactEquation(planeBody,circleBody);
    contact.bi = planeBody;
    contact.bj = circleBody;
    var temp = nearphaseCirclePlane_temp;

    // ni is the plane world normal
    vec2.copy(contact.ni, worldNormal);

    // rj is the vector from circle center to the contact point
    vec2.scale( contact.rj, contact.ni, -circleShape.radius);
    vec2.add(contact.rj, contact.rj, circleOffset);
    vec2.sub(contact.rj, contact.rj, circleBody.position);

    // ri is the distance from plane center to contact.
    vec2.scale(temp, contact.ni, d);
    vec2.sub( contact.ri, planeToCircle, temp ); // Subtract normal distance vector from the distance vector
    vec2.add(contact.ri, contact.ri, planeOffset);
    vec2.sub(contact.ri, contact.ri, planeBody.position);

    result.push(contact);

    if(doFriction){
        var eq = oldFrictionEquations.length ? oldFrictionEquations.pop() : new FrictionEquation(planeBody,circleBody);
        eq.bi = planeBody;
        eq.bj = circleBody;
        eq.setSlipForce(slipForce);
        // Use same ri and rj, but the tangent vector needs to be constructed from the plane normal
        vec2.copy(eq.ri, contact.ri);
        vec2.copy(eq.rj, contact.rj);
        vec2.rotate(eq.t, contact.ni, -Math.PI / 2);
        frictionResult.push(eq);
    }

    return true;
};

var localAxis = vec2.create();
exports.projectConvexOntoAxis = projectConvexOntoAxis;
function projectConvexOntoAxis(convexShape, convexOffset, convexAngle, worldAxis, result){
    var max=null,
        min=null,
        v,
        value;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, worldAxis, -convexAngle);

    // Get projected position of all vertices
    for(var i=0; i<convexShape.vertices.length; i++){
        v = convexShape.vertices[i];
        value = vec2.dot(v,localAxis);
        if(max === null || value > max) max = value;
        if(min === null || value < min) min = value;
    }

    if(min > max){
        var t = min;
        min = max;
        max = t;
    }

    // Project the position of the body onto the axis - need to add this to the result
    var offset = vec2.dot(convexOffset, worldAxis);

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

