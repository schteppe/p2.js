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
 *     var body = new Body({ mass: 1 });
 *     var boxShape = new Box({
 *         width: 2,
 *         height: 1
 *     });
 *     body.addShape(boxShape);
 */
function Box(options){
    options = options || {};

    /**
     * Total width of the box
     * @property width
     * @type {Number}
     */
    var width = this.width = options.width !== undefined ? options.width : 1;

    /**
     * Total height of the box
     * @property height
     * @type {Number}
     */
    var height = this.height = options.height !== undefined ? options.height : 1;

    var verts = [
        vec2.fromValues(-width/2, -height/2),
        vec2.fromValues( width/2, -height/2),
        vec2.fromValues( width/2,  height/2),
        vec2.fromValues(-width/2,  height/2)
    ];

    var convexOptions = shallowClone(options);
    convexOptions.vertices = verts;
    convexOptions.type = Shape.BOX;
    Convex.call(this, convexOptions);
}
Box.prototype = new Convex();
Box.prototype.constructor = Box;

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 * @return {Number}
 */
Box.prototype.computeMomentOfInertia = function(){
    var w = this.width,
        h = this.height;
    return (h*h + w*w) / 12;
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

Box.prototype.pointTest = function(localPoint){
    return Math.abs(localPoint[0]) <= this.width * 0.5 && Math.abs(localPoint[1]) <= this.height * 0.5;
};
