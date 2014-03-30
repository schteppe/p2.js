module.exports = SpookParams;

/**
 * Manages computation of SPOOK parameters
 * @class SpookParams
 * @constructor
 */
function SpookParams(){

    /**
     * The stiffness of the equation. Typically chosen to a large number (~1e7), but can be chosen somewhat freely to get a stable simulation.
     * @property stiffness
     * @type {Number}
     */
    this.stiffness = 1e6;

    /**
     * The number of time steps needed to stabilize the constraint equation. Typically between 3 and 5 time steps.
     * @property relaxation
     * @type {Number}
     */
    this.relaxation = 4;

    /**
     * Constant for computing the RHS.
     * @property {Number} a
     */
    this.a = 0;

    /**
     * Constant for computing the RHS.
     * @property {Number} b
     */
    this.b = 0;

    /**
     * Constant for computing the RHS.
     * @property {Number} epsilon
     */
    this.epsilon = 0;

    /**
     * Constant for computing the RHS. Should be set to the time step of the simulation.
     * @property {Number} timeStep
     */
    this.timeStep = 0;
}
SpookParams.prototype.constructor = SpookParams;

/**
 * Compute SPOOK parameters .a, .b and .epsilon according to the given parameters. Also sets the properties .stiffness, .relaxation and .timestep. See equations 9, 10 and 11 in the <a href="http://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf">SPOOK notes</a>.
 * @method setParameters
 * @param  {number} stiffness
 * @param  {number} relaxation
 * @param  {number} timeStep
 */
SpookParams.prototype.setParameters = function(stiffness, relaxation, timeStep){
    var k = stiffness,
        d = relaxation,
        h = timeStep;

    this.a = 4.0 / (h * (1 + 4 * d));
    this.b = (4.0 * d) / (1 + 4 * d);
    this.epsilon = 4.0 / (h * h * k * (1 + 4 * d));

    this.timeStep = timeStep;
    this.stiffness = stiffness;
    this.relaxation = relaxation;
};

SpookParams.prototype.setStiffness = function(stiffness){
    this.set(stiffness, this.relaxation, this.timeStep);
};

SpookParams.prototype.setRelaxation = function(relaxation){
    this.set(this.stiffness, relaxation, this.timeStep);
};