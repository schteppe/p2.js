var NaiveBroadphase = require(__dirname + '/../../src/collision/NaiveBroadphase');
var Broadphase = require(__dirname + '/../../src/collision/Broadphase');

exports.construct = function(test){
    var broadphase = new NaiveBroadphase();
    test.equal(broadphase.type, Broadphase.NAIVE);
    test.done();
};

exports.getCollisionPairs = function(test){
    // STUB
    test.done();
};

