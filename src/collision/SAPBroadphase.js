var Utils = require('../utils/Utils')
,   Broadphase = require('../collision/Broadphase');

module.exports = SAPBroadphase;

/**
 * Sweep and prune broadphase along one axis.
 *
 * @class SAPBroadphase
 * @constructor
 * @extends Broadphase
 */
function SAPBroadphase(){
    Broadphase.call(this,Broadphase.SAP);

    /**
     * List of bodies currently in the broadphase.
     * @property axisList
     * @type {Array}
     */
    this.axisList = [];

    /**
     * The axis to sort along. 0 means x-axis and 1 y-axis. If your bodies are more spread out over the X axis, set axisIndex to 0, and you will gain some performance.
     * @property axisIndex
     * @type {Number}
     */
    this.axisIndex = 0;

    var that = this;
    this._addBodyHandler = function(e){
        that.axisList.push(e.body);
    };

    this._removeBodyHandler = function(e){
        // Remove from list
        var idx = that.axisList.indexOf(e.body);
        if(idx !== -1){
            that.axisList.splice(idx,1);
        }
    };
}
SAPBroadphase.prototype = new Broadphase();
SAPBroadphase.prototype.constructor = SAPBroadphase;

/**
 * Change the world
 * @method setWorld
 * @param {World} world
 */
SAPBroadphase.prototype.setWorld = function(world){
    // Clear the old axis array
    this.axisList.length = 0;

    // Add all bodies from the new world
    Utils.appendArray(this.axisList, world.bodies);

    // Remove old handlers, if any
    world
        .off("addBody",this._addBodyHandler)
        .off("removeBody",this._removeBodyHandler);

    // Add handlers to update the list of bodies.
    world.on("addBody",this._addBodyHandler).on("removeBody",this._removeBodyHandler);

    this.world = world;
};

/**
 * Sorts bodies along an axis.
 * @method sortAxisList
 * @param {Array} a
 * @param {number} axisIndex
 * @return {Array}
 */
SAPBroadphase.sortAxisList = function(a, axisIndex){
    axisIndex = axisIndex|0;
    for(var i=1,l=a.length; i<l; i++) {
        var v = a[i];
        for(var j=i - 1;j>=0;j--) {
            if(a[j].aabb.lowerBound[axisIndex] <= v.aabb.lowerBound[axisIndex]){
                break;
            }
            a[j+1] = a[j];
        }
        a[j+1] = v;
    }
    return a;
};

SAPBroadphase.prototype.sortList = function(){
    var bodies = this.axisList,
    axisIndex = this.axisIndex;

    // Sort the lists
    SAPBroadphase.sortAxisList(bodies, axisIndex);
};

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
SAPBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = this.axisList,
        result = this.result,
        axisIndex = this.axisIndex;

    result.length = 0;

    // Update all AABBs if needed
    var l = bodies.length;
    while(l--){
        var b = bodies[l];
        if(b.aabbNeedsUpdate){
            b.updateAABB();
        }
    }

    // Sort the lists
    this.sortList();

    // Look through the X list
    for(var i=0, N=bodies.length|0; i!==N; i++){
        var bi = bodies[i];

        for(var j=i+1; j<N; j++){
            var bj = bodies[j];

            // Bounds overlap?
            var overlaps = (bj.aabb.lowerBound[axisIndex] <= bi.aabb.upperBound[axisIndex]);
            if(!overlaps){
                break;
            }

            if(Broadphase.canCollide(bi,bj) && this.boundingVolumeCheck(bi,bj)){
                result.push(bi,bj);
            }
        }
    }

    return result;
};

/**
 * Returns all the bodies within an AABB.
 * @method aabbQuery
 * @param  {World} world
 * @param  {AABB} aabb
 * @param {array} result An array to store resulting bodies in.
 * @return {array}
 */
SAPBroadphase.prototype.aabbQuery = function(world, aabb, result){
    result = result || [];

    this.sortList();

    var axisIndex = this.axisIndex;
    var axis = 'x';
    if(axisIndex === 1){ axis = 'y'; }
    if(axisIndex === 2){ axis = 'z'; }

    var axisList = this.axisList;
    var lower = aabb.lowerBound[axis];
    var upper = aabb.upperBound[axis];
    for(var i = 0; i < axisList.length; i++){
        var b = axisList[i];

        if(b.aabbNeedsUpdate){
            b.updateAABB();
        }

        if(b.aabb.overlaps(aabb)){
            result.push(b);
        }
    }

    return result;
};