var EventEmitter = require('../events/EventEmitter');

module.exports = Solver;

/**
 * Base class for constraint solvers.
 * @class Solver
 * @constructor
 * @extends EventEmitter
 */
function Solver(options,type){
    options = options || {};

    EventEmitter.call(this);

    this.type = type;

    /**
     * Current equations in the solver.
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Function that is used to sort all equations before each solve.
     * @property equationSortFunction
     * @type {function|boolean}
     */
    this.equationSortFunction = options.equationSortFunction || false;
}
Solver.prototype = new EventEmitter();
Solver.prototype.constructor = Solver;

/**
 * Method to be implemented in each subclass
 * @method solve
 * @param  {Number} dt
 * @param  {World} world
 */
Solver.prototype.solve = function(/*dt,world*/){
    throw new Error("Solver.solve should be implemented by subclasses!");
};

/**
 * Sort all equations using the .equationSortFunction. Should be called by subclasses before solving.
 * @method sortEquations
 */
Solver.prototype.sortEquations = function(){
    if(this.equationSortFunction){
        this.equations.sort(this.equationSortFunction);
    }
};

/**
 * Add an equation to be solved.
 *
 * @method addEquation
 * @param {Equation} eq
 */
Solver.prototype.addEquation = function(eq){
    if(eq.enabled){
        this.equations.push(eq);
    }
};

/**
 * Add equations. Same as .addEquation, but this time the argument is an array of Equations
 *
 * @method addEquations
 * @param {Array} eqs
 */
Solver.prototype.addEquations = function(eqs){
    for(var i=0, N=eqs.length; i!==N; i++){
        var eq = eqs[i];
        if(eq.enabled){
            this.equations.push(eq);
        }
    }
};

/**
 * Remove an equation.
 *
 * @method removeEquation
 * @param {Equation} eq
 */
Solver.prototype.removeEquation = function(eq){
    var i = this.equations.indexOf(eq);
    if(i !== -1){
        this.equations.splice(i,1);
    }
};

/**
 * Remove all currently added equations.
 *
 * @method removeAllEquations
 */
Solver.prototype.removeAllEquations = function(){
    this.equations.length=0;
};

/**
 * Gauss-Seidel solver.
 * @property GS
 * @type {Number}
 * @static
 */
Solver.GS = 1;