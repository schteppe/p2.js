var Plane = require(__dirname + '/../../src/shapes/Plane');

exports.construct = function(test){
    var plane = new Plane();
    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

exports.computeMomentOfInertia = function(test){
    test.equal((new Plane()).computeMomentOfInertia(), 0);
    test.done();
};

exports.updateBoundingRadius = function(test){
    // STUB
    test.done();
};

