var Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase,
    glMatrix = require('gl-matrix'),
    vec2 = glMatrix.vec2;

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
exports.NaiveBroadphase = function(){
    Broadphase.apply(this);
    this.getCollisionPairs = function(world){
        var collidingBodies = world.collidingBodies;
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
        return result;
    };
};
exports.NaiveBroadphase.prototype = new Broadphase();
