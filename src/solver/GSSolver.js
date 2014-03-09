var vec2 = require('../math/vec2')
,   Solver = require('./Solver')
,   Utils = require('../utils/Utils')
,   FrictionEquation = require('../equations/FrictionEquation')

module.exports = GSSolver;

/**
 * Iterative Gauss-Seidel constraint equation solver.
 *
 * @class GSSolver
 * @constructor
 * @extends Solver
 * @param {Object} [options]
 * @param {Number} options.iterations
 * @param {Number} options.timeStep
 * @param {Number} options.stiffness
 * @param {Number} options.relaxation
 * @param {Number} options.tolerance
 */
function GSSolver(options){
    Solver.call(this,options,Solver.GS);
    options = options || {};

    /**
     * The number of iterations to do when solving. More gives better results, but is more expensive.
     * @property iterations
     * @type {Number}
     */
    this.iterations = options.iterations || 10;

    /**
     * The error tolerance. If the total error is below this limit, the solver will stop. Set to zero for as good solution as possible.
     * @property tolerance
     * @type {Number}
     */
    this.tolerance = options.tolerance || 0;

    this.debug = options.debug || false;
    this.arrayStep = 30;
    this.lambda = new Utils.ARRAY_TYPE(this.arrayStep);
    this.Bs =     new Utils.ARRAY_TYPE(this.arrayStep);
    this.invCs =  new Utils.ARRAY_TYPE(this.arrayStep);

    /**
     * Whether to use .stiffness and .relaxation parameters from the Solver instead of each Equation individually.
     * @type {Boolean}
     * @property useGlobalEquationParameters
     */
    this.useGlobalEquationParameters = true;

    /**
     * Global equation stiffness. Larger number gives harder contacts, etc, but may also be more expensive to compute, or it will make your simulation explode.
     * @property stiffness
     * @type {Number}
     */
    this.stiffness = 1e6;

    /**
     * Global equation relaxation. This is the number of timesteps required for a constraint to be resolved. Larger number will give softer contacts. Set to around 3 or 4 for good enough results.
     * @property relaxation
     * @type {Number}
     */
    this.relaxation = 4;

    /**
     * Set to true to set all right hand side terms to zero when solving. Can be handy for a few applications.
     * @property useZeroRHS
     * @type {Boolean}
     */
    this.useZeroRHS = false;

    this.useNormalForceForFriction = false;

    /**
     * Number of friction iterations to skip. If .skipFrictionIterations=2, then no FrictionEquations will be iterated until the third iteration.
     * @property skipFrictionIterations
     * @type {Number}
     */
    this.skipFrictionIterations = 0;
};
GSSolver.prototype = new Solver();

function setArrayZero(array){
    for(var i=0; i!==array.length; i++){
        array[i] = 0.0;
    }
}

/**
 * Solve the system of equations
 * @method solve
 * @param  {Number}  h       Time step
 * @param  {World}   world    World to solve
 */
GSSolver.prototype.solve = function(h,world){

    this.sortEquations();

    var iter = 0,
        maxIter = this.iterations,
        skipFrictionIter = this.skipFrictionIterations,
        tolSquared = this.tolerance*this.tolerance,
        equations = this.equations,
        Neq = equations.length,
        bodies = world.bodies,
        Nbodies = world.bodies.length,
        d = this.relaxation,
        k = this.stiffness,
        eps = 4.0 / (h * h * k * (1 + 4 * d)),
        a = 4.0 / (h * (1 + 4 * d)),
        b = (4.0 * d) / (1 + 4 * d),
        useGlobalParams = this.useGlobalEquationParameters,
        add = vec2.add,
        set = vec2.set,
        useZeroRHS = this.useZeroRHS,
        lambda = this.lambda;

    // Things that does not change during iteration can be computed once
    if(lambda.length < Neq){
        lambda = this.lambda =  new Utils.ARRAY_TYPE(Neq + this.arrayStep);
        this.Bs =               new Utils.ARRAY_TYPE(Neq + this.arrayStep);
        this.invCs =            new Utils.ARRAY_TYPE(Neq + this.arrayStep);
    }
    setArrayZero(lambda);
    var invCs = this.invCs,
        Bs = this.Bs,
        lambda = this.lambda;
    if(!useGlobalParams){
        for(var i=0, c; c = equations[i]; i++){
            c.updateSpookParams(h);
            Bs[i] =     c.computeB(c.a,c.b,h);
            invCs[i] =  c.computeInvC(c.eps);
        }
    } else {
        for(var i=0, c; c = equations[i]; i++){
            Bs[i] =     c.computeB(a,b,h);
            invCs[i] =  c.computeInvC(eps);
        }
    }

    var q, B, c, deltalambdaTot,i,j;

    if(Neq !== 0){

        // Reset vlambda
        for(i=0; i!==Nbodies; i++){
            bodies[i].resetConstraintVelocity();
        }

        // Iterate over equations
        for(iter=0; iter!==maxIter; iter++){

            // Accumulate the total error for each iteration.
            deltalambdaTot = 0.0;

            for(j=0; j!==Neq; j++){
                c = equations[j];

                if(c instanceof FrictionEquation && iter < skipFrictionIter)
                    continue;

                var _eps = useGlobalParams ? eps : c.eps;

                var deltalambda = GSSolver.iterateEquation(j,c,_eps,Bs,invCs,lambda,useZeroRHS,h,iter,skipFrictionIter,this.useNormalForceForFriction);
                deltalambdaTot += Math.abs(deltalambda);
            }

            // If the total error is small enough - stop iterate
            if(deltalambdaTot*deltalambdaTot <= tolSquared) break;
        }

        // Add result to velocity
        for(i=0; i!==Nbodies; i++){
            bodies[i].addConstraintVelocity();
        }
    }
};

GSSolver.iterateEquation = function(j,eq,eps,Bs,invCs,lambda,useZeroRHS,dt,iter,skipFrictionIter,useNormal){
    // Compute iteration
    var B = Bs[j],
        invC = invCs[j],
        lambdaj = lambda[j],
        GWlambda = eq.computeGWlambda();

    if(useNormal && eq instanceof FrictionEquation && iter == skipFrictionIter){
        // Rescale the max friction force according to the normal force
        eq.maxForce =  eq.contactEquation.multiplier * eq.frictionCoefficient * dt;
        eq.minForce = -eq.contactEquation.multiplier * eq.frictionCoefficient * dt;
    }

    var maxForce = eq.maxForce,
        minForce = eq.minForce;

    if(useZeroRHS) B = 0;

    var deltalambda = invC * ( B - GWlambda - eps * lambdaj );

    // Clamp if we are not within the min/max interval
    var lambdaj_plus_deltalambda = lambdaj + deltalambda;
    if(lambdaj_plus_deltalambda < minForce*dt){
        deltalambda = minForce*dt - lambdaj;
    } else if(lambdaj_plus_deltalambda > maxForce*dt){
        deltalambda = maxForce*dt - lambdaj;
    }
    lambda[j] += deltalambda;
    eq.multiplier = lambda[j] / dt;
    eq.addToWlambda(deltalambda);

    return deltalambda;
};
