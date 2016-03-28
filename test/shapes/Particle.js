var Particle = require(__dirname + '/../../src/shapes/Particle');

exports.construct = function(test){
    var particle = new Particle();
    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

exports.pointTest = function(test){
    var shape = new Particle();
    test.equal(shape.pointTest([0, 0]), false);
    test.equal(shape.pointTest([0, 1]), false);
    test.done();
};