var Rectangle = require(__dirname + '/../../src/shapes/Rectangle');

exports.construct = function(test){
    var rect = new Rectangle();
    test.equal(rect.width,1);
    test.equal(rect.height,1);
    var rect = new Rectangle(2,3);
    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

exports.computeMomentOfInertia = function(test){
    // STUB
    test.done();
};

exports.updateBoundingRadius = function(test){
    // STUB
    test.done();
};

