    exports.Solver = Solver;

    /**
     * Base class for constraint solvers.
     * @class
     */
    function Solver(){
        /**
         * Current equations in the solver.
         * @member {Array}
         * @memberof Solver
         */
        this.equations = [];
    };
    Solver.prototype.solve = function(dt,world){ return 0; };

    /**
     * Add an equation to be solved.
     * @method
     * @memberof Solver
     * @param {p2.Equation} eq
     */
    Solver.prototype.addEquation = function(eq){
        this.equations.push(eq);
    };

    /**
     * Remove an equation.
     * @method
     * @memberof Solver
     * @param {p2.Equation} eq
     */
    Solver.prototype.removeEquation = function(eq){
        var i = this.equations.indexOf(eq);
        if(i!=-1)
            this.equations.splice(i,1);
    };

    /**
     * Remove all currently added equations.
     * @method
     * @memberof Solver
     */
    Solver.prototype.removeAllEquations = function(){
        this.equations = [];
    };

