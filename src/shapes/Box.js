var vec2 = require('../math/vec2')
,   Shape = require('./Shape')
,   shallowClone = require('../utils/Utils').shallowClone
,   Convex = require('./Convex');

module.exports = Box;

/**
 * Box shape class.
 * @class Box
 * @constructor
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {Number} [options.width=1] Total width of the box
 * @param {Number} [options.height=1] Total height of the box
 * @extends Convex
 * @example
 *     var boxShape = new Box({
 *         width: 2,
 *         height: 1
 *     });
 *     body.addShape(boxShape);
 */
function Box(options){
    if(typeof(arguments[0]) === 'number' && typeof(arguments[1]) === 'number'){
        options = {
            width: arguments[0],
            height: arguments[1]
        };
        console.warn('The Rectangle has been renamed to Box and its constructor signature has changed. Please use the following format: new Box({ width: 1, height: 1, ... })');
    }
    options = options || {};

    /**
     * Total width of the box
     * @property width
     * @type {Number}
     */
    var width = this.width = options.width || 1;

    /**
     * Total height of the box
     * @property height
     * @type {Number}
     */
    var height = this.height = options.height || 1;

    var verts = [
        vec2.fromValues(-width/2, -height/2),
        vec2.fromValues( width/2, -height/2),
        vec2.fromValues( width/2,  height/2),
        vec2.fromValues(-width/2,  height/2)
    ];
    var axes = [
        vec2.fromValues(1, 0),
        vec2.fromValues(0, 1)
    ];

    var convexOptions = shallowClone(options);
    convexOptions.vertices = verts;
    convexOptions.axes = axes;
    convexOptions.type = Shape.BOX;
    Convex.call(this, convexOptions);
}
Box.prototype = new Convex();
Box.prototype.constructor = Box;

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Box.prototype.computeMomentOfInertia = function(mass){
    var w = this.width,
        h = this.height;
    return mass * (h*h + w*w) / 12;
};

/**
 * Update the bounding radius
 * @method updateBoundingRadius
 */
Box.prototype.updateBoundingRadius = function(){
    var w = this.width,
        h = this.height;
    this.boundingRadius = Math.sqrt(w*w + h*h) / 2;
};

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Box.prototype.computeAABB = function(out, position, angle){
    var c = Math.abs(Math.cos(angle)),
        s = Math.abs(Math.sin(angle)),
        w = this.width,
        h = this.height;

    var height = (w * s + h * c) * 0.5;
    var width = (h * s + w * c) * 0.5;

    var l = out.lowerBound;
    var u = out.upperBound;
    var px = position[0];
    var py = position[1];
    l[0] = px - width;
    l[1] = py - height;
    u[0] = px + width;
    u[1] = py + height;
};

Box.prototype.updateArea = function(){
    this.area = this.width * this.height;
};

