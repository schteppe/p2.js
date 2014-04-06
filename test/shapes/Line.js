var Line = require(__dirname + '/../../src/shapes/Line');

exports.construct = function(test){
    var line = new Line(2);
    test.equal(line.length, 2);

    line = new Line();
    test.equal(line.length, 1);

    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

