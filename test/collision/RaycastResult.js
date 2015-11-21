var vec2 = require("../../src/math/vec2");
var Circle = require('../../src/shapes/Circle');
var Plane = require('../../src/shapes/Plane');
var Ray = require('../../src/collision/Ray');
var Body = require('../../src/objects/Body');
var RaycastResult = require('../../src/collision/RaycastResult');
var Heightfield = require('../../src/shapes/Heightfield');

module.exports = {
	construct: function(test){
		var result = new RaycastResult();
		test.done();
	},
	reset: function(test){
		var result = new RaycastResult();
		var result2 = new RaycastResult();
		result.normal[0] = 1;
		result.fraction = 1;
		result.shape = new Plane();
		result.body = new Body();
		result.faceIndex = 123;
		result.reset();
		test.deepEqual(result, result2);
		test.done();
	},
	getHitDistance: function(test){
		var result = new RaycastResult();
		var plane = new Plane();
		var ray = new Ray({
			from: [0,2],
			to: [0,-2]
		});
		plane.raycast(result, ray, [0,0], 0);
		test.equal(result.getHitDistance(ray), 2);
		test.done();
	},
	hasHit: function(test){
		var result = new RaycastResult();
		test.ok(!result.hasHit());
		test.done();
	},
	getHitPoint: function(test){
		var result = new RaycastResult();
		var plane = new Plane();
		var ray = new Ray({
			from: [0,2],
			to: [0,-2]
		});
		plane.raycast(result, ray, [0,0], 0);
		var point = [1, 2];
		result.getHitPoint(point, ray);
		test.deepEqual(point, [0,0]);
		test.done();
	},
	stop: function(test){
		var result = new RaycastResult();
		result.stop();
		test.ok(result.isStopped);
		test.done();
	}
};
