var Shape = require('./Shape')
,   shallowClone = require('../utils/Utils').shallowClone
,   vec2 = require('../math/vec2');

module.exports = Capsule;

/**
 * Capsule shape.
 * @class Capsule
 * @constructor
 * @extends Shape
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {Number} [options.length=1] The distance between the end points, extends along the X axis.
 * @param {Number} [options.radius=1] Radius of the capsule.
 * @example
 *     var body = new Body({ mass: 1 });
 *     var capsuleShape = new Capsule({
 *         length: 1,
 *         radius: 2
 *     });
 *     body.addShape(capsuleShape);
 */
function Capsule(options){
    options = options ? shallowClone(options) : {};

    /**
     * The distance between the end points.
     * @property {Number} length
     */
    this.length = options.length !== undefined ? options.length : 1;

    /**
     * The radius of the capsule.
     * @property {Number} radius
     */
    this.radius = options.radius !== undefined ? options.radius : 1;

    options.type = Shape.CAPSULE;
    Shape.call(this, options);
}
Capsule.prototype = new Shape();
Capsule.prototype.constructor = Capsule;

/**
 * Compute the mass moment of inertia of the Capsule.
 * @method conputeMomentOfInertia
 * @return {Number}
 * @todo
 */
Capsule.prototype.computeMomentOfInertia = function(){
    // http://www.efunda.com/math/areas/rectangle.cfm
    function boxI(w, h) {
        return w * h * (Math.pow(w, 2) + Math.pow(h, 2)) / 12;
    }
    function semiA(r) {
        return Math.PI * Math.pow(r, 2) / 2;
    }
    // http://www.efunda.com/math/areas/CircleHalf.cfm
    function semiI(r) {
        return ((Math.PI / 4) - (8 / (9 * Math.PI))) * Math.pow(r, 4);
    }
    function semiC(r) {
        return (4 * r) / (3 * Math.PI);
    }
    // https://en.wikipedia.org/wiki/Second_moment_of_area#Parallel_axis_theorem
    function capsuleA(l, r) {
        return l * 2 * r + Math.PI * Math.pow(r, 2);
    }
    function capsuleI(l, r) {
        var d = l / 2 + semiC(r);
        return boxI(l, 2 * r) + 2 * (semiI(r) + semiA(r) * Math.pow(d, 2));
    }
    var r = this.radius,
        l = this.length,
        area = capsuleA(l, r);
    return (area > 0) ? capsuleI(l, r) / area : 0;
};

/**
 * @method updateBoundingRadius
 */
Capsule.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.radius + this.length/2;
};

/**
 * @method updateArea
 */
Capsule.prototype.updateArea = function(){
    this.area = Math.PI * this.radius * this.radius + this.radius * 2 * this.length;
};

var r = vec2.create();

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Capsule.prototype.computeAABB = function(out, position, angle){
    var radius = this.radius;

    // Compute center position of one of the the circles, world oriented, but with local offset
    vec2.set(r,this.length / 2,0);
    if(angle !== 0){
        vec2.rotate(r,r,angle);
    }

    // Get bounds
    vec2.set(out.upperBound,  Math.max(r[0]+radius, -r[0]+radius),
                              Math.max(r[1]+radius, -r[1]+radius));
    vec2.set(out.lowerBound,  Math.min(r[0]-radius, -r[0]-radius),
                              Math.min(r[1]-radius, -r[1]-radius));

    // Add offset
    vec2.add(out.lowerBound, out.lowerBound, position);
    vec2.add(out.upperBound, out.upperBound, position);
};

var intersectCapsule_hitPointWorld = vec2.create();
var intersectCapsule_normal = vec2.create();
var intersectCapsule_l0 = vec2.create();
var intersectCapsule_l1 = vec2.create();
var intersectCapsule_unit_y = vec2.fromValues(0,1);

/**
 * @method raycast
 * @param  {RaycastResult} result
 * @param  {Ray} ray
 * @param  {array} position
 * @param  {number} angle
 */
Capsule.prototype.raycast = function(result, ray, position, angle){
    var from = ray.from;
    var to = ray.to;

    var hitPointWorld = intersectCapsule_hitPointWorld;
    var normal = intersectCapsule_normal;
    var l0 = intersectCapsule_l0;
    var l1 = intersectCapsule_l1;

    // The sides
    var halfLen = this.length / 2;
    for(var i=0; i<2; i++){

        // get start and end of the line
        var y = this.radius * (i*2-1);
        vec2.set(l0, -halfLen, y);
        vec2.set(l1, halfLen, y);
        vec2.toGlobalFrame(l0, l0, position, angle);
        vec2.toGlobalFrame(l1, l1, position, angle);

        var delta = vec2.getLineSegmentsIntersectionFraction(from, to, l0, l1);
        if(delta >= 0){
            vec2.rotate(normal, intersectCapsule_unit_y, angle);
            vec2.scale(normal, normal, (i*2-1));
            ray.reportIntersection(result, delta, normal, -1);
            if(result.shouldStop(ray)){
                return;
            }
        }
    }

    // Circles
    var diagonalLengthSquared = Math.pow(this.radius, 2) + Math.pow(halfLen, 2);
    for(var i=0; i<2; i++){
        vec2.set(l0, halfLen * (i*2-1), 0);
        vec2.toGlobalFrame(l0, l0, position, angle);

        var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
        var b = 2 * ((to[0] - from[0]) * (from[0] - l0[0]) + (to[1] - from[1]) * (from[1] - l0[1]));
        var c = Math.pow(from[0] - l0[0], 2) + Math.pow(from[1] - l0[1], 2) - Math.pow(this.radius, 2);
        var delta = Math.pow(b, 2) - 4 * a * c;

        if(delta < 0){
            // No intersection
            continue;

        } else if(delta === 0){
            // single intersection point
            vec2.lerp(hitPointWorld, from, to, delta);

            if(vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared){
                vec2.subtract(normal, hitPointWorld, l0);
                vec2.normalize(normal,normal);
                ray.reportIntersection(result, delta, normal, -1);
                if(result.shouldStop(ray)){
                    return;
                }
            }

        } else {
            var sqrtDelta = Math.sqrt(delta);
            var inv2a = 1 / (2 * a);
            var d1 = (- b - sqrtDelta) * inv2a;
            var d2 = (- b + sqrtDelta) * inv2a;

            if(d1 >= 0 && d1 <= 1){
                vec2.lerp(hitPointWorld, from, to, d1);
                if(vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared){
                    vec2.subtract(normal, hitPointWorld, l0);
                    vec2.normalize(normal,normal);
                    ray.reportIntersection(result, d1, normal, -1);
                    if(result.shouldStop(ray)){
                        return;
                    }
                }
            }

            if(d2 >= 0 && d2 <= 1){
                vec2.lerp(hitPointWorld, from, to, d2);
                if(vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared){
                    vec2.subtract(normal, hitPointWorld, l0);
                    vec2.normalize(normal,normal);
                    ray.reportIntersection(result, d2, normal, -1);
                    if(result.shouldStop(ray)){
                        return;
                    }
                }
            }
        }
    }
};

Capsule.prototype.pointTest = function(localPoint){
    var radius = this.radius;
    var halfLength = this.length * 0.5;

    if((Math.abs(localPoint[0]) <= halfLength && Math.abs(localPoint[1]) <= radius)){
        return true;
    }

    if(Math.pow(localPoint[0] - halfLength, 2) + Math.pow(localPoint[1], 2) <= radius * radius){
        return true;
    }

    if(Math.pow(localPoint[0] + halfLength, 2) + Math.pow(localPoint[1], 2) <= radius * radius){
        return true;
    }

    return false;
};
