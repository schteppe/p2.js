var Capsule = require(__dirname + '/../../src/shapes/Capsule');

exports.construct = function(test){
    var capsule = new Capsule(2,3);
    test.equal(capsule.length, 2);
    test.equal(capsule.radius, 3);
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

