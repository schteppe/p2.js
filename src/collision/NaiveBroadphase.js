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


            // Loop over all shapes of body i
            /*
            for(var k=0; k<bi.shapes.length; k++){
                var si = bi.shapes[k],
                    xi = bi.shapeOffsets[k],
                    ai = bi.shapeAngles[k];

                // All shapes of body j
                for(var l=0; l<bi.shapes.length; l++){
                    var sj = bj.shapes[l],
                        xj = bj.shapeOffsets[l],
                        aj = bj.shapeAngles[l];

                    vec2.rotate(rotatedOffset, offset, compound.angle);

                    if(s instanceof Circle){
                        if(checkCirclePlane(compound,s,rotatedOffset,plane,plane.shape,null,null,result)) return;
                    } else if(s instanceof Particle){
                        if(checkParticlePlane(compound,s,rotatedOffset,plane,plane.shape,null,null,result)) return;
                    }
                }
            }
            */

            if (sj === undefined) { // No shape. Skip.
                continue;

            } else if(si instanceof Circle){
                     if(sj instanceof Circle)   bp.checkCircleCircle  (bi.shape,bi.position,bj.shape,bj.position) && result.push(bi,bj);
                else if(sj instanceof Particle) bp.checkCircleParticle(bi,bi.shape,null,bj,bj.shape,null,result);
                else if(sj instanceof Plane)    bp.checkCirclePlane   (bi,bi.shape,null,bj,bj.shape,null,null,result);

            } else if(si instanceof Particle){
                     if(sj instanceof Circle)   bp.checkCircleParticle(bj,bj.shape,null,bi,bi.shape,null,result);
                else if(sj instanceof Plane)    bp.checkParticlePlane (bi,si,null,bj,si,null,null,result);

            } else if(si instanceof Plane){
                     if(sj instanceof Circle)   bp.checkCirclePlane   (bj,bj.shape,null,bi,bi.shape,null,null,result);
                     if(sj instanceof Compound) bp.checkCompoundPlane (bj,bi,result);
                else if(sj instanceof Particle) bp.checkParticlePlane (bj,sj,null,bi,si,null,null,result);

            } else if(si instanceof Compound){
                     if(sj instanceof Plane)   bp.checkCompoundPlane  (bi,bj,result);

            }
        }
    }
    return result;
};
