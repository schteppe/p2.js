    /**
     * Broadphase that uses axis-aligned bins.
     * @class
     * @extends p2.Broadphase
     * @param {number} xmin Lower x bound of the grid
     * @param {number} xmax Upper x bound
     * @param {number} ymin Lower y bound
     * @param {number} ymax Upper y bound
     * @param {number} nx Number of bins along x axis
     * @param {number} ny Number of bins along y axis
     */
    p2.GridBroadphase = function(xmin,xmax,ymin,ymax,nx,ny){
        p2.Broadphase.apply(this);

        nx = nx || 10;
        ny = ny || 10;
        var binsizeX = (xmax-xmin) / nx;
        var binsizeY = (ymax-ymin) / ny;
        var Plane = p2.Plane,
            Circle = p2.Circle,
            Particle = p2.Particle;

        function getBinIndex(x,y){
            var xi = Math.floor(nx * (x - xmin) / (xmax-xmin));
            var yi = Math.floor(ny * (y - ymin) / (ymax-ymin));
            return xi*ny + yi;
        }

        this.getCollisionPairs = function(world){
            var result = [];
            var collidingBodies = world.collidingBodies;
            var Ncolliding = Ncolliding=collidingBodies.length;

            var bins=[], Nbins=nx*ny;
            for(var i=0; i<Nbins; i++)
                bins.push([]);

            var xmult = nx / (xmax-xmin);
            var ymult = ny / (ymax-ymin);

            // Put all bodies into bins
            for(var i=0; i!==Ncolliding; i++){
                var bi = collidingBodies[i];
                var si = bi.shape;
                if (si === undefined) {
                    continue;
                } else if(si instanceof Circle){
                    // Put in bin
                    // check if overlap with other bins
                    var x = vec2.getX(bi.position);
                    var y = vec2.getY(bi.position);
                    var r = si.radius;

                    var xi1 = Math.floor(xmult * (x-r - xmin));
                    var yi1 = Math.floor(ymult * (y-r - ymin));
                    var xi2 = Math.floor(xmult * (x+r - xmin));
                    var yi2 = Math.floor(ymult * (y+r - ymin));

                    for(var j=xi1; j<=xi2; j++){
                        for(var k=yi1; k<=yi2; k++){
                            var xi = j;
                            var yi = k;
                            if(xi*(ny-1) + yi >= 0 && xi*(ny-1) + yi < Nbins)
                                bins[ xi*(ny-1) + yi ].push(bi);
                        }
                    }
                } else if(si instanceof Plane){
                    // Put in all bins for now
                    if(bi.angle == 0){
                        var y = vec2.getY(bi.position);
                        for(var j=0; j!==Nbins && ymin+binsizeY*(j-1)<y; j++){
                            for(var k=0; k<nx; k++){
                                var xi = k;
                                var yi = Math.floor(ymult * (binsizeY*j - ymin));
                                bins[ xi*(ny-1) + yi ].push(bi);
                            }
                        }
                    } else if(bi.angle == Math.PI*0.5){
                        var x = vec2.getX(bi.position);
                        for(var j=0; j!==Nbins && xmin+binsizeX*(j-1)<x; j++){
                            for(var k=0; k<ny; k++){
                                var yi = k;
                                var xi = Math.floor(xmult * (binsizeX*j - xmin));
                                bins[ xi*(ny-1) + yi ].push(bi);
                            }
                        }
                    } else {
                        for(var j=0; j!==Nbins; j++)
                            bins[j].push(bi);
                    }
                } else {
                    throw new Error("Shape not supported in GridBroadphase!");
                }
            }

            // Check each bin
            for(var i=0; i!==Nbins; i++){
                var bin = bins[i];
                for(var j=0, NbodiesInBin=bin.length; j!==NbodiesInBin; j++){
                    var bi = bin[j];
                    var si = bi.shape;

                    for(var k=0; k!==j; k++){
                        var bj = bin[k];
                        var sj = bj.shape;

                        if(si instanceof p2.Circle){
                                 if(sj instanceof Circle)   checkCircleCircle  (bi,bj,result);
                            else if(sj instanceof Particle) checkCircleParticle(bi,bj,result);
                            else if(sj instanceof Plane)    checkCirclePlane   (bi,bj,result);
                        } else if(si instanceof Particle){
                                 if(sj instanceof Circle)   checkCircleParticle(bj,bi,result);
                        } else if(si instanceof Plane){
                                 if(sj instanceof Circle)   checkCirclePlane   (bj,bi,result);
                        }
                    }
                }
            }
            return result;
        };
    };
    p2.GridBroadphase.prototype = new p2.Broadphase();

