var Body = require('../src/objects/Body')
,   vec2 = require('../src/math/vec2')

exports.construct = function(test){
    new Body();
    test.done();
};

exports.fromConcave = function(test){
    var b = new Body();
    test.ok(b.fromPolygon( [[-1, 1],
                            [-1, 0],
                            [1, 0],
                            [1, 1],
                            [0.5, 0.5]]));

    test.ok(b.shapes.length > 0);

    test.done();
};
