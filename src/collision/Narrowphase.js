var vec2 = require('../math/vec2')
,   sub = vec2.sub
,   add = vec2.add
,   dot = vec2.dot
,   Utils = require('../utils/Utils')
,   ContactEquation = require('../constraints/ContactEquation')
,   FrictionEquation = require('../constraints/FrictionEquation')
,   Circle = require('../shapes/Circle')
,   Shape = require('../shapes/Shape')

module.exports = Narrowphase;

// Temp things
var yAxis = vec2.fromValues(0,1);

var tmp1 = vec2.fromValues(0,0)
,   tmp2 = vec2.fromValues(0,0)
,   tmp3 = vec2.fromValues(0,0)
,   tmp4 = vec2.fromValues(0,0)
,   tmp5 = vec2.fromValues(0,0)
,   tmp6 = vec2.fromValues(0,0)
,   tmp7 = vec2.fromValues(0,0)
,   tmp8 = vec2.fromValues(0,0)
,   tmp9 = vec2.fromValues(0,0)
,   tmp10 = vec2.fromValues(0,0)
,   tmp11 = vec2.fromValues(0,0)
,   tmp12 = vec2.fromValues(0,0)
,   tmp13 = vec2.fromValues(0,0)
,   tmp14 = vec2.fromValues(0,0)
,   tmp15 = vec2.fromValues(0,0)
,   tmp16 = vec2.fromValues(0,0)
,   tmp17 = vec2.fromValues(0,0)
,   tmp18 = vec2.fromValues(0,0)

/**
 * Narrowphase. Creates contacts and friction given shapes and transforms.
 * @class Narrowphase
 * @constructor
 */
function Narrowphase(){

    /**
     * @property contactEquations
     * @type {Array}
     */
    this.contactEquations = [];

    /**
     * @property frictionEquations
     * @type {Array}
     */
    this.frictionEquations = [];

    /**
     * Whether to make friction equations in the upcoming contacts.
     * @property enableFriction
     * @type {Boolean}
     */
    this.enableFriction = true;

    /**
     * The friction slip force to use when creating friction equations.
     * @property slipForce
     * @type {Number}
     */
    this.slipForce = 10.0;

    /**
     * The friction value to use in the upcoming friction equations.
     * @property frictionCoefficient
     * @type {Number}
     */
    this.frictionCoefficient = 0.3;

    this.reuseObjects = true;
    this.reusableContactEquations = [];
    this.reusableFrictionEquations = [];

    /**
     * The restitution value to use in the next contact equations.
     * @property restitution
     * @type {Number}
     */
    this.restitution = 0;

    // Keep track of the colliding bodies last step
    this.collidingBodiesLastStep = {};
};

/**
 * Check if the bodies were in contact since the last reset().
 * @method collidedLastStep
 * @param  {Body} bi
 * @param  {Body} bj
 * @return {Boolean}
 */
Narrowphase.prototype.collidedLastStep = function(bi,bj){
    var id1 = bi.id,
        id2 = bj.id;
    if(id1 > id2){
        var tmp = id1;
        id1 = id2;
        id2 = tmp;
    }
    return !!this.collidingBodiesLastStep[id1 + " " + id2];
};

/**
 * Throws away the old equatons and gets ready to create new
 * @method reset
 */
Narrowphase.prototype.reset = function(){

    // Save the colliding bodies data
    for(var key in this.collidingBodiesLastStep)
        delete this.collidingBodiesLastStep[key];
    for(var i=0; i!==this.contactEquations.length; i++){
        var eq = this.contactEquations[i],
            id1 = eq.bi.id,
            id2 = eq.bj.id;
        if(id1 > id2){
            var tmp = id1;
            id1 = id2;
            id2 = tmp;
        }
        this.collidingBodiesLastStep[id1 + " " + id2] = true;
    }

    if(this.reuseObjects){
        var ce = this.contactEquations,
            fe = this.frictionEquations,
            rfe = this.reusableFrictionEquations,
            rce = this.reusableContactEquations;
        Utils.appendArray(rce,ce);
        Utils.appendArray(rfe,fe);
    }

    // Reset
    this.contactEquations.length = this.frictionEquations.length = 0;
};

/**
 * Creates a ContactEquation, either by reusing an existing object or creating a new one.
 * @method createContactEquation
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {ContactEquation}
 */
Narrowphase.prototype.createContactEquation = function(bodyA,bodyB,shapeA,shapeB){
    var c = this.reusableContactEquations.length ? this.reusableContactEquations.pop() : new ContactEquation(bodyA,bodyB);
    c.bi = bodyA;
    c.bj = bodyB;
    c.shapeA = shapeA;
    c.shapeB = shapeB;
    c.restitution = this.restitution;
    c.firstImpact = !this.collidedLastStep(bodyA,bodyB);
    return c;
};

/**
 * Creates a FrictionEquation, either by reusing an existing object or creating a new one.
 * @method createFrictionEquation
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {FrictionEquation}
 */
Narrowphase.prototype.createFrictionEquation = function(bodyA,bodyB,shapeA,shapeB){
    var c = this.reusableFrictionEquations.length ? this.reusableFrictionEquations.pop() : new FrictionEquation(bodyA,bodyB);
    c.bi = bodyA;
    c.bj = bodyB;
    c.shapeA = shapeA;
    c.shapeB = shapeB;
    c.setSlipForce(this.slipForce);
    c.frictionCoefficient = this.frictionCoefficient;
    return c;
};

/**
 * Creates a FrictionEquation given the data in the ContactEquation. Uses same offset vectors ri and rj, but the tangent vector will be constructed from the collision normal.
 * @method createFrictionFromContact
 * @param  {ContactEquation} contactEquation
 * @return {FrictionEquation}
 */
Narrowphase.prototype.createFrictionFromContact = function(c){
    var eq = this.createFrictionEquation(c.bi,c.bj);
    vec2.copy(eq.ri, c.ri);
    vec2.copy(eq.rj, c.rj);
    vec2.rotate(eq.t, c.ni, -Math.PI / 2);
    eq.contactEquation = c;
    return eq;
}

/**
 * Plane/line Narrowphase
 * @method planeLine
 * @param  {Body} bi
 * @param  {Plane} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Line} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.PLANE | Shape.LINE] =
Narrowphase.prototype.planeLine = function(bi,si,xi,ai, bj,sj,xj,aj){
    var lineShape = sj,
        lineAngle = aj,
        lineBody = bj,
        lineOffset = xj,
        planeOffset = xi,
        planeAngle = ai,
        planeBody = bi,
        planeShape = si;

    var worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldVertex01 = tmp3,
        worldVertex11 = tmp4,
        worldEdge = tmp5,
        worldEdgeUnit = tmp6,
        dist = tmp7,
        worldNormal = tmp8,
        worldTangent = tmp9;

    // Get start and end points
    vec2.set(worldVertex0, -lineShape.length/2, 0);
    vec2.set(worldVertex1,  lineShape.length/2, 0);

    // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
    vec2.rotate(worldVertex01, worldVertex0, lineAngle);
    vec2.rotate(worldVertex11, worldVertex1, lineAngle);

    add(worldVertex01, worldVertex01, lineOffset);
    add(worldVertex11, worldVertex11, lineOffset);

    vec2.copy(worldVertex0,worldVertex01);
    vec2.copy(worldVertex1,worldVertex11);

    // Get vector along the line
    sub(worldEdge, worldVertex1, worldVertex0);
    vec2.normalize(worldEdgeUnit, worldEdge);

    // Get tangent to the edge.
    vec2.rotate(worldTangent, worldEdgeUnit, -Math.PI/2);

    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Check line ends
    var verts = [worldVertex0, worldVertex1];
    for(var i=0; i<verts.length; i++){
        var v = verts[i];

        sub(dist, v, planeOffset);

        var d = dot(dist,worldNormal);

        if(d < 0){

            var c = this.createContactEquation(planeBody,lineBody,si,sj);

            vec2.copy(c.ni, worldNormal);
            vec2.normalize(c.ni,c.ni);

            // distance vector along plane normal
            vec2.scale(dist, worldNormal, d);

            // Vector from plane center to contact
            sub(c.ri, v, dist);
            sub(c.ri, c.ri, planeBody.position);

            // From line center to contact
            sub(c.rj, v,    lineOffset);
            add(c.rj, c.rj, lineOffset);
            sub(c.rj, c.rj, lineBody.position);

            this.contactEquations.push(c);

            // TODO : only need one friction equation if both points touch
            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }
        }
    }
};

Narrowphase.prototype[Shape.PARTICLE | Shape.CAPSULE] =
Narrowphase.prototype.particleCapsule = function(bi,si,xi,ai, bj,sj,xj,aj, justTest){
    return this.circleLine(bi,si,xi,ai, bj,sj,xj,aj, justTest, sj.radius, 0);
};

/**
 * Circle/line Narrowphase
 * @method circleLine
 * @param  {Body} bi
 * @param  {Circle} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Line} sj
 * @param  {Array} xj
 * @param  {Number} aj
 * @param {Boolean} justTest If set to true, this function will return the result (intersection or not) without adding equations.
 * @param {Number} lineRadius Radius to add to the line. Can be used to test Capsules.
 * @param {Number} circleRadius If set, this value overrides the circle shape radius.
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.LINE] =
Narrowphase.prototype.circleLine = function(bi,si,xi,ai, bj,sj,xj,aj, justTest, lineRadius, circleRadius){
    var lineShape = sj,
        lineAngle = aj,
        lineBody = bj,
        lineOffset = xj,
        circleOffset = xi,
        circleBody = bi,
        circleShape = si,

        lineRadius = lineRadius || 0,
        circleRadius = typeof(circleRadius)!="undefined" ? circleRadius : circleShape.radius,

        orthoDist = tmp1,
        lineToCircleOrthoUnit = tmp2,
        projectedPoint = tmp3,
        centerDist = tmp4,
        worldTangent = tmp5,
        worldEdge = tmp6,
        worldEdgeUnit = tmp7,
        worldVertex0 = tmp8,
        worldVertex1 = tmp9,
        worldVertex01 = tmp10,
        worldVertex11 = tmp11,
        dist = tmp12,
        lineToCircle = tmp13,
        lineEndToLineRadius = tmp14;

    // Get start and end points
    vec2.set(worldVertex0, -lineShape.length/2, 0);
    vec2.set(worldVertex1,  lineShape.length/2, 0);

    // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
    vec2.rotate(worldVertex01, worldVertex0, lineAngle);
    vec2.rotate(worldVertex11, worldVertex1, lineAngle);

    add(worldVertex01, worldVertex01, lineOffset);
    add(worldVertex11, worldVertex11, lineOffset);

    vec2.copy(worldVertex0,worldVertex01);
    vec2.copy(worldVertex1,worldVertex11);

    // Get vector along the line
    sub(worldEdge, worldVertex1, worldVertex0);
    vec2.normalize(worldEdgeUnit, worldEdge);

    // Get tangent to the edge.
    vec2.rotate(worldTangent, worldEdgeUnit, -Math.PI/2);

    // Check distance from the plane spanned by the edge vs the circle
    sub(dist, circleOffset, worldVertex0);
    var d = dot(dist, worldTangent); // Distance from center of line to circle center
    sub(centerDist, worldVertex0, lineOffset);

    sub(lineToCircle, circleOffset, lineOffset);

    if(Math.abs(d) < circleRadius+lineRadius){

        // Now project the circle onto the edge
        vec2.scale(orthoDist, worldTangent, d);
        sub(projectedPoint, circleOffset, orthoDist);

        // Add the missing line radius
        vec2.scale(lineToCircleOrthoUnit, worldTangent, dot(worldTangent, lineToCircle));
        vec2.normalize(lineToCircleOrthoUnit,lineToCircleOrthoUnit);
        vec2.scale(lineToCircleOrthoUnit, lineToCircleOrthoUnit, lineRadius);
        add(projectedPoint,projectedPoint,lineToCircleOrthoUnit);

        // Check if the point is within the edge span
        var pos =  dot(worldEdgeUnit, projectedPoint);
        var pos0 = dot(worldEdgeUnit, worldVertex0);
        var pos1 = dot(worldEdgeUnit, worldVertex1);

        if(pos > pos0 && pos < pos1){
            // We got contact!

            if(justTest) return true;

            var c = this.createContactEquation(circleBody,lineBody,si,sj);

            vec2.scale(c.ni, orthoDist, -1);
            vec2.normalize(c.ni, c.ni);

            vec2.scale( c.ri, c.ni,  circleRadius);
            add(c.ri, c.ri, circleOffset);
            sub(c.ri, c.ri, circleBody.position);

            sub(c.rj, projectedPoint, lineOffset);
            add(c.rj, c.rj, lineOffset);
            sub(c.rj, c.rj, lineBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }

            return true;
        }
    }

    // Add corner
    var verts = [worldVertex0, worldVertex1];

    for(var i=0; i<verts.length; i++){
        var v = verts[i];

        sub(dist, v, circleOffset);

        if(vec2.squaredLength(dist) < (circleRadius+lineRadius)*(circleRadius+lineRadius)){

            if(justTest) return true;

            var c = this.createContactEquation(circleBody,lineBody,si,sj);

            vec2.copy(c.ni, dist);
            vec2.normalize(c.ni,c.ni);

            // Vector from circle to contact point is the normal times the circle radius
            vec2.scale(c.ri, c.ni, circleRadius);
            add(c.ri, c.ri, circleOffset);
            sub(c.ri, c.ri, circleBody.position);

            sub(c.rj, v, lineOffset);
            vec2.scale(lineEndToLineRadius, c.ni, -lineRadius);
            add(c.rj, c.rj, lineEndToLineRadius);
            add(c.rj, c.rj, lineOffset);
            sub(c.rj, c.rj, lineBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }

            return true;
        }
    }

    return false;
};

/**
 * Circle/capsule Narrowphase
 * @method circleCapsule
 * @param  {Body}   bi
 * @param  {Circle} si
 * @param  {Array}  xi
 * @param  {Number} ai
 * @param  {Body}   bj
 * @param  {Line}   sj
 * @param  {Array}  xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.CAPSULE] =
Narrowphase.prototype.circleCapsule = function(bi,si,xi,ai, bj,sj,xj,aj, justTest){
    return this.circleLine(bi,si,xi,ai, bj,sj,xj,aj, justTest, sj.radius);
};

/**
 * Circle/convex Narrowphase
 * @method circleConvex
 * @param  {Body} bi
 * @param  {Circle} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Convex} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.CONVEX] =
Narrowphase.prototype.circleConvex = function(  bi,si,xi,ai, bj,sj,xj,aj, justTest, circleRadius){
    var convexShape = sj,
        convexAngle = aj,
        convexBody = bj,
        convexOffset = xj,
        circleOffset = xi,
        circleBody = bi,
        circleShape = si,
        circleRadius = typeof(circleRadius)=="number" ? circleRadius : circleShape.radius;

    var worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldEdge = tmp3,
        worldEdgeUnit = tmp4,
        worldTangent = tmp5,
        centerDist = tmp6,
        convexToCircle = tmp7,
        orthoDist = tmp8,
        projectedPoint = tmp9,
        dist = tmp10,
        worldVertex = tmp11,

        closestEdge = -1,
        closestEdgeDistance = null,
        closestEdgeOrthoDist = tmp12,
        closestEdgeProjectedPoint = tmp13,
        candidate = tmp14,
        candidateDist = tmp15,
        minCandidate = tmp16,

        found = false,
        minCandidateDistance = Number.MAX_VALUE;

    var numReported = 0;

    // New algorithm:
    // 1. Check so center of circle is not inside the polygon. If it is, this wont work...
    // 2. For each edge
    // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
    // 2. 2. Check if point is inside.

    verts = convexShape.vertices;

    // Check all edges first
    for(var i=0; i!==verts.length; i++){
        var v0 = verts[i],
            v1 = verts[(i+1)%verts.length];

        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);
        sub(worldEdge, worldVertex1, worldVertex0);

        vec2.normalize(worldEdgeUnit, worldEdge);

        // Get tangent to the edge. Points out of the Convex
        vec2.rotate(worldTangent, worldEdgeUnit, -Math.PI/2);

        // Get point on circle, closest to the polygon
        vec2.scale(candidate,worldTangent,-circleShape.radius);
        add(candidate,candidate,circleOffset);

        if(pointInConvex(candidate,convexShape,convexOffset,convexAngle)){

            vec2.sub(candidateDist,worldVertex0,candidate);
            var candidateDistance = Math.abs(vec2.dot(candidateDist,worldTangent));

            /*
            // Check distance from the plane spanned by the edge vs the circle
            sub(dist, circleOffset, worldVertex0);
            var d = dot(dist, worldTangent);
            sub(centerDist, worldVertex0, convexOffset);

            sub(convexToCircle, circleOffset, convexOffset);

            if(d < circleRadius && dot(centerDist,convexToCircle) > 0){

                // Now project the circle onto the edge
                vec2.scale(orthoDist, worldTangent, d);
                sub(projectedPoint, circleOffset, orthoDist);


                // Check if the point is within the edge span
                var pos =  dot(worldEdgeUnit, projectedPoint);
                var pos0 = dot(worldEdgeUnit, worldVertex0);
                var pos1 = dot(worldEdgeUnit, worldVertex1);

                if(pos > pos0 && pos < pos1){
                    // We got contact!

                    if(justTest) return true;

                    if(closestEdgeDistance === null || d*d<closestEdgeDistance*closestEdgeDistance){
                        closestEdgeDistance = d;
                        closestEdge = i;
                        vec2.copy(closestEdgeOrthoDist, orthoDist);
                        vec2.copy(closestEdgeProjectedPoint, projectedPoint);
                    }
                }
            }
            */

            if(candidateDistance < minCandidateDistance){
                vec2.copy(minCandidate,candidate);
                minCandidateDistance = candidateDistance;
                vec2.scale(closestEdgeProjectedPoint,worldTangent,candidateDistance);
                vec2.add(closestEdgeProjectedPoint,closestEdgeProjectedPoint,candidate);
                found = true;
            }
        }
    }

    if(found){
        var c = this.createContactEquation(circleBody,convexBody,si,sj);
        vec2.sub(c.ni, minCandidate, circleOffset)
        vec2.normalize(c.ni, c.ni);

        vec2.scale(c.ri,  c.ni, circleRadius);
        add(c.ri, c.ri, circleOffset);
        sub(c.ri, c.ri, circleBody.position);

        sub(c.rj, closestEdgeProjectedPoint, convexOffset);
        add(c.rj, c.rj, convexOffset);
        sub(c.rj, c.rj, convexBody.position);

        this.contactEquations.push(c);

        if(this.enableFriction)
            this.frictionEquations.push( this.createFrictionFromContact(c) );

        return true;
    }

    /*
    if(closestEdge != -1){
        var c = this.createContactEquation(circleBody,convexBody);

        vec2.scale(c.ni, closestEdgeOrthoDist, -1);
        vec2.normalize(c.ni, c.ni);

        vec2.scale(c.ri,  c.ni, circleRadius);
        add(c.ri, c.ri, circleOffset);
        sub(c.ri, c.ri, circleBody.position);

        sub(c.rj, closestEdgeProjectedPoint, convexOffset);
        add(c.rj, c.rj, convexOffset);
        sub(c.rj, c.rj, convexBody.position);

        this.contactEquations.push(c);

        if(this.enableFriction)
            this.frictionEquations.push( this.createFrictionFromContact(c) );

        return true;
    }
    */

    // Check all vertices
    if(circleRadius > 0){
        for(var i=0; i<verts.length; i++){
            var localVertex = verts[i];
            vec2.rotate(worldVertex, localVertex, convexAngle);
            add(worldVertex, worldVertex, convexOffset);

            sub(dist, worldVertex, circleOffset);
            if(vec2.squaredLength(dist) < circleRadius*circleRadius){

                if(justTest) return true;

                var c = this.createContactEquation(circleBody,convexBody,si,sj);

                vec2.copy(c.ni, dist);
                vec2.normalize(c.ni,c.ni);

                // Vector from circle to contact point is the normal times the circle radius
                vec2.scale(c.ri, c.ni, circleRadius);
                add(c.ri, c.ri, circleOffset);
                sub(c.ri, c.ri, circleBody.position);

                sub(c.rj, worldVertex, convexOffset);
                add(c.rj, c.rj, convexOffset);
                sub(c.rj, c.rj, convexBody.position);

                this.contactEquations.push(c);

                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }

                return true;
            }
        }
    }

    return false;
};

// Check if a point is in a polygon
var pic_worldVertex0 = vec2.create(),
    pic_worldVertex1 = vec2.create(),
    pic_r0 = vec2.create(),
    pic_r1 = vec2.create();
function pointInConvex(worldPoint,convexShape,convexOffset,convexAngle){
    var worldVertex0 = pic_worldVertex0,
        worldVertex1 = pic_worldVertex1,
        r0 = pic_r0,
        r1 = pic_r1,
        point = worldPoint,
        verts = convexShape.vertices,
        lastCross = null;
    for(var i=0; i!==verts.length+1; i++){
        var v0 = verts[i%verts.length],
            v1 = verts[(i+1)%verts.length];

        // Transform vertices to world
        // can we instead transform point to local of the convex???
        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);

        sub(r0, worldVertex0, point);
        sub(r1, worldVertex1, point);
        var cross = vec2.crossLength(r0,r1);

        if(lastCross===null) lastCross = cross;

        // If we got a different sign of the distance vector, the point is out of the polygon
        if(cross*lastCross <= 0){
            return false;
        }
        lastCross = cross;
    }
    return true;
};

/**
 * Particle/convex Narrowphase
 * @method particleConvex
 * @param  {Body} bi
 * @param  {Particle} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Convex} sj
 * @param  {Array} xj
 * @param  {Number} aj
 * @todo use pointInConvex and code more similar to circleConvex
 */
Narrowphase.prototype[Shape.PARTICLE | Shape.CONVEX] =
Narrowphase.prototype.particleConvex = function(  bi,si,xi,ai, bj,sj,xj,aj, justTest ){
    var convexShape = sj,
        convexAngle = aj,
        convexBody = bj,
        convexOffset = xj,
        particleOffset = xi,
        particleBody = bi,
        particleShape = si,
        worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldEdge = tmp3,
        worldEdgeUnit = tmp4,
        worldTangent = tmp5,
        centerDist = tmp6,
        convexToparticle = tmp7,
        orthoDist = tmp8,
        projectedPoint = tmp9,
        dist = tmp10,
        worldVertex = tmp11,
        closestEdge = -1,
        closestEdgeDistance = null,
        closestEdgeOrthoDist = tmp12,
        closestEdgeProjectedPoint = tmp13,
        r0 = tmp14, // vector from particle to vertex0
        r1 = tmp15,
        localPoint = tmp16,
        candidateDist = tmp17,
        minEdgeNormal = tmp18,
        minCandidateDistance = Number.MAX_VALUE;

    var numReported = 0,
        found = false,
        verts = convexShape.vertices;

    // Check if the particle is in the polygon at all
    if(!pointInConvex(particleOffset,convexShape,convexOffset,convexAngle))
        return false;

    // Check edges first
    var lastCross = null;
    for(var i=0; i!==verts.length+1; i++){
        var v0 = verts[i%verts.length],
            v1 = verts[(i+1)%verts.length];

        // Transform vertices to world
        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);

        // Get world edge
        sub(worldEdge, worldVertex1, worldVertex0);
        vec2.normalize(worldEdgeUnit, worldEdge);

        // Get tangent to the edge. Points out of the Convex
        vec2.rotate(worldTangent, worldEdgeUnit, -Math.PI/2);

        // Check distance from the infinite line (spanned by the edge) to the particle
        sub(dist, particleOffset, worldVertex0);
        var d = dot(dist, worldTangent);
        sub(centerDist, worldVertex0, convexOffset);

        sub(convexToparticle, particleOffset, convexOffset);


        /*
        if(d < 0 && dot(centerDist,convexToparticle) >= 0){

            // Now project the particle onto the edge
            vec2.scale(orthoDist, worldTangent, d);
            sub(projectedPoint, particleOffset, orthoDist);

            // Check if the point is within the edge span
            var pos =  dot(worldEdgeUnit, projectedPoint);
            var pos0 = dot(worldEdgeUnit, worldVertex0);
            var pos1 = dot(worldEdgeUnit, worldVertex1);

            if(pos > pos0 && pos < pos1){
                // We got contact!
                if(justTest) return true;

                if(closestEdgeDistance === null || d*d<closestEdgeDistance*closestEdgeDistance){
                    closestEdgeDistance = d;
                    closestEdge = i;
                    vec2.copy(closestEdgeOrthoDist, orthoDist);
                    vec2.copy(closestEdgeProjectedPoint, projectedPoint);
                }
            }
        }
        */

        vec2.sub(candidateDist,worldVertex0,particleOffset);
        var candidateDistance = Math.abs(vec2.dot(candidateDist,worldTangent));

        if(candidateDistance < minCandidateDistance){
            minCandidateDistance = candidateDistance;
            vec2.scale(closestEdgeProjectedPoint,worldTangent,candidateDistance);
            vec2.add(closestEdgeProjectedPoint,closestEdgeProjectedPoint,particleOffset);
            vec2.copy(minEdgeNormal,worldTangent);
            found = true;
        }
    }

    if(found){
        var c = this.createContactEquation(particleBody,convexBody,si,sj);

        vec2.scale(c.ni, minEdgeNormal, -1);
        vec2.normalize(c.ni, c.ni);

        // Particle has no extent to the contact point
        vec2.set(c.ri,  0, 0);
        add(c.ri, c.ri, particleOffset);
        sub(c.ri, c.ri, particleBody.position);

        // From convex center to point
        sub(c.rj, closestEdgeProjectedPoint, convexOffset);
        add(c.rj, c.rj, convexOffset);
        sub(c.rj, c.rj, convexBody.position);

        this.contactEquations.push(c);

        if(this.enableFriction)
            this.frictionEquations.push( this.createFrictionFromContact(c) );

        return true;
    }


    return false;
};

/**
 * Circle/circle Narrowphase
 * @method circleCircle
 * @param  {Body} bi
 * @param  {Circle} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Circle} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CIRCLE] =
Narrowphase.prototype.circleCircle = function(  bi,si,xi,ai, bj,sj,xj,aj, justTest){
    var bodyA = bi,
        shapeA = si,
        offsetA = xi,
        bodyB = bj,
        shapeB = sj,
        offsetB = xj,
        dist = tmp1;

    sub(dist,xi,xj);
    var r = si.radius + sj.radius;
    if(vec2.squaredLength(dist) > r*r){
        return false;
    }

    if(justTest) return true;

    var c = this.createContactEquation(bodyA,bodyB,si,sj);
    sub(c.ni, offsetB, offsetA);
    vec2.normalize(c.ni,c.ni);

    vec2.scale( c.ri, c.ni,  shapeA.radius);
    vec2.scale( c.rj, c.ni, -shapeB.radius);

    add(c.ri, c.ri, offsetA);
    sub(c.ri, c.ri, bodyA.position);

    add(c.rj, c.rj, offsetB);
    sub(c.rj, c.rj, bodyB.position);

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }
    return true;
};

/**
 * Plane/Convex Narrowphase
 * @method planeConvex
 * @param  {Body} bi
 * @param  {Plane} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Convex} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.PLANE | Shape.CONVEX] =
Narrowphase.prototype.planeConvex = function( bi,si,xi,ai, bj,sj,xj,aj ){
    var convexBody = bj,
        convexOffset = xj,
        convexShape = sj,
        convexAngle = aj,
        planeBody = bi,
        planeShape = si,
        planeOffset = xi,
        planeAngle = ai;

    var worldVertex = tmp1,
        worldNormal = tmp2,
        dist = tmp3;

    var numReported = 0;
    vec2.rotate(worldNormal, yAxis, planeAngle);

    for(var i=0; i<convexShape.vertices.length; i++){
        var v = convexShape.vertices[i];
        vec2.rotate(worldVertex, v, convexAngle);
        add(worldVertex, worldVertex, convexOffset);

        sub(dist, worldVertex, planeOffset);

        if(dot(dist,worldNormal) < 0){

            // Found vertex
            numReported++;

            var c = this.createContactEquation(planeBody,convexBody,planeShape,convexShape);

            sub(dist, worldVertex, planeOffset);

            vec2.copy(c.ni, worldNormal);

            var d = dot(dist, c.ni);
            vec2.scale(dist, c.ni, d);

            // rj is from convex center to contact
            sub(c.rj, worldVertex, convexBody.position);


            // ri is from plane center to contact
            sub( c.ri, worldVertex, dist);
            sub( c.ri, c.ri, planeBody.position);

            this.contactEquations.push(c);

            // TODO: if we have 2 contacts, we do only need 1 friction equation

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }

            if(numReported >= 2)
                break;
        }
    }
    return numReported > 0;
};

/**
 * Narrowphase for particle vs plane
 * @method particlePlane
 * @param  {Body}       bi The particle body
 * @param  {Particle}   si Particle shape
 * @param  {Array}      xi World position for the particle
 * @param  {Number}     ai World angle for the particle
 * @param  {Body}       bj Plane body
 * @param  {Plane}      sj Plane shape
 * @param  {Array}      xj World position for the plane
 * @param  {Number}     aj World angle for the plane
 */
Narrowphase.prototype[Shape.PARTICLE | Shape.PLANE] =
Narrowphase.prototype.particlePlane = function( bi,si,xi,ai, bj,sj,xj,aj, justTest ){
    var particleBody = bi,
        particleShape = si,
        particleOffset = xi,
        planeBody = bj,
        planeShape = sj,
        planeOffset = xj,
        planeAngle = aj;

    var dist = tmp1,
        worldNormal = tmp2;

    planeAngle = planeAngle || 0;

    sub(dist, particleOffset, planeOffset);
    vec2.rotate(worldNormal, yAxis, planeAngle);

    var d = dot(dist, worldNormal);

    if(d > 0) return false;
    if(justTest) return true;

    var c = this.createContactEquation(planeBody,particleBody,sj,si);

    vec2.copy(c.ni, worldNormal);
    vec2.scale( dist, c.ni, d );
    // dist is now the distance vector in the normal direction

    // ri is the particle position projected down onto the plane, from the plane center
    sub( c.ri, particleOffset, dist);
    sub( c.ri, c.ri, planeBody.position);

    // rj is from the body center to the particle center
    sub( c.rj, particleOffset, particleBody.position );

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }
    return true;
};

/**
 * Circle/Particle Narrowphase
 * @method circleParticle
 * @param  {Body} bi
 * @param  {Circle} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Particle} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.PARTICLE] =
Narrowphase.prototype.circleParticle = function(   bi,si,xi,ai, bj,sj,xj,aj, justTest ){
    var circleBody = bi,
        circleShape = si,
        circleOffset = xi,
        particleBody = bj,
        particleShape = sj,
        particleOffset = xj,
        dist = tmp1;

    sub(dist, particleOffset, circleOffset);
    if(vec2.squaredLength(dist) > circleShape.radius*circleShape.radius) return false;
    if(justTest) return true;

    var c = this.createContactEquation(circleBody,particleBody,si,sj);
    vec2.copy(c.ni, dist);
    vec2.normalize(c.ni,c.ni);

    // Vector from circle to contact point is the normal times the circle radius
    vec2.scale(c.ri, c.ni, circleShape.radius);
    add(c.ri, c.ri, circleOffset);
    sub(c.ri, c.ri, circleBody.position);

    // Vector from particle center to contact point is zero
    sub(c.rj, particleOffset, particleBody.position);

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }

    return true;
};

var capsulePlane_tmpCircle = new Circle(1),
    capsulePlane_tmp1 = vec2.create(),
    capsulePlane_tmp2 = vec2.create(),
    capsulePlane_tmp3 = vec2.create();

Narrowphase.prototype[Shape.PLANE | Shape.CAPSULE] =
Narrowphase.prototype.planeCapsule = function( bi,si,xi,ai, bj,sj,xj,aj ){
    var end1 = capsulePlane_tmp1,
        end2 = capsulePlane_tmp2,
        circle = capsulePlane_tmpCircle,
        dst = capsulePlane_tmp3;

    // Compute world end positions
    vec2.set(end1, -sj.length/2, 0);
    vec2.rotate(end1,end1,aj);
    add(end1,end1,xj);

    vec2.set(end2,  sj.length/2, 0);
    vec2.rotate(end2,end2,aj);
    add(end2,end2,xj);

    circle.radius = sj.radius;

    // Do Narrowphase as two circles
    this.circlePlane(bj,circle,end1,0, bi,si,xi,ai);
    this.circlePlane(bj,circle,end2,0, bi,si,xi,ai);
};

/**
 * Creates ContactEquations and FrictionEquations for a collision.
 * @method circlePlane
 * @param  {Body}    bi     The first body that should be connected to the equations.
 * @param  {Circle}  si     The circle shape participating in the collision.
 * @param  {Array}   xi     Extra offset to take into account for the Shape, in addition to the one in circleBody.position. Will *not* be rotated by circleBody.angle (maybe it should, for sake of homogenity?). Set to null if none.
 * @param  {Body}    bj     The second body that should be connected to the equations.
 * @param  {Plane}   sj     The Plane shape that is participating
 * @param  {Array}   xj     Extra offset for the plane shape.
 * @param  {Number}  aj     Extra angle to apply to the plane
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.PLANE] =
Narrowphase.prototype.circlePlane = function(   bi,si,xi,ai, bj,sj,xj,aj ){
    var circleBody = bi,
        circleShape = si,
        circleOffset = xi, // Offset from body center, rotated!
        planeBody = bj,
        shapeB = sj,
        planeOffset = xj,
        planeAngle = aj;

    planeAngle = planeAngle || 0;

    // Vector from plane to circle
    var planeToCircle = tmp1,
        worldNormal = tmp2,
        temp = tmp3;

    sub(planeToCircle, circleOffset, planeOffset);

    // World plane normal
    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Normal direction distance
    var d = dot(worldNormal, planeToCircle);

    if(d > circleShape.radius) return false; // No overlap. Abort.

    // Create contact
    var contact = this.createContactEquation(planeBody,circleBody,sj,si);

    // ni is the plane world normal
    vec2.copy(contact.ni, worldNormal);

    // rj is the vector from circle center to the contact point
    vec2.scale(contact.rj, contact.ni, -circleShape.radius);
    add(contact.rj, contact.rj, circleOffset);
    sub(contact.rj, contact.rj, circleBody.position);

    // ri is the distance from plane center to contact.
    vec2.scale(temp, contact.ni, d);
    sub(contact.ri, planeToCircle, temp ); // Subtract normal distance vector from the distance vector
    add(contact.ri, contact.ri, planeOffset);
    sub(contact.ri, contact.ri, planeBody.position);

    this.contactEquations.push(contact);

    if(this.enableFriction){
        this.frictionEquations.push( this.createFrictionFromContact(contact) );
    }

    return true;
};


/**
 * Convex/convex Narrowphase.See <a href="http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/">this article</a> for more info.
 * @method convexConvex
 * @param  {Body} bi
 * @param  {Convex} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Convex} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CONVEX] =
Narrowphase.prototype.convexConvex = function(  bi,si,xi,ai, bj,sj,xj,aj ){
    var sepAxis = tmp1,
        worldPoint = tmp2,
        worldPoint0 = tmp3,
        worldPoint1 = tmp4,
        worldEdge = tmp5,
        projected = tmp6,
        penetrationVec = tmp7,
        dist = tmp8,
        worldNormal = tmp9;

    var found = Narrowphase.findSeparatingAxis(si,xi,ai,sj,xj,aj,sepAxis);
    if(!found) return false;

    // Make sure the separating axis is directed from shape i to shape j
    sub(dist,xj,xi);
    if(dot(sepAxis,dist) > 0){
        vec2.scale(sepAxis,sepAxis,-1);
    }

    // Find edges with normals closest to the separating axis
    var closestEdge1 = Narrowphase.getClosestEdge(si,ai,sepAxis,true), // Flipped axis
        closestEdge2 = Narrowphase.getClosestEdge(sj,aj,sepAxis);

    if(closestEdge1==-1 || closestEdge2==-1) return false;

    // Loop over the shapes
    for(var k=0; k<2; k++){

        var closestEdgeA = closestEdge1,
            closestEdgeB = closestEdge2,
            shapeA =  si, shapeB =  sj,
            offsetA = xi, offsetB = xj,
            angleA = ai, angleB = aj,
            bodyA = bi, bodyB = bj;

        if(k==0){
            // Swap!
            var tmp;
            tmp = closestEdgeA; closestEdgeA = closestEdgeB;    closestEdgeB = tmp;
            tmp = shapeA;       shapeA = shapeB;                shapeB = tmp;
            tmp = offsetA;      offsetA = offsetB;              offsetB = tmp;
            tmp = angleA;       angleA = angleB;                angleB = tmp;
            tmp = bodyA;        bodyA = bodyB;                  bodyB = tmp;
        }

        // Loop over 2 points in convex B
        for(var j=closestEdgeB; j<closestEdgeB+2; j++){

            // Get world point
            var v = shapeB.vertices[(j+shapeB.vertices.length)%shapeB.vertices.length];
            vec2.rotate(worldPoint, v, angleB);
            add(worldPoint, worldPoint, offsetB);

            var insideNumEdges = 0;

            // Loop over the 3 closest edges in convex A
            for(var i=closestEdgeA-1; i<closestEdgeA+2; i++){

                var v0 = shapeA.vertices[(i  +shapeA.vertices.length)%shapeA.vertices.length],
                    v1 = shapeA.vertices[(i+1+shapeA.vertices.length)%shapeA.vertices.length];

                // Construct the edge
                vec2.rotate(worldPoint0, v0, angleA);
                vec2.rotate(worldPoint1, v1, angleA);
                add(worldPoint0, worldPoint0, offsetA);
                add(worldPoint1, worldPoint1, offsetA);

                sub(worldEdge, worldPoint1, worldPoint0);

                vec2.rotate(worldNormal, worldEdge, -Math.PI/2); // Normal points out of convex 1
                vec2.normalize(worldNormal,worldNormal);

                sub(dist, worldPoint, worldPoint0);

                var d = dot(worldNormal,dist);

                if(d < 0){
                    insideNumEdges++;
                }
            }

            if(insideNumEdges == 3){

                // worldPoint was on the "inside" side of each of the 3 checked edges.
                // Project it to the center edge and use the projection direction as normal

                // Create contact
                var c = this.createContactEquation(bodyA,bodyB,si,sj);

                // Get center edge from body A
                var v0 = shapeA.vertices[(closestEdgeA)   % shapeA.vertices.length],
                    v1 = shapeA.vertices[(closestEdgeA+1) % shapeA.vertices.length];

                // Construct the edge
                vec2.rotate(worldPoint0, v0, angleA);
                vec2.rotate(worldPoint1, v1, angleA);
                add(worldPoint0, worldPoint0, offsetA);
                add(worldPoint1, worldPoint1, offsetA);

                sub(worldEdge, worldPoint1, worldPoint0);

                vec2.rotate(c.ni, worldEdge, -Math.PI/2); // Normal points out of convex A
                vec2.normalize(c.ni,c.ni);

                sub(dist, worldPoint, worldPoint0); // From edge point to the penetrating point
                var d = dot(c.ni,dist);             // Penetration
                vec2.scale(penetrationVec, c.ni, d);     // Vector penetration


                sub(c.ri, worldPoint, offsetA);
                sub(c.ri, c.ri, penetrationVec);
                add(c.ri, c.ri, offsetA);
                sub(c.ri, c.ri, bodyA.position);

                sub(c.rj, worldPoint, offsetB);
                add(c.rj, c.rj, offsetB);
                sub(c.rj, c.rj, bodyB.position);

                this.contactEquations.push(c);

                // Todo reduce to 1 friction equation if we have 2 contact points
                if(this.enableFriction)
                    this.frictionEquations.push(this.createFrictionFromContact(c));
            }
        }
    }
};

// .projectConvex is called by other functions, need local tmp vectors
var pcoa_tmp1 = vec2.fromValues(0,0);

/**
 * Project a Convex onto a world-oriented axis
 * @method projectConvexOntoAxis
 * @static
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param  {Array} worldAxis
 * @param  {Array} result
 */
Narrowphase.projectConvexOntoAxis = function(convexShape, convexOffset, convexAngle, worldAxis, result){
    var max=null,
        min=null,
        v,
        value,
        localAxis = pcoa_tmp1;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, worldAxis, -convexAngle);

    // Get projected position of all vertices
    for(var i=0; i<convexShape.vertices.length; i++){
        v = convexShape.vertices[i];
        value = dot(v,localAxis);
        if(max === null || value > max) max = value;
        if(min === null || value < min) min = value;
    }

    if(min > max){
        var t = min;
        min = max;
        max = t;
    }

    // Project the position of the body onto the axis - need to add this to the result
    var offset = dot(convexOffset, worldAxis);

    vec2.set( result, min + offset, max + offset);
};

// .findSeparatingAxis is called by other functions, need local tmp vectors
var fsa_tmp1 = vec2.fromValues(0,0)
,   fsa_tmp2 = vec2.fromValues(0,0)
,   fsa_tmp3 = vec2.fromValues(0,0)
,   fsa_tmp4 = vec2.fromValues(0,0)
,   fsa_tmp5 = vec2.fromValues(0,0)
,   fsa_tmp6 = vec2.fromValues(0,0)

/**
 * Find a separating axis between the shapes, that maximizes the separating distance between them.
 * @method findSeparatingAxis
 * @static
 * @param  {Convex}     c1
 * @param  {Array}      offset1
 * @param  {Number}     angle1
 * @param  {Convex}     c2
 * @param  {Array}      offset2
 * @param  {Number}     angle2
 * @param  {Array}      sepAxis     The resulting axis
 * @return {Boolean}                Whether the axis could be found.
 */
Narrowphase.findSeparatingAxis = function(c1,offset1,angle1,c2,offset2,angle2,sepAxis){
    var maxDist = null,
        overlap = false,
        found = false,
        edge = fsa_tmp1,
        worldPoint0 = fsa_tmp2,
        worldPoint1 = fsa_tmp3,
        normal = fsa_tmp4,
        span1 = fsa_tmp5,
        span2 = fsa_tmp6;

    for(var j=0; j!==2; j++){
        var c = c1,
            angle = angle1;
        if(j===1){
            c = c2;
            angle = angle2;
        }

        for(var i=0; i!==c.vertices.length; i++){
            // Get the world edge
            vec2.rotate(worldPoint0, c.vertices[i], angle);
            vec2.rotate(worldPoint1, c.vertices[(i+1)%c.vertices.length], angle);

            sub(edge, worldPoint1, worldPoint0);

            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2.rotate(normal, edge, -Math.PI / 2);
            vec2.normalize(normal,normal);

            // Project hulls onto that normal
            Narrowphase.projectConvexOntoAxis(c1,offset1,angle1,normal,span1);
            Narrowphase.projectConvexOntoAxis(c2,offset2,angle2,normal,span2);

            // Order by span position
            var a=span1,
                b=span2,
                swapped = false;
            if(span1[0] > span2[0]){
                b=span1;
                a=span2;
                swapped = true;
            }

            // Get separating distance
            var dist = b[0] - a[1];
            overlap = dist < 0;

            if(maxDist===null || dist > maxDist){
                vec2.copy(sepAxis, normal);
                maxDist = dist;
                found = overlap;
            }
        }
    }

    return found;
};

// .getClosestEdge is called by other functions, need local tmp vectors
var gce_tmp1 = vec2.fromValues(0,0)
,   gce_tmp2 = vec2.fromValues(0,0)
,   gce_tmp3 = vec2.fromValues(0,0)

/**
 * Get the edge that has a normal closest to an axis.
 * @method getClosestEdge
 * @static
 * @param  {Convex}     c
 * @param  {Number}     angle
 * @param  {Array}      axis
 * @param  {Boolean}    flip
 * @return {Number}             Index of the edge that is closest. This index and the next spans the resulting edge. Returns -1 if failed.
 */
Narrowphase.getClosestEdge = function(c,angle,axis,flip){
    var localAxis = gce_tmp1,
        edge = gce_tmp2,
        normal = gce_tmp3;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, axis, -angle);
    if(flip){
        vec2.scale(localAxis,localAxis,-1);
    }

    var closestEdge = -1,
        N = c.vertices.length,
        halfPi = Math.PI / 2;
    for(var i=0; i!==N; i++){
        // Get the edge
        sub(edge, c.vertices[(i+1)%N], c.vertices[i%N]);

        // Get normal - just rotate 90 degrees since vertices are given in CCW
        vec2.rotate(normal, edge, -halfPi);
        vec2.normalize(normal,normal);

        var d = dot(normal,localAxis);
        if(closestEdge == -1 || d > maxDot){
            closestEdge = i % N;
            maxDot = d;
        }
    }

    return closestEdge;
};

