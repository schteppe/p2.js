    /**
     * Base class for constraint equations.
     * @class
     * @param {p2.Body} bi First body participating in the equation
     * @param {p2.Body} bj Second body participating in the equation
     * @param {number} minForce Minimum force to apply. Default: -1e6
     * @param {number} maxForce Maximum force to apply. Default: 1e6
     */
   p2.Equation = function(bi,bj,minForce,maxForce){
      this.id = -1;
      this.minForce = typeof(minForce)=="undefined" ? -1e6 : minForce;
      this.maxForce = typeof(maxForce)=="undefined" ? 1e6 : maxForce;
      this.bi = bi;
      this.bj = bj;
    };
    p2.Equation.prototype.constructor = p2.Equation;
