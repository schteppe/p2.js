    /**
     * Base class for constraint solvers.
     * @class
     */
    p2.Solver = function(){
        /**
         * Current equations in the solver.
         * @member {Array}
         * @memberof p2.Solver
         */
        this.equations = [];
    };
    p2.Solver.prototype.solve = function(dt,world){ return 0; };
    
    /**
     * Add an equation to be solved.
     * @method
     * @memberof p2.Solver
     * @param {p2.Equation} eq
     */
    p2.Solver.prototype.addEquation = function(eq){
        this.equations.push(eq);
    };
    
    /**
     * Remove an equation.
     * @method
     * @memberof p2.Solver
     * @param {p2.Equation} eq
     */
    p2.Solver.prototype.removeEquation = function(eq){
        var i = this.equations.indexOf(eq);
        if(i!=-1)
            this.equations.splice(i,1);
    };
    
    /**
     * Remove all currently added equations.
     * @method
     * @memberof p2.Solver
     */
    p2.Solver.prototype.removeAllEquations = function(){
        this.equations = [];
    };
