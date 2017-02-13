var Line = require(__dirname + '/../../src/shapes/Line')
,   Ray =   require(__dirname + '/../../src/collision/Ray')
,   RaycastResult =   require(__dirname + '/../../src/collision/RaycastResult');

exports.construct = function(test){
    var line = new Line({ length: 2 });
    test.equal(line.length, 2);

    line = new Line();
    test.equal(line.length, 1);

    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

exports.raycast = function(test){
    var ray = new Ray({
		mode: Ray.CLOSEST,
        from: [0,0],
        to: [10,0]
    });

    var shape = new Line({ length: 1 });
    var result = new RaycastResult();
    shape.raycast(result, ray, [1,0], Math.PI / 2);

    test.done();
};