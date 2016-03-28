var Shape = require(__dirname + '/../../src/shapes/Shape');

exports.construct = function(test){
    var shape = new Shape();
    test.done();
};

exports.pointTest = function(test){
    var shape = new Shape();
    test.equal(shape.pointTest([0, 0]), false);
    test.done();
};
