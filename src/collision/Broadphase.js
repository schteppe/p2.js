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
function nearphaseCircleCircle( bodyA,
                                shapeA,
                                offsetA,
                                bodyB,
                                shapeB,
                                offsetB,
                                result,
                                oldContacts,
                                doFriction,
                                frictionResult,
                                oldFrictionEquations,
                                slipForce){
    var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(bodyA,bodyB);
    c.bi = bodyA;
    c.bj = bodyB;
    vec2.sub(c.ni, bodyB.position, bodyA.position);
    if(offsetA) vec2.add(c.ni, c.ni, offsetB);
    if(offsetB) vec2.sub(c.ni, c.ni, offsetA);
    vec2.normalize(c.ni,c.ni);

    vec2.scale( c.ri,c.ni, shapeA.radius);
    vec2.scale( c.rj,c.ni,-shapeB.radius);

    if(offsetA) vec2.add(c.ri, c.ri, offsetA);
    if(offsetB) vec2.add(c.rj, c.rj, offsetB);

    result.push(c);

    if(doFriction){
        var eq = oldFrictionEquations.length ? oldFrictionEquations.pop() : new FrictionEquation(bodyA,bodyB);
        eq.bi = bodyA;
        eq.bj = bodyB;
        eq.setSlipForce(slipForce);
        // Use same ri and rj, but the tangent vector needs to be constructed from the collision normal
        vec2.copy(eq.ri, c.ri);
        vec2.copy(eq.rj, c.rj);
        vec2.rotate(eq.t, c.ni, -Math.PI / 2);
        frictionResult.push(eq);
    }
};

var rotatedOffset = vec2.create();
exports.checkCompoundPlane = checkCompoundPlane;
function checkCompoundPlane(compound,plane,result){
    for(var i=0; i<compound.shape.children.length; i++){
        var s = compound.shape.children[i],
            offset = compound.shape.childOffsets[i],
            angle = compound.shape.childAngles[i];

        vec2.rotate(rotatedOffset, offset, compound.angle);
        //vec2.add(rotatedOffset, rotatedOffset, compound.position);

        if(s instanceof Circle){
            if(checkCirclePlane(compound,s,rotatedOffset,plane,plane.shape,null,null,result)) return;
        }
    }
};

var rotatedOffset2 = vec2.create();
exports.nearphaseCompoundPlane = nearphaseCompoundPlane;
function nearphaseCompoundPlane(    compound,
                                    plane,
                                    result,
                                    oldContacts,
                                    doFriction,
                                    frictionResult,
                                    oldFrictionEquations,
                                    slipForce){
    var cs = compound.shape;
    for(var i=0; i<cs.children.length; i++){
        var s = cs.children[i],
            offset = cs.childOffsets[i],
            angle = cs.childAngles[i];

        vec2.rotate(rotatedOffset2, offset, compound.angle);
        //vec2.add(rotatedOffset2, rotatedOffset2, compound.position);

        if(s instanceof Circle){
            nearphaseCirclePlane(   compound,
                                    s,
                                    rotatedOffset2,
                                    plane,
                                    plane.shape,
                                    null, // plane offset
                                    null, // plane angle
                                    result,
                                    oldContacts,
                                    doFriction,
                                    frictionResult,
                                    oldFrictionEquations,
                                    slipForce);
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
function checkCircleParticle(   circleBody,
                                circleShape,
                                circleOffset,
                                particleBody,
                                particleShape,
                                particleOffset,
                                result){
    var r = circleBody.shape.radius;

    vec2.sub(dist, circleBody.position, particleBody.position);
    if(circleOffset)    vec2.add(dist, dist, circleOffset);
    if(particleOffset)  vec2.sub(dist, dist, particleOffset);

    if( vec2.squaredLength(dist) < r*r ){
        result.push(circleBody,particleBody);
    }
};

exports.nearphaseCircleParticle = nearphaseCircleParticle;
function nearphaseCircleParticle(   circleBody,
                                    circleShape,
                                    circleOffset,
                                    particleBody,
                                    particleShape,
                                    particleOffset,
                                    result,
                                    oldContacts,
                                    doFriction,
                                    frictionResult,
                                    oldFrictionEquations,
                                    slipForce){
    var c = oldContacts.length ? oldContacts.pop() : new ContactEquation(circleBody,particleBody);
    c.bi = circleBody;
    c.bj = particleBody;

    vec2.sub(dist, particleBody.position, circleBody.position);
    vec2.copy(c.ni, dist);
    vec2.normalize(c.ni,c.ni);

    // Vector from circle to contact point is the normal times the circle radius
    vec2.scale(c.ri, c.ni, circleShape.radius);

    // Vector from particle center to contact point is zero
    vec2.set(c.rj,0,0);

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
function checkCirclePlane(  circleBody,
                            circleShape,
                            circleOffset, // Rotated offset!
                            planeBody,
                            planeShape,
                            planeOffset,
                            planeAngle,
                            result){

    planeAngle = planeAngle || 0;

    // Compute distance vector between plane center and circle center
    vec2.sub(dist, circleBody.position, planeBody.position);
    if(circleOffset) vec2.add(dist, dist, circleOffset);
    if(planeOffset)  vec2.sub(dist, dist, planeOffset);

    // Collision normal is the plane normal in world coords
    vec2.rotate(worldNormal, yAxis, planeBody.angle + planeAngle);
    if(vec2.dot(dist,worldNormal) <= circleShape.radius){
        result.push(circleBody, planeBody);
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
function nearphaseCirclePlane(  circleBody,
                                circleShape,
                                circleOffset, // Offset from body center, rotated!
                                planeBody,
                                shapeB,
                                planeOffset,
                                planeAngle,
                                result,
                                oldContacts,
                                doFriction,
                                frictionResult,
                                oldFrictionEquations,
                                slipForce){
    planeAngle = planeAngle || 0;

    // Vector from plane to circle
    var planeToCircle = nearphaseCirclePlane_planeToCircle;
    vec2.sub(planeToCircle, circleBody.position, planeBody.position);
    if(circleOffset) vec2.add(planeToCircle, planeToCircle, circleOffset);
    if(planeOffset)  vec2.sub(planeToCircle, planeToCircle, planeOffset);

    // World plane normal
    vec2.rotate(worldNormal, yAxis, planeBody.angle+planeAngle);

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
    if(circleOffset) vec2.add(contact.rj, contact.rj, circleOffset);

    // ri is the distance from plane center to contact.
    vec2.scale(temp, contact.ni, d);
    vec2.sub( contact.ri, planeToCircle, temp ); // Subtract normal distance vector from the distance vector
    if(planeOffset) vec2.add(contact.ri, contact.ri, planeOffset);

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

