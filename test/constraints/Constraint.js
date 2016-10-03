var Body = require(__dirname + '/../../src/objects/Body');
var World = require(__dirname + '/../../src/world/World');
var Constraint = require(__dirname + '/../../src/constraints/Constraint');
var DistanceConstraint = require(__dirname + '/../../src/constraints/DistanceConstraint');

exports.construct = function(test){
    var constraint = new Constraint();
    test.done();
};

exports.update = function(test){
    // STUB
    test.done();
};

exports.setStiffness = function(test){
	// STUB
	test.done();
};

exports.setRelaxation = function(test){
	// STUB
	test.done();
};

exports.setMaxBias = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var world = new World();
    world.addBody(bodyA);
    world.addBody(bodyB);
	var constraint = new DistanceConstraint(bodyA, bodyB);

    constraint.setMaxBias(1);
    test.equal(constraint.equations[0].maxBias, 1);

	test.done();
};