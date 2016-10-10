module.exports = Constraint;

/**
 * Base constraint class.
 *
 * @class Constraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Number} type
 * @param {Object} [options]
 * @param {Object} [options.collideConnected=true]
 */
function Constraint(bodyA, bodyB, type, options){
    options = options || {};

    /**
     * The type of constraint. May be one of Constraint.DISTANCE, Constraint.GEAR, Constraint.LOCK, Constraint.PRISMATIC or Constraint.REVOLUTE.
     * @property {number} type
     */
    this.type = type;

    /**
     * Equations to be solved in this constraint
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * First body participating in the constraint.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;

    /**
     * Set to true if you want the connected bodies to collide.
     * @property collideConnected
     * @type {Boolean}
     * @default true
     */
    this.collideConnected = options.collideConnected !== undefined ? options.collideConnected : true;

    // Wake up bodies when connected
    if(options.wakeUpBodies !== false){
        if(bodyA){
            bodyA.wakeUp();
        }
        if(bodyB){
            bodyB.wakeUp();
        }
    }
}

/**
 * Updates the internal constraint parameters before solve.
 * @method update
 */
Constraint.prototype.update = function(){
    throw new Error("method update() not implmemented in this Constraint subclass!");
};

/**
 * @static
 * @property {number} DISTANCE
 */
Constraint.DISTANCE = 1;

/**
 * @static
 * @property {number} GEAR
 */
Constraint.GEAR = 2;

/**
 * @static
 * @property {number} LOCK
 */
Constraint.LOCK = 3;

/**
 * @static
 * @property {number} PRISMATIC
 */
Constraint.PRISMATIC = 4;

/**
 * @static
 * @property {number} REVOLUTE
 */
Constraint.REVOLUTE = 5;

/**
 * Set stiffness for this constraint.
 * @method setStiffness
 * @param {Number} stiffness
 */
Constraint.prototype.setStiffness = function(stiffness){
    var eqs = this.equations;
    for(var i=0; i !== eqs.length; i++){
        var eq = eqs[i];
        eq.stiffness = stiffness;
        eq.needsUpdate = true;
    }
};

/**
 * Set relaxation for this constraint.
 * @method setRelaxation
 * @param {Number} relaxation
 */
Constraint.prototype.setRelaxation = function(relaxation){
    var eqs = this.equations;
    for(var i=0; i !== eqs.length; i++){
        var eq = eqs[i];
        eq.relaxation = relaxation;
        eq.needsUpdate = true;
    }
};

/**
 * @method setMaxBias
 * @param {Number} maxBias
 */
Constraint.prototype.setMaxBias = function(maxBias){
    var eqs = this.equations;
    for(var i=0; i !== eqs.length; i++){
        var eq = eqs[i];
        eq.maxBias = maxBias;
    }
};
