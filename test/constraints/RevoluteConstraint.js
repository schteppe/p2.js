var RevoluteConstraint = require(__dirname + '/../../src/constraints/RevoluteConstraint');
var Body = require(__dirname + '/../../src/objects/Body');
var World = require(__dirname + '/../../src/world/World');

exports.construct = {
    worldPivot: function(test){
        var world = new World();

        var bodyA = new Body({ mass: 1, position: [-1, 0] });
        world.addBody(bodyA);

        var bodyB = new Body({ mass: 1, position: [1, 0] });
        world.addBody(bodyB);

        var constraint = new RevoluteConstraint(bodyA, bodyB, {
            worldPivot: [0, 0]
        });
        world.addConstraint(constraint);

        test.deepEqual(constraint.pivotA, [1,0]);
        test.deepEqual(constraint.pivotB, [-1,0]);

        test.done();
    },

    localPivots: function(test){
        var world = new World();

        var bodyA = new Body({ mass: 1, position: [-1, 0] });
        world.addBody(bodyA);

        var bodyB = new Body({ mass: 1, position: [1, 0] });
        world.addBody(bodyB);

        var constraint = new RevoluteConstraint(bodyA, bodyB, {
            localPivotA: [1, 0],
            localPivotB: [-1, 0]
        });
        world.addConstraint(constraint);

        test.deepEqual(constraint.pivotA, [1,0]);
        test.deepEqual(constraint.pivotB, [-1,0]);

        test.done();
    }
};

exports.motorEnabled = function(test){
    var world = new World();
    var bodyA = new Body({ mass: 1, position: [-1, 0] });
    world.addBody(bodyA);
    var bodyB = new Body({ mass: 1, position: [1, 0] });
    world.addBody(bodyB);
    var constraint = new RevoluteConstraint(bodyA, bodyB);
    world.addConstraint(constraint);

    constraint.motorEnabled = true;
    test.ok(constraint.motorEnabled);

    test.done();
};

exports.motorSpeed = function(test){
    var world = new World();
    var bodyA = new Body({ mass: 1, position: [-1, 0] });
    world.addBody(bodyA);
    var bodyB = new Body({ mass: 1, position: [1, 0] });
    world.addBody(bodyB);
    var constraint = new RevoluteConstraint(bodyA, bodyB);
    world.addConstraint(constraint);

    constraint.motorSpeed = 1;
    test.equal(constraint.motorSpeed, 1);

    test.done();
};

exports.motorMaxForce = function(test){
    var world = new World();
    var bodyA = new Body({ mass: 1, position: [-1, 0] });
    world.addBody(bodyA);
    var bodyB = new Body({ mass: 1, position: [1, 0] });
    world.addBody(bodyB);
    var constraint = new RevoluteConstraint(bodyA, bodyB);
    world.addConstraint(constraint);

    constraint.motorMaxForce = 1;
    test.equal(constraint.motorMaxForce, 1);

    test.done();
};

