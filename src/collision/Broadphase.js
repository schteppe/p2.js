var vec2 = require('../math/vec2')
,   Nearphase = require('./Nearphase')

module.exports = Broadphase;

/**
 * Base class for broadphase implementations.
 * @class Broadphase
 * @constructor
 */
function Broadphase(){

};

/**
 * Get all potential intersecting body pairs.
 *
 * @method getCollisionPairs
 * @param  {World} world The world to search in.
 * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
 */
Broadphase.prototype.getCollisionPairs = function(world){
    throw new Error("getCollisionPairs must be implemented in a subclass!");
};

// Temp things
var dist = vec2.create();
var worldNormal = vec2.create();
var yAxis = vec2.fromValues(0,1);

Broadphase.checkCircleConvex = function(circle, circleOffset, convex, convexOffset){
    return true; // For now
};

Broadphase.checkCircleLine = function(circle, circleOffset, line, lineOffset, lineAngle){
    // bounding sphere check
    vec2.sub(dist, lineOffset, circleOffset);
    var R = circle.radius;
    var L = line.length;

    return vec2.squaredLength(dist) < Math.pow(L+R,2);
};

Broadphase.checkPlaneLine = function(plane, planeOffset, planeAngle, line, lineOffset, lineAngle){
    // bounding sphere check
    vec2.sub(dist, lineOffset, planeOffset);
    vec2.rotate(worldNormal, yAxis, planeAngle);
    var L = line.length;
    return vec2.dot(dist, worldNormal) < L;
};

Broadphase.checkRectangleRectangle = function(r1, offset1, angle1, r2, offset2, angle2){
    vec2.sub(dist,offset2,offset1);
    var w1 = r1.width,
        h1 = r1.height,
        D1 = Math.sqrt(w1*w1 + h1*h1) / 2,
        w2 = r2.width,
        h2 = r2.height,
        D2 = Math.sqrt(w2*w2 + h2*h2) / 2;
    var result = vec2.sqrLen(dist) < (D1 + D2)*(D1 + D2);
    return result;
};


Broadphase.checkConvexConvex = function(convex, convexOffset, convex, convexOffset){
    return true; // For now
};

Broadphase.checkCircleRectangle = function(circle, circleOffset, rectangle, rectangleOffset){
    vec2.sub(dist,circleOffset,rectangleOffset);
    var R = circle.radius;
    var w = rectangle.width,
        h = rectangle.height;
    var D = Math.sqrt(w*w + h*h) / 2;
    var result = vec2.sqrLen(dist) < (R+D)*(R+D);
    return result;
};


Broadphase.checkCircleCircle = function(c1, offset1, c2, offset2){
    vec2.sub(dist,offset1,offset2);
    var R1 = c1.radius;
    var R2 = c2.radius;
    return vec2.sqrLen(dist) < (R1+R2)*(R1+R2);
};


var checkConvexPlane_convexSpan = vec2.create();
Broadphase.checkConvexPlane = function( convexShape,
                                        convexOffset,
                                        convexAngle,
                                        planeShape,
                                        planeOffset,
                                        planeAngle){
    var convexSpan = checkConvexPlane_convexSpan;

    vec2.rotate(worldNormal, yAxis, planeAngle);
    Nearphase.projectConvexOntoAxis(convexShape, convexOffset, convexAngle, worldNormal, convexSpan);

    // Project the plane position
    var planePos = vec2.dot(planeOffset,worldNormal);

    return convexSpan[0] < planePos;
};

Broadphase.checkParticlePlane = function(   particleShape,
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

Broadphase.checkCircleParticle = function(  circleShape,
                                            circleOffset,
                                            particleShape,
                                            particleOffset ){
    var r = circleShape.radius;
    vec2.sub(dist, circleOffset, particleOffset);
    return vec2.squaredLength(dist) < r*r;
};

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
Broadphase.checkCirclePlane = function(  circleShape,
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


