var Circle = require(__dirname + '/../../src/shapes/Circle');

exports.construct = function(test){
    var circle = new Circle(2);
    test.equal(circle.radius, 2);
    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

