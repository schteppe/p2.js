var Capsule = require(__dirname + '/../../src/shapes/Capsule')
,   vec2 = require(__dirname + '/../../src/math/vec2');

exports.construct = function(test){
    var capsule = new Capsule(2,3);
    test.equal(capsule.length, 2);
    test.equal(capsule.radius, 3);
    test.deepEqual(capsule.points, [vec2.fromValues(-1, 0), vec2.fromValues(1, 0)]);
    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

exports.conputeMomentOfInertia = function(test){
    // STUB
    test.done();
};
