var GSSolver = require(__dirname + '/../../src/solver/GSSolver');
var World = require(__dirname + '/../../src/world/World');
var Body = require(__dirname + '/../../src/objects/Body');
var DistanceConstraint = require(__dirname + '/../../src/constraints/DistanceConstraint');

exports.construct = function(test){
    var solver = new GSSolver();
    test.done();
};

exports.solve = function(test){
    var world = new World();
    var bodyA = new Body({
        mass: 1
    });
    var bodyB = new Body({
        mass: 1,
        position:[0,1.001]
    });
    var constraint = new DistanceConstraint(bodyA, bodyB, {
        distance:1
    });
    world.addConstraint(constraint);
    var solver = new GSSolver({
        iterations: 10
    });
    solver.addEquations(constraint.equations);
    solver.solve(1/60, world);
    test.equal(solver.usedIterations, solver.iterations, 'should use all iterations if tolerance is zero');
    solver.tolerance = 1;
    solver.solve(1/60, world);
    test.ok(solver.usedIterations < 10, 'should use less iterations if tolerance is nonzero');
    test.done();
};

