var AABB = require(__dirname + '/../../src/collision/AABB');
var vec2 = require(__dirname + '/../../src/math/vec2');

exports.construct = function(test){
    var aabb = new AABB({
        lowerBound: [-1, -2],
        upperBound: [1, 2]
    });
    test.equal(aabb.lowerBound[0], -1);
    test.equal(aabb.lowerBound[1], -2);
    test.equal(aabb.upperBound[0], 1);
    test.equal(aabb.upperBound[1], 2);
    test.done();
};

exports.copy = function(test){
    var aabb = new AABB({
        lowerBound: [-1, -2],
        upperBound: [1, 2]
    });
    var aabb2 = new AABB();
    aabb2.copy(aabb);
    test.equal(aabb2.lowerBound[0], -1);
    test.equal(aabb2.lowerBound[1], -2);
    test.equal(aabb2.upperBound[0], 1);
    test.equal(aabb2.upperBound[1], 2);
    test.done();
};

exports.extend = function(test){
    // STUB
    test.done();
};

exports.overlaps = function(test){
    var a = new AABB(),
        b = new AABB();

    // Same aabb
    vec2.set(a.lowerBound, -1, -1);
    vec2.set(a.upperBound,  1,  1);
    vec2.set(b.lowerBound, -1, -1);
    vec2.set(b.upperBound,  1,  1);
    test.ok(a.overlaps(b),'should detect overlap of self');

    // Corner overlaps
    vec2.set(b.lowerBound,  1,  1);
    vec2.set(b.upperBound,  2,  2);
    test.ok(a.overlaps(b),'should detect corner overlap');

    // Separate
    vec2.set(b.lowerBound,  1.1,  1.1);
    test.ok(!a.overlaps(b),'should detect separated');

    // fully inside
    vec2.set(b.lowerBound, -0.5, -0.5);
    vec2.set(b.upperBound,  0.5,  0.5);
    test.ok(a.overlaps(b),'should detect if aabb is fully inside other aabb');
    vec2.set(b.lowerBound, -1.5, -1.5);
    vec2.set(b.upperBound,  1.5,  1.5);
    test.ok(a.overlaps(b),'should detect if aabb is fully inside other aabb');

    // Translated
    vec2.set(b.lowerBound, -3, -0.5);
    vec2.set(b.upperBound, -2,  0.5);
    test.ok(!a.overlaps(b),'should detect translated');

    test.done();
};

exports.containsPoint = function(test){
    var aabb = new AABB({
        lowerBound: [-1, -1],
        upperBound: [1, 1]
    });
    test.ok(aabb.containsPoint([0,0]));
    test.ok(aabb.containsPoint([1,1]));
    test.ok(aabb.containsPoint([-1,-1]));
    test.ok(!aabb.containsPoint([2,2]));
    test.done();
};

exports.overlapsRay = function(test){
    test.done();
};

exports.setFromPoints = function(test){
    var a = new AABB();
    var points = [
        [-1,-1],
        [1, 1],
        [0, 0],
    ];
    var position = [1,1];
    var angle = 0;
    a.setFromPoints(points, position, angle);

    test.equal(a.lowerBound[0], 0);
    test.equal(a.lowerBound[1], 0);
    test.equal(a.upperBound[0], 2);
    test.equal(a.upperBound[1], 2);

    // One point
    a.setFromPoints([[1,2]], [0,0], 0);
    test.equal(a.lowerBound[0], 1);
    test.equal(a.lowerBound[1], 2);
    test.equal(a.upperBound[0], 1);
    test.equal(a.upperBound[1], 2);

    // Rotated 45 degrees
    a.setFromPoints(points, [0,0], Math.PI/4);
    test.ok(Math.abs(a.lowerBound[0]) < 0.01);
    test.ok(Math.abs(a.upperBound[0]) < 0.01);

    test.done();
};

