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

