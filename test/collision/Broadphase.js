var Broadphase = require(__dirname + '/../../src/collision/Broadphase');

exports.construct = function(test){
    var b = new Broadphase(Broadphase.NAIVE);
    test.equal(b.type, Broadphase.NAIVE);
    test.done();
};

exports.boundingRadiusCheck = function(test){
    // STUB
    test.done();
};

exports.boundingRadiusCheck = function(test){
    // STUB
    test.done();
};

exports.canCollide = function(test){
    // STUB
    test.done();
};

exports.getCollisionPairs = function(test){
    // STUB
    test.done();
};

exports.setWorld = function(test){
    // STUB
    test.done();
};

