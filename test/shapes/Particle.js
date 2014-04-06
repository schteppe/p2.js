var Particle = require(__dirname + '/../../src/shapes/Particle');

exports.construct = function(test){
    var particle = new Particle();
    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

