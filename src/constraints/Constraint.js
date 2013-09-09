exports.Constraint = Constraint;

/**
 * Base constraint class.
 *
 * @class Constraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
function Constraint(bodyA,bodyB){

    /**
     * Equations to be solved in this constraint
     * @member {Array}
     * @memberof Constraint
     */
    this.equations = [];

    /**
     * First body participating in the constraint.
     * @member {p2.Body}
     * @memberof Constraint
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint.
     * @member {p2.Body}
     * @memberof Constraint
     */
    this.bodyB = bodyB;
};

/**
 * To be implemented by subclasses. Should update the internal constraint parameters.
 *
 * @method
 * @memberof Constraint
 */
Constraint.prototype.update = function(){
    throw new Error("method update() not implmemented in this Constraint subclass!");
};
