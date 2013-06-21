exports.Constraint = Constraint;

/**
 * @class p2.Constraint
 * @brief Constraint base class
 * @author schteppe
 * @param p2.Body bodyA
 * @param p2.Body bodyB
 */
function Constraint(bodyA,bodyB){

    /**
     * @property Array equations
     * @memberOf p2.Constraint
     * @brief Equations to be solved in this constraint
     */
    this.equations = [];

    /**
     * @property p2.Body bodyA
     * @memberOf p2.Constraint
     */
    this.bodyA = bodyA;

    /**
     * @property p2.Body bodyB
     * @memberOf p2.Constraint
     */
    this.bodyB = bodyB;
};

/**
 * @method update
 * @memberOf p2.Constraint
 */
Constraint.prototype.update = function(){
    throw new Error("method update() not implmemented in this Constraint subclass!");
};
