var vec2 = require('../math/vec2');

module.exports = AABB;

/**
 * Axis aligned bounding box class.
 * @class AABB
 * @constructor
 * @param {Object} options
 * @param {Array} upperBound
 * @param {Array} lowerBound
 */
function AABB(options){

    /**
     * The lower bound of the bounding box.
     * @property lowerBound
     * @type {Array}
     */
    this.lowerBound = vec2.create();
    if(options.lowerBound) vec2.copy(options.lowerBound, this.lowerBound);

    /**
     * The upper bound of the bounding box.
     * @property upperBound
     * @type {Array}
     */
    this.upperBound = vec2.create();
    if(options.upperBound) vec2.copy(options.upperBound, this.upperBound);
}
