
    p2.NaiveBroadphase = function(){
        p2.Broadphase.apply(this);
        this.getCollisionPairs = function(world){
            var collidingBodies = world.collidingBodies;
            var result = [];
            for(var i=0, Ncolliding=collidingBodies.length; i!==Ncolliding; i++){
                var bi = collidingBodies[i];
                var si = bi.shape;
                for(var j=0; j!==i; j++){
                    var bj = collidingBodies[j];
                    var sj = bj.shape;
                    if(si instanceof p2.Circle){
                             if(sj instanceof p2.Circle)   checkCircleCircle  (bi,bj,result);
                        else if(sj instanceof p2.Particle) checkCircleParticle(bi,bj,result);
                        else if(sj instanceof p2.Plane)    checkCirclePlane   (bi,bj,result);
                    } else if(si instanceof p2.Particle){
                             if(sj instanceof p2.Circle)   checkCircleParticle(bj,bi,result);
                    } else if(si instanceof p2.Plane){
                             if(sj instanceof p2.Circle)   checkCirclePlane   (bj,bi,result);
                    }
                }
            }
            return result;
        };
    };
    p2.NaiveBroadphase.prototype = new p2.Broadphase();
