var vec2 = require('../math/vec2')
,   ContactEquation = require('../constraints/ContactEquation')
,   FrictionEquation = require('../constraints/FrictionEquation')
,   Circle = require('../shapes/Circle')

module.exports = Nearphase;

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

/**
 * Nearphase. Creates contacts and friction given shapes and transforms.
 * @class Nearphase
 * @constructor
 */
function Nearphase(){
    this.contactEquations = [];
    this.frictionEquations = [];
    this.enableFriction = true;
    this.slipForce = 10.0;
    this.reuseObjects = true;
    this.reusableContactEquations = [];
    this.reusableFrictionEquations = [];
};

/**
 * Throws away the old equatons and gets ready to create new
 * @method reset
 */
Nearphase.prototype.reset = function(){
    if(this.reuseObjects){
        var ce = this.contactEquations,
            fe = this.frictionEquations,
            rfe = this.reusableFrictionEquations,
            rce = this.reusableContactEquations;
        for(var i=0, N=ce.length; i!==N; i++) rce.push(ce[i]);
        for(var i=0, N=fe.length; i!==N; i++) rfe.push(fe[i]);

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
Nearphase.prototype.createContactEquation = function(bodyA,bodyB){
    var c = this.reusableContactEquations.length ? this.reusableContactEquations.pop() : new ContactEquation(bodyA,bodyB);
    c.bi = bodyA;
    c.bj = bodyB;
    return c;
};

/**
 * Creates a FrictionEquation, either by reusing an existing object or creating a new one.
 * @method createFrictionEquation
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {FrictionEquation}
 */
Nearphase.prototype.createFrictionEquation = function(bodyA,bodyB){
    var c = this.reusableFrictionEquations.length ? this.reusableFrictionEquations.pop() : new FrictionEquation(bodyA,bodyB);
    c.bi = bodyA;
    c.bj = bodyB;
    c.setSlipForce(this.slipForce);
    return c;
};

/**
 * Creates a FrictionEquation given the data in the ContactEquation. Uses same offset vectors ri and rj, but the tangent vector will be constructed from the collision normal.
 * @method createFrictionFromContact
 * @param  {ContactEquation} contactEquation
 * @return {FrictionEquation}
 */
Nearphase.prototype.createFrictionFromContact = function(c){
    var eq = this.createFrictionEquation(c.bi,c.bj);
    vec2.copy(eq.ri, c.ri);
    vec2.copy(eq.rj, c.rj);
    vec2.rotate(eq.t, c.ni, -Math.PI / 2);
    return eq;
}

/**
 * Plane/line nearphase
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
Nearphase.prototype.planeLine = function(bi,si,xi,ai, bj,sj,xj,aj){
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

    vec2.add(worldVertex01, worldVertex01, lineOffset);
    vec2.add(worldVertex11, worldVertex11, lineOffset);

    vec2.copy(worldVertex0,worldVertex01);
    vec2.copy(worldVertex1,worldVertex11);

    // Get vector along the line
    vec2.sub(worldEdge, worldVertex1, worldVertex0);
    vec2.normalize(worldEdgeUnit, worldEdge);

    // Get tangent to the edge.
    vec2.rotate(worldTangent, worldEdgeUnit, -Math.PI/2);

    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Check line ends
    var verts = [worldVertex0, worldVertex1];
    for(var i=0; i<verts.length; i++){
        var v = verts[i];

        vec2.sub(dist, v, planeOffset);

        var d = vec2.dot(dist,worldNormal);

        if(d < 0){

            var c = this.createContactEquation(planeBody,lineBody);

            vec2.copy(c.ni, worldNormal);
            vec2.normalize(c.ni,c.ni);

            // distance vector along plane normal
            vec2.scale(dist, worldNormal, d);

            // Vector from plane center to contact
            vec2.sub(c.ri, v, dist);
            vec2.sub(c.ri, c.ri, planeBody.position);

            // From line center to contact
            vec2.sub(c.rj, v,    lineOffset);
            vec2.add(c.rj, c.rj, lineOffset);
            vec2.sub(c.rj, c.rj, lineBody.position);

            this.contactEquations.push(c);

            // TODO : only need one friction equation if both points touch
            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }
        }
    }
};

/**
 * Circle/line nearphase
 * @method circleLine
 * @param  {Body} bi
 * @param  {Circle} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Line} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Nearphase.prototype.circleLine = function(bi,si,xi,ai, bj,sj,xj,aj){
    var lineShape = sj,
        lineAngle = aj,
        lineBody = bj,
        lineOffset = xj,
        circleOffset = xi,
        circleBody = bi,
        circleShape = si,

        orthoDist = tmp1,
        convexToCircle = tmp2,
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
        lineToCircle = tmp13;

    // Get start and end points
    vec2.set(worldVertex0, -lineShape.length/2, 0);
    vec2.set(worldVertex1,  lineShape.length/2, 0);

    // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
    vec2.rotate(worldVertex01, worldVertex0, lineAngle);
    vec2.rotate(worldVertex11, worldVertex1, lineAngle);

    vec2.add(worldVertex01, worldVertex01, lineOffset);
    vec2.add(worldVertex11, worldVertex11, lineOffset);

    vec2.copy(worldVertex0,worldVertex01);
    vec2.copy(worldVertex1,worldVertex11);

    // Get vector along the line
    vec2.sub(worldEdge, worldVertex1, worldVertex0);
    vec2.normalize(worldEdgeUnit, worldEdge);

    // Get tangent to the edge.
    vec2.rotate(worldTangent, worldEdgeUnit, -Math.PI/2);

    // Check distance from the plane spanned by the edge vs the circle
    vec2.sub(dist, circleOffset, worldVertex0);
    var d = vec2.dot(dist, worldTangent);
    vec2.sub(centerDist, worldVertex0, lineOffset);

    vec2.sub(lineToCircle, circleOffset, lineOffset);

    if(Math.abs(d) < circleShape.radius){

        // Now project the circle onto the edge
        vec2.scale(orthoDist, worldTangent, d);
        vec2.sub(projectedPoint, circleOffset, orthoDist);

        // Check if the point is within the edge span
        var pos =  vec2.dot(worldEdgeUnit, projectedPoint);
        var pos0 = vec2.dot(worldEdgeUnit, worldVertex0);
        var pos1 = vec2.dot(worldEdgeUnit, worldVertex1);

        if(pos > pos0 && pos < pos1){
            // We got contact!

            var c = this.createContactEquation(circleBody,lineBody);

            vec2.scale(c.ni, orthoDist, -1);
            vec2.normalize(c.ni, c.ni);

            vec2.scale( c.ri, c.ni,  circleShape.radius);
            vec2.add(c.ri, c.ri, circleOffset);
            vec2.sub(c.ri, c.ri, circleBody.position);

            vec2.sub( c.rj, projectedPoint, lineOffset);
            vec2.add(c.rj, c.rj, lineOffset);
            vec2.sub(c.rj, c.rj, lineBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }
        }
    }

    // Add corner
    var verts = [worldVertex0, worldVertex1];

    for(var i=0; i<verts.length; i++){
        var v = verts[i];

        vec2.sub(dist, v, circleOffset);

        if(vec2.squaredLength(dist) < circleShape.radius*circleShape.radius){

            var c = this.createContactEquation(circleBody,lineBody);

            vec2.copy(c.ni, dist);
            vec2.normalize(c.ni,c.ni);

            //console.log(vec2.str(c.ni));

            // Vector from circle to contact point is the normal times the circle radius
            vec2.scale(c.ri, c.ni, circleShape.radius);
            vec2.add(c.ri, c.ri, circleOffset);
            vec2.sub(c.ri, c.ri, circleBody.position);

            vec2.sub(c.rj, v, lineOffset);
            vec2.add(c.rj, c.rj, lineOffset);
            vec2.sub(c.rj, c.rj, lineBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }
        }
    }
};

/**
 * Circle/convex nearphase
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
Nearphase.prototype.circleConvex = function(  bi,si,xi,ai, bj,sj,xj,aj){
    var convexShape = sj,
        convexAngle = aj,
        convexBody = bj,
        convexOffset = xj,
        circleOffset = xi,
        circleBody = bi,
        circleShape = si;

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
        worldVertex = tmp11;

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

                var c = this.createContactEquation(circleBody,convexBody);

                vec2.scale(c.ni, orthoDist, -1);
                vec2.normalize(c.ni, c.ni);

                vec2.scale( c.ri, c.ni,  circleShape.radius);
                vec2.add(c.ri, c.ri, circleOffset);
                vec2.sub(c.ri, c.ri, circleBody.position);

                vec2.sub( c.rj, projectedPoint, convexOffset);
                vec2.add(c.rj, c.rj, convexOffset);
                vec2.sub(c.rj, c.rj, convexBody.position);

                this.contactEquations.push(c);

                if(this.enableFriction){
                    this.frictionEquations.push( this.createFrictionFromContact(c) );
                }

                return true;
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

            var c = this.createContactEquation(circleBody,convexBody);

            vec2.copy(c.ni, dist);
            vec2.normalize(c.ni,c.ni);

            // Vector from circle to contact point is the normal times the circle radius
            vec2.scale(c.ri, c.ni, circleShape.radius);
            vec2.add(c.ri, c.ri, circleOffset);
            vec2.sub(c.ri, c.ri, circleBody.position);

            vec2.sub(c.rj, worldVertex, convexOffset);
            vec2.add(c.rj, c.rj, convexOffset);
            vec2.sub(c.rj, c.rj, convexBody.position);

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
 * Particle/convex nearphase
 * @method particleConvex
 * @param  {Body} bi
 * @param  {Particle} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Convex} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Nearphase.prototype.particleConvex = function(  bi,si,xi,ai, bj,sj,xj,aj, justTest ){
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
        closestEdgeProjectedPoint = tmp13;

    var numReported = 0;

    verts = convexShape.vertices;

    // Check all edges first
    for(var i=0; i<verts.length; i++){
        var v0 = verts[i],
            v1 = verts[(i+1)%verts.length];

        // Transform vertices to world
        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        vec2.add(worldVertex0, worldVertex0, convexOffset);
        vec2.add(worldVertex1, worldVertex1, convexOffset);

        // Get world edge
        vec2.sub(worldEdge, worldVertex1, worldVertex0);
        vec2.normalize(worldEdgeUnit, worldEdge);

        // Get tangent to the edge. Points out of the Convex
        vec2.rotate(worldTangent, worldEdgeUnit, -Math.PI/2);

        // Check distance from the infinite line (spanned by the edge) to the particle
        vec2.sub(dist, particleOffset, worldVertex0);
        var d = vec2.dot(dist, worldTangent);
        vec2.sub(centerDist, worldVertex0, convexOffset);

        vec2.sub(convexToparticle, particleOffset, convexOffset);

        if(d < 0 && vec2.dot(centerDist,convexToparticle) >= 0){

            // Now project the particle onto the edge
            vec2.scale(orthoDist, worldTangent, d);
            vec2.sub(projectedPoint, particleOffset, orthoDist);

            // Check if the point is within the edge span
            var pos =  vec2.dot(worldEdgeUnit, projectedPoint);
            var pos0 = vec2.dot(worldEdgeUnit, worldVertex0);
            var pos1 = vec2.dot(worldEdgeUnit, worldVertex1);

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
    }

    if(closestEdge != -1){
        var c = this.createContactEquation(particleBody,convexBody);

        vec2.copy(c.ni, closestEdgeOrthoDist);
        vec2.normalize(c.ni, c.ni);

        vec2.set(c.ri,  0, 0);
        vec2.add(c.ri, c.ri, particleOffset);
        vec2.sub(c.ri, c.ri, particleBody.position);

        vec2.sub(c.rj, closestEdgeProjectedPoint, convexOffset);
        vec2.add(c.rj, c.rj, convexOffset);
        vec2.sub(c.rj, c.rj, convexBody.position);

        this.contactEquations.push(c);

        if(this.enableFriction)
            this.frictionEquations.push( this.createFrictionFromContact(c) );

        return true;
    }


    return false;
};

/**
 * Circle/circle nearphase
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
Nearphase.prototype.circleCircle = function(  bi,si,xi,ai, bj,sj,xj,aj){
    var bodyA = bi,
        shapeA = si,
        offsetA = xi,
        bodyB = bj,
        shapeB = sj,
        offsetB = xj;

    var c = this.createContactEquation(bodyA,bodyB);
    vec2.sub(c.ni, offsetB, offsetA);
    vec2.normalize(c.ni,c.ni);

    vec2.scale( c.ri, c.ni,  shapeA.radius);
    vec2.scale( c.rj, c.ni, -shapeB.radius);

    vec2.add(c.ri, c.ri, offsetA);
    vec2.sub(c.ri, c.ri, bodyA.position);

    vec2.add(c.rj, c.rj, offsetB);
    vec2.sub(c.rj, c.rj, bodyB.position);

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }
};

/**
 * Convex/Plane nearphase
 * @method convexPlane
 * @param  {Body} bi
 * @param  {Convex} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Plane} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Nearphase.prototype.convexPlane = function( bi,si,xi,ai, bj,sj,xj,aj ){
    var convexBody = bi,
        convexOffset = xi,
        convexShape = si,
        convexAngle = ai,
        planeBody = bj,
        planeShape = sj,
        planeOffset = xj,
        planeAngle = aj;

    var worldVertex = tmp1,
        worldNormal = tmp2,
        dist = tmp3;

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

            var c = this.createContactEquation(planeBody,convexBody);

            vec2.sub(dist, worldVertex, planeOffset);

            vec2.copy(c.ni, worldNormal);

            var d = vec2.dot(dist, c.ni);
            vec2.scale(dist, c.ni, d);

            // rj is from convex center to contact
            vec2.sub(c.rj, worldVertex, convexBody.position);


            // ri is from plane center to contact
            vec2.sub( c.ri, worldVertex, dist);
            vec2.sub( c.ri, c.ri, planeBody.position);

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
 * Nearphase for particle vs plane
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
Nearphase.prototype.particlePlane = function( bi,si,xi,ai, bj,sj,xj,aj, justTest ){
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

    vec2.sub(dist, particleOffset, planeOffset);
    vec2.rotate(worldNormal, yAxis, planeAngle);

    var d = vec2.dot(dist, worldNormal);

    if(d > 0) return false;
    if(justTest) return true;

    var c = this.createContactEquation(planeBody,particleBody);

    vec2.copy(c.ni, worldNormal);
    vec2.scale( dist, c.ni, d );
    // dist is now the distance vector in the normal direction

    // ri is the particle position projected down onto the plane, from the plane center
    vec2.sub( c.ri, particleOffset, dist);
    vec2.sub( c.ri, c.ri, planeBody.position);

    // rj is from the body center to the particle center
    vec2.sub( c.rj, particleOffset, particleBody.position );

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }
    return true;
};

/**
 * Circle/Particle nearphase
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
Nearphase.prototype.circleParticle = function(   bi,si,xi,ai, bj,sj,xj,aj, justTest ){
    var circleBody = bi,
        circleShape = si,
        circleOffset = xi,
        particleBody = bj,
        particleShape = sj,
        particleOffset = xj,
        dist = tmp1;

    vec2.sub(dist, particleOffset, circleOffset);
    if(vec2.squaredLength(dist) > circleShape.radius*circleShape.radius) return false;
    if(justTest) return true;

    var c = this.createContactEquation(circleBody,particleBody);
    vec2.copy(c.ni, dist);
    vec2.normalize(c.ni,c.ni);

    // Vector from circle to contact point is the normal times the circle radius
    vec2.scale(c.ri, c.ni, circleShape.radius);
    vec2.add(c.ri, c.ri, circleOffset);
    vec2.sub(c.ri, c.ri, circleBody.position);

    // Vector from particle center to contact point is zero
    vec2.sub(c.rj, particleOffset, particleBody.position);

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
Nearphase.prototype.capsulePlane = function( bi,si,xi,ai, bj,sj,xj,aj ){
    var end1 = capsulePlane_tmp1,
        end2 = capsulePlane_tmp2,
        circle = capsulePlane_tmpCircle,
        dst = capsulePlane_tmp3;

    // Compute world end positions
    vec2.set(end1, -si.length/2, 0);
    vec2.rotate(end1,end1,ai);
    vec2.add(end1,end1,xi);

    vec2.set(end2,  si.length/2, 0);
    vec2.rotate(end2,end2,ai);
    vec2.add(end2,end2,xi);

    circle.radius = si.radius;

    // Do nearphase as two circles
    this.circlePlane(bi,circle,end1,0, bj,sj,xj,aj);
    this.circlePlane(bi,circle,end2,0, bj,sj,xj,aj);
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
Nearphase.prototype.circlePlane = function(   bi,si,xi,ai, bj,sj,xj,aj ){
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

    vec2.sub(planeToCircle, circleOffset, planeOffset);

    // World plane normal
    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Normal direction distance
    var d = vec2.dot(worldNormal, planeToCircle);

    if(d > circleShape.radius) return false; // No overlap. Abort.

    // Create contact
    var contact = this.createContactEquation(planeBody,circleBody);

    // ni is the plane world normal
    vec2.copy(contact.ni, worldNormal);

    // rj is the vector from circle center to the contact point
    vec2.scale(contact.rj, contact.ni, -circleShape.radius);
    vec2.add(contact.rj, contact.rj, circleOffset);
    vec2.sub(contact.rj, contact.rj, circleBody.position);

    // ri is the distance from plane center to contact.
    vec2.scale(temp, contact.ni, d);
    vec2.sub(contact.ri, planeToCircle, temp ); // Subtract normal distance vector from the distance vector
    vec2.add(contact.ri, contact.ri, planeOffset);
    vec2.sub(contact.ri, contact.ri, planeBody.position);

    this.contactEquations.push(contact);

    if(this.enableFriction){
        this.frictionEquations.push( this.createFrictionFromContact(contact) );
    }

    return true;
};


/**
 * Convex/convex nearphase.See <a href="http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/">this article</a> for more info.
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
Nearphase.prototype.convexConvex = function(  bi,si,xi,ai, bj,sj,xj,aj ){
    var sepAxis = tmp1,
        worldPoint = tmp2,
        worldPoint0 = tmp3,
        worldPoint1 = tmp4,
        worldEdge = tmp5,
        projected = tmp6,
        penetrationVec = tmp7,
        dist = tmp8,
        worldNormal = tmp9;

    var found = Nearphase.findSeparatingAxis(si,xi,ai,sj,xj,aj,sepAxis);
    if(!found) return false;

    // Make sure the separating axis is directed from shape i to shape j
    vec2.sub(dist,xj,xi);
    if(vec2.dot(sepAxis,dist) > 0){
        vec2.scale(sepAxis,sepAxis,-1);
    }

    // Find edges with normals closest to the separating axis
    var closestEdge1 = Nearphase.getClosestEdge(si,ai,sepAxis,true), // Flipped axis
        closestEdge2 = Nearphase.getClosestEdge(sj,aj,sepAxis);

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
            vec2.add(worldPoint, worldPoint, offsetB);

            var insideNumEdges = 0;

            // Loop over the 3 closest edges in convex A
            for(var i=closestEdgeA-1; i<closestEdgeA+2; i++){

                var v0 = shapeA.vertices[(i  +shapeA.vertices.length)%shapeA.vertices.length],
                    v1 = shapeA.vertices[(i+1+shapeA.vertices.length)%shapeA.vertices.length];

                // Construct the edge
                vec2.rotate(worldPoint0, v0, angleA);
                vec2.rotate(worldPoint1, v1, angleA);
                vec2.add(worldPoint0, worldPoint0, offsetA);
                vec2.add(worldPoint1, worldPoint1, offsetA);

                vec2.sub(worldEdge, worldPoint1, worldPoint0);

                vec2.rotate(worldNormal, worldEdge, -Math.PI/2); // Normal points out of convex 1
                vec2.normalize(worldNormal,worldNormal);

                vec2.sub(dist, worldPoint, worldPoint0);

                var d = vec2.dot(worldNormal,dist);

                if(d < 0){
                    insideNumEdges++;
                }
            }

            if(insideNumEdges == 3){

                // worldPoint was on the "inside" side of each of the 3 checked edges.
                // Project it to the center edge and use the projection direction as normal

                // Create contact
                var c = this.createContactEquation(bodyA,bodyB);

                // Get center edge from body A
                var v0 = shapeA.vertices[(closestEdgeA)   % shapeA.vertices.length],
                    v1 = shapeA.vertices[(closestEdgeA+1) % shapeA.vertices.length];

                // Construct the edge
                vec2.rotate(worldPoint0, v0, angleA);
                vec2.rotate(worldPoint1, v1, angleA);
                vec2.add(worldPoint0, worldPoint0, offsetA);
                vec2.add(worldPoint1, worldPoint1, offsetA);

                vec2.sub(worldEdge, worldPoint1, worldPoint0);

                vec2.rotate(c.ni, worldEdge, -Math.PI/2); // Normal points out of convex A
                vec2.normalize(c.ni,c.ni);

                vec2.sub(dist, worldPoint, worldPoint0); // From edge point to the penetrating point
                var d = vec2.dot(c.ni,dist);             // Penetration
                vec2.scale(penetrationVec, c.ni, d);     // Vector penetration


                vec2.sub(c.ri, worldPoint, offsetA);
                vec2.sub(c.ri, c.ri, penetrationVec);
                vec2.add(c.ri, c.ri, offsetA);
                vec2.sub(c.ri, c.ri, bodyA.position);

                vec2.sub(c.rj, worldPoint, offsetB);
                vec2.add(c.rj, c.rj, offsetB);
                vec2.sub(c.rj, c.rj, bodyB.position);

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
Nearphase.projectConvexOntoAxis = function(convexShape, convexOffset, convexAngle, worldAxis, result){
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
Nearphase.findSeparatingAxis = function(c1,offset1,angle1,c2,offset2,angle2,sepAxis){
    var maxDist = null,
        overlap = false,
        found = false,
        edge = fsa_tmp1,
        worldPoint0 = fsa_tmp2,
        worldPoint1 = fsa_tmp3,
        normal = fsa_tmp4,
        span1 = fsa_tmp5,
        span2 = fsa_tmp6;

    for(var j=0; j<2; j++){
        var c = c1,
            angle = angle1;
        if(j==1){
            c = c2;
            angle = angle2;
        }

        for(var i=0; i<c.vertices.length; i++){
            // Get the world edge
            vec2.rotate(worldPoint0, c.vertices[i], angle);
            vec2.rotate(worldPoint1, c.vertices[(i+1)%c.vertices.length], angle);

            vec2.sub(edge, worldPoint1, worldPoint0);

            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2.rotate(normal, edge, -Math.PI / 2);
            vec2.normalize(normal,normal);

            // Project hulls onto that normal
            Nearphase.projectConvexOntoAxis(c1,offset1,angle1,normal,span1);
            Nearphase.projectConvexOntoAxis(c2,offset2,angle2,normal,span2);

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
Nearphase.getClosestEdge = function(c,angle,axis,flip){

    var localAxis = gce_tmp1,
        edge = gce_tmp2,
        normal = gce_tmp3;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, axis, -angle);
    if(flip){
        vec2.scale(localAxis,localAxis,-1);
    }

    var closestEdge = -1;
    for(var i=0; i<c.vertices.length; i++){
        // Get the edge
        vec2.subtract(edge, c.vertices[(i+1)%(c.vertices.length)], c.vertices[i%(c.vertices.length)]);

        // Get normal - just rotate 90 degrees since vertices are given in CCW
        vec2.rotate(normal, edge, -Math.PI / 2);
        vec2.normalize(normal,normal);

        var dot = vec2.dot(normal,localAxis);
        if(closestEdge == -1 || dot > maxDot){
            closestEdge = i % c.vertices.length;
            maxDot = dot;
        }
    }

    return closestEdge;
};

