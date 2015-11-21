var vec2 = require("../../src/math/vec2");
var Circle = require('../../src/shapes/Circle');
var Plane = require('../../src/shapes/Plane');
var Ray = require('../../src/collision/Ray');
var Body = require('../../src/objects/Body');
var RaycastResult = require('../../src/collision/RaycastResult');
var AABB = require('../../src/collision/AABB');
var Heightfield = require('../../src/shapes/Heightfield');

module.exports = {
	construct: function(test){
		var ray = new Ray({
			from: [4,3],
			to: [1,2],
			skipBackfaces: true,
			collisionMask: 4,
			collisionGroup: 4|2,
			mode: Ray.ALL
		});
		test.equal(ray.from[0], 4);
		test.equal(ray.from[1], 3);
		test.equal(ray.to[0], 1);
		test.equal(ray.to[1], 2);
		test.equal(ray.skipBackfaces, true);
		test.equal(ray.collisionMask, 4);
		test.equal(ray.collisionGroup, 4|2);
		test.equal(ray.mode, Ray.ALL);
		test.done();
	},
	update: function(test){
		var ray = new Ray({
			from: [0,0],
			to: [1,0]
		});
		test.equal(ray.direction[0], 1);
		test.equal(ray.direction[1], 0);
		test.equal(ray.length, 1);

		ray.to[0] = 0;
		ray.to[1] = 2;
		ray.update();
		test.equal(ray.direction[0], 0);
		test.equal(ray.direction[1], 1);
		test.equal(ray.length, 2);

		test.done();
	},
	getAABB: function(test){
		var ray = new Ray({
			from: [0,0],
			to: [1,1]
		});
		var aabb = new AABB();
		ray.getAABB(aabb);
		test.deepEqual(aabb, new AABB({ lowerBound: [0,0], upperBound: [1,1] }));
		test.done();
	}
};
