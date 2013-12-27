var AABB = require('../src/collision/AABB')
,   vec2 = require('../src/math/vec2')

exports.construct = function(test){
    new AABB();
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
