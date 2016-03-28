var Shape = require(__dirname + '/../../src/shapes/Shape');
var Material = require(__dirname + '/../../src/material/Material');

exports.construct = function(test){
    var material = new Material();
    var shape = new Shape({
        material: material
    });
    test.equal(shape.material, material);
    test.done();
};

exports.pointTest = function(test){
    var shape = new Shape();
    test.equal(shape.pointTest([0, 0]), false);
    test.done();
};
