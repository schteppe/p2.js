var TupleDictionary = require('./TupleDictionary');
var Utils = require('./Utils');

module.exports = OverlapKeeper;

/**
 * Keeps track of overlaps in the current state and the last step state.
 * @class OverlapKeeper
 * @constructor
 */
function OverlapKeeper() {
    this.overlappingLastState = new TupleDictionary();
    this.overlappingCurrentState = new TupleDictionary();
    this.recordPool = [];
    this.tmpDict = new TupleDictionary();
    this.tmpArray1 = [];
}

/**
 * @method tick
 */
OverlapKeeper.prototype.tick = function() {
    var last = this.overlappingLastState;
    var current = this.overlappingCurrentState;

    // Save old objects into pool
    var l = current.keys.length;
    while(l--){
        var key = current.keys[l];
        this.recordPool.push(current.get(key));
    }

    // Clear last object
    last.reset();

    // Transfer from new object to old
    last.copy(current);

    // Clear current object
    current.reset();
};

/**
 * @method setOverlapping
 */
OverlapKeeper.prototype.setOverlapping = function(bodyA, shapeA, bodyB, shapeB) {
    var last = this.overlappingLastState;
    var current = this.overlappingCurrentState;

    // Store current contact state
    if(!current.get(shapeA.id, shapeB.id)){

        var data;
        if(this.recordPool.length){
            data = this.recordPool.pop();
        } else {
            data = new OverlapKeeperRecord(bodyA, shapeA, bodyB, shapeB);
        }

        current.set(shapeA.id, shapeB.id, data);
    }
};

OverlapKeeper.prototype.getNewOverlaps = function(result){
    return this.getDiff(this.overlappingLastState, this.overlappingCurrentState, result);
};

OverlapKeeper.prototype.getEndOverlaps = function(result){
    return this.getDiff(this.overlappingCurrentState, this.overlappingLastState, result);
};

OverlapKeeper.prototype.getDiff = function(dictA, dictB, result){
    var result = result || [];
    var last = dictA;
    var current = dictB;

    var l = current.keys.length;
    while(l--){
        var key = current.keys[l];

        var data = current.data[key];
        if(!data){
            continue;
        }

        var lastData = last.data[key];
        if(!lastData){
            // Not overlapping in last state, but in current.
            result.push(data);
        }
    }

    return result;
};

OverlapKeeper.prototype.isNewOverlap = function(shapeA, shapeB){
    return !!!this.overlappingLastState.get(shapeA.id, shapeB.id);
};

OverlapKeeper.prototype.getNewBodyOverlaps = function(result){
    this.tmpArray1.length = 0;
    var overlaps = this.getNewOverlaps(this.tmpArray1);
    return this.getBodyDiff(overlaps, result);
};

OverlapKeeper.prototype.getEndBodyOverlaps = function(result){
    this.tmpArray1.length = 0;
    var overlaps = this.getEndOverlaps(this.tmpArray1);
    return this.getBodyDiff(overlaps, result);
};

OverlapKeeper.prototype.getBodyDiff = function(overlaps, result){
    result = result || [];
    var accumulator = this.tmpDict;

    var l = overlaps.length;

    while(l--){
        var data = overlaps[l];

        // Since we use body id's for the accumulator, these will be a subset of the original one
        accumulator.set(data.bodyA.id, data.bodyB.id, data);
    }

    l = accumulator.keys.length;
    while(l--){
        var data = accumulator.keys[l];
        result.push(data.bodyA, data.bodyB);
    }

    accumulator.reset();

    return result;
};

/**
 * Overlap data container for the OverlapKeeper
 * @param {Body} bodyA
 * @param {Shape} shapeA
 * @param {Body} bodyB
 * @param {Shape} shapeB [description]
 */
function OverlapKeeperRecord(bodyA, shapeA, bodyB, shapeB){
    /**
     * @property {Shape} shapeA
     */
    this.shapeA = shapeA;
    /**
     * @property {Shape} shapeB
     */
    this.shapeB = shapeB;
    /**
     * @property {Body} bodyA
     */
    this.bodyA = bodyA;
    /**
     * @property {Body} bodyB
     */
    this.bodyB = bodyB;
}

OverlapKeeperRecord.prototype.set = function(bodyA, shapeA, bodyB, shapeB){
    OverlapKeeperRecord.call(this, bodyA, shapeA, bodyB, shapeB);
};
