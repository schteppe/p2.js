    exports.Equation = Equation;

    /**
     * Base class for constraint equations.
     * @class
     * @param {p2.Body} bi First body participating in the equation
     * @param {p2.Body} bj Second body participating in the equation
     * @param {number} minForce Minimum force to apply. Default: -1e6
     * @param {number} maxForce Maximum force to apply. Default: 1e6
     */
    function Equation(bi,bj,minForce,maxForce){
        this.id = -1;
        this.minForce = typeof(minForce)=="undefined" ? -1e6 : minForce;
        this.maxForce = typeof(maxForce)=="undefined" ? 1e6 : maxForce;
        this.bi = bi;
        this.bj = bj;
    };
    Equation.prototype.constructor = Equation;

