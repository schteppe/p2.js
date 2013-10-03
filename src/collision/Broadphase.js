var vec2 = require('../math/vec2')
,   Nearphase = require('./Nearphase')
,   Shape = require('./../shapes/Shape')

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

Broadphase.boundingRadiusCheck = function(bodyA, bodyB){
    vec2.sub(dist, bodyA.position, bodyB.position);
    var d2 = vec2.squaredLength(dist),
        r = bodyA.boundingRadius + bodyB.boundingRadius;
    return d2 <= r*r;
};

/**
 * Check whether a circle and a convex intersects
 * @method circleConvex
 * @static
 * @param  {Circle}     circle
 * @param  {Array}      circleOffset
 * @param  {Convex}     convex
 * @param  {Array}      convexOffset
 * @return {Boolean}                    Whether they intersect
 */
Broadphase.circleConvex = function(circle, circleOffset, convex, convexOffset){
    return true; // For now
};

/**
 * Capsule/plane intersection test
 * @method capsulePlane
 * @static
 * @param  {Capsule}    capsule
 * @param  {Array}      circleOffset
 * @param  {Plane}      plane
 * @param  {Array}      convexOffset
 * @return {Boolean}                    Whether they intersect
 */
Broadphase.capsulePlane = function(capsule, capsuleOffset, capsuleAngle, plane, planeOffset, planeAngle){
    return true; // For now
};

/**
 * circleLine
 * @method circleLine
 * @static
 * @param  {Circle}     circle
 * @param  {Array}      circleOffset
 * @param  {Line}       line
 * @param  {Array}      lineOffset
 * @param  {Number}     lineAngle
 * @return {Boolean}
 */
Broadphase.circleLine = function(circle, circleOffset, line, lineOffset, lineAngle){
    // bounding sphere check
    vec2.sub(dist, lineOffset, circleOffset);
    var R = circle.radius;
    var L = line.length;

    return vec2.squaredLength(dist) < Math.pow(L+R,2);
};

/**
 * Plane/line intersection test
 * @method planeLine
 * @static
 * @param  {Plane}  plane
 * @param  {Array}  planeOffset
 * @param  {Number} planeAngle
 * @param  {Line}   line
 * @param  {Array}  lineOffset
 * @param  {Number} lineAngle
 * @return {Boolean}
 */
Broadphase.planeLine = function(plane, planeOffset, planeAngle, line, lineOffset, lineAngle){
    // bounding sphere check
    vec2.sub(dist, lineOffset, planeOffset);
    vec2.rotate(worldNormal, yAxis, planeAngle);
    var L = line.length;
    return vec2.dot(dist, worldNormal) < L;
};

/**
 * Rectangle/rectangle intersection test
 * @method rectangleRectangle
 * @static
 * @param  {Rectangle} r1
 * @param  {Array} offset1
 * @param  {Number} angle1
 * @param  {Rectangle} r2
 * @param  {Array} offset2
 * @param  {Number} angle2
 * @return {Boolean}
 */
Broadphase.rectangleRectangle = function(r1, offset1, angle1, r2, offset2, angle2){
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

/**
 * Convex/convex intersection test
 * @method convexConvex
 * @static
 * @param  {Convex} convex
 * @param  {Array}  convexOffset
 * @param  {Convex} convex
 * @param  {Array}  convexOffset
 * @return {Boolean}
 */
Broadphase.convexConvex = function(convex, convexOffset, convex, convexOffset){
    return true; // For now
};

/**
 * Circle/rectangle intersection test
 * @method circleRectangle
 * @static
 * @param  {Circle} circle
 * @param  {Array} circleOffset
 * @param  {Rectangle} rectangle
 * @param  {Array} rectangleOffset
 * @return {Boolean}
 */
Broadphase.circleRectangle = function(circle, circleOffset, rectangle, rectangleOffset){
    vec2.sub(dist,circleOffset,rectangleOffset);
    var R = circle.radius;
    var w = rectangle.width,
        h = rectangle.height;
    var D = Math.sqrt(w*w + h*h) / 2;
    var result = vec2.sqrLen(dist) < (R+D)*(R+D);
    return result;
};

/**
 * Circle/Circle intersection test
 * @method circleCircle
 * @static
 * @param  {Circle} c1
 * @param  {Array}  offset1
 * @param  {Circle} c2
 * @param  {Array}  offset2
 * @return {Boolean}
 */
Broadphase.circleCircle = function(c1, offset1, c2, offset2){
    vec2.sub(dist,offset1,offset2);
    var R1 = c1.radius;
    var R2 = c2.radius;
    return vec2.sqrLen(dist) < (R1+R2)*(R1+R2);
};

var convexPlane_convexSpan = vec2.create();

/**
 * Convex/Plane
 * @method convexPlane
 * @static
 * @param  {Convex} convexShape
 * @param  {Array}  convexOffset
 * @param  {Number} convexAngle
 * @param  {Plane}  planeShape
 * @param  {Array}  planeOffset
 * @param  {Number} planeAngle
 * @return {Boolean}
 */
Broadphase.convexPlane = function( convexShape,
                                        convexOffset,
                                        convexAngle,
                                        planeShape,
                                        planeOffset,
                                        planeAngle){
    var convexSpan = convexPlane_convexSpan;

    vec2.rotate(worldNormal, yAxis, planeAngle);
    Nearphase.projectConvexOntoAxis(convexShape, convexOffset, convexAngle, worldNormal, convexSpan);

    // Project the plane position
    var planePos = vec2.dot(planeOffset,worldNormal);

    return convexSpan[0] < planePos;
};

/**
 * Particle/Plane intersection test
 * @method particlePlane
 * @static
 * @param  {Particle} particleShape
 * @param  {Array} particleOffset
 * @param  {Plane} planeShape
 * @param  {Array} planeOffset
 * @param  {Number} planeAngle
 * @return {Boolean}
 */
Broadphase.particlePlane = function(   particleShape,
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

/**
 * Circle/Particle intersection test
 * @method circleParticle
 * @static
 * @param  {Circle} circleShape
 * @param  {Array} circleOffset
 * @param  {Particle} particleShape
 * @param  {Array} particleOffset
 * @return {Boolean}
 */
Broadphase.circleParticle = function(  circleShape,
                                            circleOffset,
                                            particleShape,
                                            particleOffset ){
    var r = circleShape.radius;
    vec2.sub(dist, circleOffset, particleOffset);
    return vec2.squaredLength(dist) < r*r;
};

/**
 * Rectangle/Particle intersection test
 * @method rectangleParticle
 * @static
 * @param  {Rectangle} rectangleShape
 * @param  {Array} rectangleOffset
 * @param  {Particle} particleShape
 * @param  {Array} particleOffset
 * @return {Boolean}
 */
Broadphase.rectangleParticle = function(rectangleShape,
                                        rectangleOffset,
                                        particleShape,
                                        particleOffset ){
    vec2.sub(dist,particleOffset,rectangleOffset);
    var w = rectangleShape.width,
        h = rectangleShape.height;
    var D = Math.sqrt(w*w + h*h) / 2;
    var result = vec2.sqrLen(dist) < D*D;
    return result;
};

/**
 * Convex/Particle intersection test
 * @method convexParticle
 * @static
 * @param  {convex}     convexShape
 * @param  {Array}      convexOffset
 * @param  {Particle}   particleShape
 * @param  {Array}      particleOffset
 * @return {Boolean}
 */
Broadphase.convexParticle = function(   convexShape,
                                        convexOffset,
                                        particleShape,
                                        particleOffset ){
    vec2.sub(dist,particleOffset,convexOffset);
    var D = convexShape.boundingRadius;
    var result = vec2.sqrLen(dist) < D*D;
    return result;
};

/**
 * Check whether a circle and a plane collides. See nearphaseCirclePlane() for param details.
 * @method circlePlane
 * @static
 * @param  {Circle}  circleShape
 * @param  {Array}   circleOffset
 * @param  {Plane}   planeShape
 * @param  {Array}   planeOffset
 * @param  {Number}  planeAngle
 * @return {Boolean} True if collision.
 */
Broadphase.circlePlane = function( circleShape,
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

var xi1_world = vec2.fromValues(0,0),
    xj1_world = vec2.fromValues(0,0),
    zero = vec2.fromValues(0,0);

Broadphase.bodiesCollide = function(bi,bj){
    var collide = false;

    // Loop over all shapes of body i
    for(var k=0; !collide && k<bi.shapes.length; k++){
        var si = bi.shapes[k],
            xi = bi.shapeOffsets[k] || zero,
            ai = bi.shapeAngles[k] || 0;

        // All shapes of body j
        for(var l=0; !collide && l<bj.shapes.length; l++){
            var sj = bj.shapes[l],
                xj = bj.shapeOffsets[l] || zero,
                aj = bj.shapeAngles[l] || 0;

            // Check collision bit masks
            if(!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0))
                continue;

            // Swap - makes the later switch() stuff easier
            var bi1 = bi,
                bj1 = bj,
                si1 = si,
                sj1 = sj,
                xi1 = xi,
                xj1 = xj,
                ai1 = ai,
                aj1 = aj;
            if(si1.type > sj1.type){
                var temp;
                temp = bi1; bi1 = bj1; bj1 = temp;
                temp = si1; si1 = sj1; sj1 = temp;
                temp = xi1; xi1 = xj1; xj1 = temp;
                temp = ai1; ai1 = aj1; aj1 = temp;
            }

            vec2.rotate(xi1_world, xi1, bi1.angle);
            vec2.rotate(xj1_world, xj1, bj1.angle);
            vec2.add(xi1_world, xi1_world, bi1.position);
            vec2.add(xj1_world, xj1_world, bj1.position);
            var ai1_world = ai1 + bi1.angle;
            var aj1_world = aj1 + bj1.angle;

            switch(si1.type){
            case Shape.CIRCLE:

                switch(sj1.type){
                case Shape.CIRCLE:   collide = Broadphase.circleCircle  (si1,xi1_world,sj1,xj1_world);             break;
                case Shape.PLANE:    collide = Broadphase.circlePlane   (si1,xi1_world,sj1,xj1_world,aj1_world);   break;
                case Shape.PARTICLE: collide = Broadphase.circleParticle(si1,xi1_world,sj1,xj1_world);             break;
                case Shape.LINE:     collide = Broadphase.circleLine    (si1,xi1_world,sj1,xj1_world,aj1_world);   break;
                case Shape.CONVEX:
                    if(sj1 instanceof Rectangle){
                        collide = Broadphase.circleRectangle(si1,xi1_world,sj1,xj1_world);
                    } else {
                        collide = Broadphase.circleConvex(si1,xi1_world,sj1,xj1_world);
                    }
                    break;
                }
                break;


            case Shape.PARTICLE:
                switch(sj1.type){
                case Shape.PLANE:
                    collide = Broadphase.particlePlane(si1,xi1_world,sj1,xj1_world,aj1_world);
                    break;
                case Shape.CONVEX:
                    if(sj1 instanceof Rectangle)
                        collide = Broadphase.rectangleParticle(sj1,xj1_world,si1,xi1_world);
                    else
                        collide = Broadphase.convexParticle(sj1,xj1_world,si1,xi1_world);
                    break;
                }
                break;

            case Shape.PLANE:

                switch(sj1.type){
                case Shape.CONVEX:
                    collide = Broadphase.convexPlane(sj1,xj1_world,aj1_world, si1,xi1_world,ai1_world);
                    break;
                case Shape.LINE:
                    collide = Broadphase.planeLine(si1,xi1_world,ai1_world, sj1,xj1_world,aj1_world);
                    break;
                case Shape.CAPSULE:
                    collide = Broadphase.capsulePlane(sj1,xj1_world,aj1_world, si1,xi1_world,ai1_world);
                    break;
                }
                break;

            case Shape.CONVEX:

                if(si1 instanceof Rectangle && sj1 instanceof Rectangle){
                    collide = Broadphase.rectangleRectangle(sj1,xj1_world,aj1_world, si1,xi1_world,ai1_world);
                } else {
                    switch(sj1.type){
                    case Shape.CONVEX:
                        collide = Broadphase.convexConvex(sj1,xj1_world,aj1_world, si1,xi1_world,ai1_world);
                        break;
                    }
                }
                break;
            }

            if(collide)
                return true;
        }
    }
    return collide;
};
