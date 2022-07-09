var Circle = require(__dirname + '/../../src/shapes/Circle');
var AABB = require(__dirname + '/../../src/collision/AABB');
var Ray = require(__dirname + '/../../src/collision/Ray');
var RaycastResult = require(__dirname + '/../../src/collision/RaycastResult');

exports.construct = function(test){
    var circle = new Circle({ radius: 2 });
    test.equal(circle.radius, 2);
    test.done();
};

exports.computeAABB = function(test){
    var aabb = new AABB(),
        offset = [2,3];

    var c = new Circle({ radius: 1 });
    c.computeAABB(aabb,offset,Math.PI / 2);
    test.equal(aabb.lowerBound[0],-1 + offset[0]);
    test.equal(aabb.lowerBound[1],-1 + offset[1]);
    test.equal(aabb.upperBound[0], 1 + offset[0]);
    test.equal(aabb.upperBound[1], 1 + offset[1]);

    test.done();
};

exports.raycast = function(test){
    var ray = new Ray({
		mode: Ray.CLOSEST,
        from: [-10,0],
        to: [10,0]
    });

    var shape = new Circle({ radius: 0.5 });
    var result = new RaycastResult();
    shape.raycast(result, ray, [0,0], 0);
    test.equal(result.normal[0], -1);
    test.equal(result.normal[1], 0);

    test.done();
};

