var Body = require('../objects/Body');

module.exports = Island;

/**
 * An island of bodies connected with equations.
 * @class Island
 * @constructor
 */
function Island(){

    /**
     * Current equations in this island.
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Current bodies in this island.
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];
}

/**
 * Clean this island from bodies and equations.
 * @method reset
 */
Island.prototype.reset = function(){
    this.equations.length = this.bodies.length = 0;
};

var bodyIds = [];

/**
 * Get all unique bodies in this island.
 * @method getBodies
 * @return {Array} An array of Body
 */
Island.prototype.getBodies = function(result){
    var bodies = result || [],
        eqs = this.equations;
    bodyIds.length = 0;
    for(var i=0; i!==eqs.length; i++){
        var eq = eqs[i];
        if(bodyIds.indexOf(eq.bi.id)===-1){
            bodies.push(eq.bi);
            bodyIds.push(eq.bi.id);
        }
        if(bodyIds.indexOf(eq.bj.id)===-1){
            bodies.push(eq.bj);
            bodyIds.push(eq.bj.id);
        }
    }
    return bodies;
};

Island.prototype.wantsToSleep = function(){
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i];
        if(b.motionState === Body.DYNAMIC && !b.wantsToSleep){
            return false;
        }
    }
    return true;
};

Island.prototype.sleep = function(){
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i];
        b.sleep();
    }
    return true;
};
