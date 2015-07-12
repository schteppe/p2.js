var Plane = require(__dirname + '/../../src/shapes/Plane');
var AABB = require(__dirname + '/../../src/collision/AABB');
var Ray =   require(__dirname + '/../../src/collision/Ray');
var RaycastResult =   require(__dirname + '/../../src/collision/RaycastResult');

exports.construct = function(test){
    var plane = new Plane();
    test.done();
};

exports.computeAABB = function(test){
	var plane = new Plane();
	var aabb = new AABB();
    plane.computeAABB(aabb, [0,0], 0);
    test.done();
};

exports.computeMomentOfInertia = function(test){
    test.equal((new Plane()).computeMomentOfInertia(), 0);
    test.done();
};

exports.updateBoundingRadius = function(test){
	var plane = new Plane();
    plane.updateBoundingRadius();
    test.ok(plane.boundingRadius > 0);
    test.done();
};

exports.raycast = function(test){
    var ray = new Ray({
        mode: Ray.CLOSEST,
        from: [0,0],
        to: [10,0]
    });

    var shape = new Plane();
    var result = new RaycastResult();
    shape.raycast(result, ray, [1,0], Math.PI / 2);

    test.done();
};