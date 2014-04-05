var Circle = require('../shapes/Circle')
,   Plane = require('../shapes/Plane')
,   Shape = require('../shapes/Shape')
,   Particle = require('../shapes/Particle')
,   Utils = require('../utils/Utils')
,   Broadphase = require('../collision/Broadphase')
,   vec2 = require('../math/vec2')

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
     * @property axisListX
     * @type {Array}
     */
    this.axisListX = [];

    /**
     * List of bodies currently in the broadphase.
     * @property axisListY
     * @type {Array}
     */
    this.axisListY = [];

    /**
     * The world to search in.
     * @property world
     * @type {World}
     */
    this.world = null;

    var axisListX = this.axisListX,
        axisListY = this.axisListY;

    this._addBodyHandler = function(e){
        axisListX.push(e.body);
        axisListY.push(e.body);
    };

    this._removeBodyHandler = function(e){
        // Remove from X list
        var idx = axisListX.indexOf(e.body);
        if(idx !== -1) axisListX.splice(idx,1);

        // Remove from Y list
        idx = axisListY.indexOf(e.body);
        if(idx !== -1) axisListY.splice(idx,1);
    }
};
SAPBroadphase.prototype = new Broadphase();

/**
 * Change the world
 * @method setWorld
 * @param  {World} world
 */
SAPBroadphase.prototype.setWorld = function(world){
    // Clear the old axis array
    this.axisListX.length = this.axisListY.length = 0;

    // Add all bodies from the new world
    Utils.appendArray(this.axisListX,world.bodies);
    Utils.appendArray(this.axisListY,world.bodies);

    // Remove old handlers, if any
    world
        .off("addBody",this._addBodyHandler)
        .off("removeBody",this._removeBodyHandler);

    // Add handlers to update the list of bodies.
    world.on("addBody",this._addBodyHandler).on("removeBody",this._removeBodyHandler);

    this.world = world;
};

/**
 * Sorts bodies along the X axis.
 * @method sortAxisListX
 * @param {Array} a
 * @return {Array}
 */
SAPBroadphase.sortAxisListX = function(a){
    for(var i=1,l=a.length;i<l;i++) {
        var v = a[i];
        for(var j=i - 1;j>=0;j--) {
            if(a[j].aabb.lowerBound[0] <= v.aabb.lowerBound[0])
                break;
            a[j+1] = a[j];
        }
        a[j+1] = v;
    }
    return a;
};

/**
 * Sorts bodies along the Y axis.
 * @method sortAxisListY
 * @param {Array} a
 * @return {Array}
 */
SAPBroadphase.sortAxisListY = function(a){
    for(var i=1,l=a.length;i<l;i++) {
        var v = a[i];
        for(var j=i - 1;j>=0;j--) {
            if(a[j].aabb.lowerBound[1] <= v.aabb.lowerBound[1])
                break;
            a[j+1] = a[j];
        }
        a[j+1] = v;
    }
    return a;
};

var preliminaryList = { keys:[] };

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
SAPBroadphase.prototype.getCollisionPairs = function(world){
    var bodiesX = this.axisListX,
        bodiesY = this.axisListY,
        result = this.result,
        axisIndex = this.axisIndex;

    result.length = 0;

    // Update all AABBs if needed
    for(var i=0; i!==bodiesX.length; i++){
        var b = bodiesX[i];
        if(b.aabbNeedsUpdate) b.updateAABB();
    }

    // Sort the lists
    SAPBroadphase.sortAxisListX(bodiesX);
    SAPBroadphase.sortAxisListY(bodiesY);

    // Look through the X list
    for(var i=0, N=bodiesX.length; i!==N; i++){
        var bi = bodiesX[i];

        for(var j=i+1; j<N; j++){
            var bj = bodiesX[j];

            // Bounds overlap?
            if(!SAPBroadphase.checkBounds(bi,bj,0))
                break;

            // add pair to preliminary list
            if(Broadphase.canCollide(bi,bj)){
                var key = bi.id < bj.id ? bi.id+' '+bj.id : bj.id+' '+bi.id;
                preliminaryList[key] = true;
                preliminaryList.keys.push(key);
            }
        }
    }

    // Look through the Y list
    for(var i=0, N=bodiesY.length; i!==N; i++){
        var bi = bodiesY[i];

        for(var j=i+1; j<N; j++){
            var bj = bodiesY[j];

            if(!SAPBroadphase.checkBounds(bi,bj,1)){
                break;
            }

            // If in preliminary list, add to final result
            if(Broadphase.canCollide(bi,bj)){
                var key = bi.id < bj.id ? bi.id+' '+bj.id : bj.id+' '+bi.id;
                if(preliminaryList[key] && this.boundingVolumeCheck(bi,bj)){
                    result.push(bi,bj);
                }
            }
        }
    }

    // Empty prel list
    var keys = preliminaryList.keys;
    for(var i=0, N=keys.length; i!==N; i++){
        delete preliminaryList[keys[i]];
    }
    keys.length = 0;

    return result;
};

/**
 * Check if the bounds of two bodies overlap, along the given SAP axis.
 * @static
 * @method checkBounds
 * @param  {Body} bi
 * @param  {Body} bj
 * @param  {Number} axisIndex
 * @return {Boolean}
 */
SAPBroadphase.checkBounds = function(bi,bj,axisIndex){
    /*
    var biPos = bi.position[axisIndex],
        ri = bi.boundingRadius,
        bjPos = bj.position[axisIndex],
        rj = bj.boundingRadius,
        boundA1 = biPos-ri,
        boundA2 = biPos+ri,
        boundB1 = bjPos-rj,
        boundB2 = bjPos+rj;

    return boundB1 < boundA2;
    */
    return bj.aabb.lowerBound[axisIndex] <= bi.aabb.upperBound[axisIndex];
};
