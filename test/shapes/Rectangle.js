var Rectangle = require(__dirname + '/../../src/shapes/Rectangle');
var Ray =   require(__dirname + '/../../src/collision/Ray');
var RaycastResult =   require(__dirname + '/../../src/collision/RaycastResult');
var AABB = require(__dirname + '/../../src/collision/AABB');

exports.construct = function(test){
    var rect = new Rectangle();
    test.equal(rect.width,1);
    test.equal(rect.height,1);
    var rect = new Rectangle(2,3);
    test.done();
};

exports.computeAABB = function(test){
    var aabb = new AABB(),
        offset = [2,3];

    var c = new Rectangle(1,2);
    c.computeAABB(aabb,offset,Math.PI / 2);
    test.equal(aabb.lowerBound[0], -1   + offset[0]);
    test.equal(aabb.lowerBound[1], -0.5 + offset[1]);
    test.equal(aabb.upperBound[0],  1   + offset[0]);
    test.equal(aabb.upperBound[1],  0.5 + offset[1]);

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

exports.raycast = function(test){
    var ray = new Ray({
        mode: Ray.CLOSEST,
        from: [0,0],
        to: [10,0]
    });

    var shape = new Rectangle(1,1);
    var result = new RaycastResult();
    shape.raycast(result, ray, [1,0], Math.PI / 2);

    test.done();
};