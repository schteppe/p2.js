import Circle from '../shapes/Circle';
import Plane from '../shapes/Plane';
import Particle from '../shapes/Particle';
import Broadphase from '../collision/Broadphase';
import vec2 from '../math/vec2';
import Utils from '../utils/Utils';

export default GridBroadphase;

/**
 * Broadphase that uses axis-aligned bins.
 * @class GridBroadphase
 * @constructor
 * @extends Broadphase
 * @param {object} [options]
 * @param {number} [options.xmin]   Lower x bound of the grid
 * @param {number} [options.xmax]   Upper x bound
 * @param {number} [options.ymin]   Lower y bound
 * @param {number} [options.ymax]   Upper y bound
 * @param {number} [options.nx]     Number of bins along x axis
 * @param {number} [options.ny]     Number of bins along y axis
 * @todo Should have an option for dynamic scene size
 */
function GridBroadphase(options){
    Broadphase.apply(this);

    options = Utils.defaults(options,{
        xmin:   -100,
        xmax:   100,
        ymin:   -100,
        ymax:   100,
        nx:     10,
        ny:     10
    });

    this.xmin = options.xmin;
    this.ymin = options.ymin;
    this.xmax = options.xmax;
    this.ymax = options.ymax;
    this.nx = options.nx;
    this.ny = options.ny;

    this.binsizeX = (this.xmax-this.xmin) / this.nx;
    this.binsizeY = (this.ymax-this.ymin) / this.ny;
}
GridBroadphase.prototype = new Broadphase();

/**
 * Get collision pairs.
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
GridBroadphase.prototype.getCollisionPairs = function(world){
    var result = [],
        bodies = world.bodies,
        Ncolliding = bodies.length,
        binsizeX = this.binsizeX,
        binsizeY = this.binsizeY,
        nx = this.nx,
        ny = this.ny,
        xmin = this.xmin,
        ymin = this.ymin,
        xmax = this.xmax,
        ymax = this.ymax,
        i, j, k;

    // Todo: make garbage free
    var bins=[], Nbins=nx*ny;
    for(i=0; i<Nbins; i++){
        bins.push([]);
    }

    var xmult = nx / (xmax-xmin);
    var ymult = ny / (ymax-ymin);

    // Put all bodies into bins
    for(i=0; i!==Ncolliding; i++){
        var bi = bodies[i];
        var aabb = bi.aabb;
        var lowerX = Math.max(aabb.lowerBound[0], xmin);
        var lowerY = Math.max(aabb.lowerBound[1], ymin);
        var upperX = Math.min(aabb.upperBound[0], xmax);
        var upperY = Math.min(aabb.upperBound[1], ymax);
        var xi1 = Math.floor(xmult * (lowerX - xmin));
        var yi1 = Math.floor(ymult * (lowerY - ymin));
        var xi2 = Math.floor(xmult * (upperX - xmin));
        var yi2 = Math.floor(ymult * (upperY - ymin));

        // Put in bin
        for(j=xi1; j<=xi2; j++){
            for(k=yi1; k<=yi2; k++){
                var xi = j;
                var yi = k;
                var idx = xi*(ny-1) + yi;
                if(idx >= 0 && idx < Nbins){
                    bins[ idx ].push(bi);
                }
            }
        }
    }

    // Check each bin
    for(i=0; i!==Nbins; i++){
        var bin = bins[i],
            NbodiesInBin;
        for(j=0, NbodiesInBin=bin.length; j!==NbodiesInBin; j++){
            var bi = bin[j];
            for(k=0; k!==j; k++){
                var bj = bin[k];
                if(Broadphase.canCollide(bi,bj) && this.boundingVolumeCheck(bi,bj)){
                    result.push(bi,bj);
                }
            }
        }
    }
    return result;
};
