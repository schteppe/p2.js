var Body = require(__dirname + '/../../src/objects/Body');
var Circle = require(__dirname + '/../../src/shapes/Circle');
var World = require(__dirname + '/../../src/world/World');
var vec2 = require(__dirname + '/../../src/math/vec2');
var Shape = require(__dirname + '/../../src/shapes/Shape');

exports.construct = function(test){

    // Static via mass=0
    var body = new Body({
        mass : 0,
    });
    test.equal(body.invMass,0);
    test.equal(body.type,Body.STATIC);

    // Setting things via options
    var o = {
        position:[0,1],
        velocity:[1,2],
        force:[3,4],
        angularVelocity:5,
        angularForce:5,
        angle:Math.PI/2
    };
    body = new Body(o);
    test.equal(vec2.distance(body.position, o.position),0);
    test.equal(vec2.distance(body.velocity, o.velocity),0);
    test.equal(vec2.distance(body.force,    o.force   ),0);
    test.equal(body.angle,                  o.angle);
    test.equal(body.angularVelocity,        o.angularVelocity);
    test.equal(body.angularForce,           o.angularForce);

    // id tick
    test.equal(new Body().id+1, new Body().id);

    test.done();
};

exports.addShape = function(test){
    // STUB
    test.done();
};

exports.adjustCenterOfMass = function(test){
    // STUB
    test.done();
};

exports.applyDamping = function(test){
    // STUB
    test.done();
};

exports.applyForce = {
    withPoint: function(test){
        var body = new Body({ mass: 1, position: [2,3] });
        var force = [0,1];
        var point = [1,0];

        body.applyForce(force, point);
        test.equal(body.force[0], 0);
        test.equal(body.force[1], 1);
        test.equal(body.angularForce, 1); // [1,0,0] cross [0,1,0] is [0,0,1]

        test.done();
    },
    withoutPoint: function(test){
        var body = new Body({ mass: 1, position: [2,3] });
        var force = [0,1];

        body.applyForce(force);
        test.equal(body.force[0], 0);
        test.equal(body.force[1], 1);
        test.equal(body.angularForce, 0);

        test.done();
    },
};

exports.applyForceLocal = {
    withPoint: function(test){
        var bodyA = new Body({
            mass: 1,
            position: [2,3],
            angle: Math.PI // rotated 180 degrees
        });
        bodyA.addShape(new Circle(1));
        bodyA.applyForceLocal([-1,0],[0,1]);
        test.ok(bodyA.angularForce > 0);
        test.ok(bodyA.force[0] > 0);
        test.ok(Math.abs(bodyA.force[1]) < 0.001);
        test.done();
    },
    withoutPoint: function(test){
        var bodyA = new Body({
            mass: 1,
            position: [2,3],
            angle: Math.PI // rotated 180 degrees
        });
        bodyA.addShape(new Circle(1));
        bodyA.applyForceLocal([-1,0]);
        test.equal(bodyA.angularForce, 0);
        test.ok(bodyA.force[0] > 0);
        test.ok(Math.abs(bodyA.force[1]) < 0.001);
        test.done();
    }
};

exports.applyImpulse = {
    withPoint: function(test){
        var bodyA = new Body({ mass: 1, position: [2,3] });
        bodyA.addShape(new Circle(1));
        bodyA.applyImpulse([-1,0],[0,1]);
        test.ok(bodyA.angularVelocity !== 0);
        test.ok(bodyA.velocity[0] !== 0);
        test.equal(bodyA.velocity[1], 0);
        test.done();
    },
    withoutPoint: function(test){
        var bodyA = new Body({ mass: 1, position: [2,3] });
        bodyA.addShape(new Circle(1));
        bodyA.applyImpulse([-1,0]);
        test.equal(bodyA.angularVelocity, 0);
        test.ok(bodyA.velocity[0] !== 0);
        test.equal(bodyA.velocity[1], 0);
        test.done();
    }
};

exports.applyImpulseLocal = {
    withPoint: function(test){
        var bodyA = new Body({
            mass: 1,
            position: [2,3],
            angle: Math.PI // rotated 180 degrees
        });
        bodyA.addShape(new Circle(1));
        bodyA.applyImpulseLocal([-1,0],[0,1]);
        test.ok(bodyA.angularVelocity > 0);
        test.ok(bodyA.velocity[0] > 0);
        test.ok(Math.abs(bodyA.velocity[1]) < 0.001);
        test.done();
    },
    withoutPoint: function(test){
        var bodyA = new Body({
            mass: 1,
            position: [2,3],
            angle: Math.PI // rotated 180 degrees
        });
        bodyA.addShape(new Circle(1));
        bodyA.applyImpulseLocal([-1,0]);
        test.equal(bodyA.angularVelocity, 0);
        test.ok(bodyA.velocity[0] > 0);
        test.ok(Math.abs(bodyA.velocity[1]) < 0.001);
        test.done();
    }
};

exports.fromPolygon = function(test){
    var b = new Body();
    test.ok(b.fromPolygon( [[-1, 1],
                            [-1, 0],
                            [1, 0],
                            [1, 1],
                            [0.5, 0.5]]));

    test.ok(b.shapes.length > 0);

    test.done();
};

exports.overlaps = function(test){
    var bodyA = new Body({ mass: 1 });
    var bodyB = new Body({ mass: 1 });
    bodyA.addShape(new Circle());
    bodyB.addShape(new Circle());
    var world = new World();
    world.addBody(bodyA);
    world.addBody(bodyB);
    world.step(1/60);
    test.ok(bodyA.overlaps(bodyB));
    test.done();
};

exports.removeShape = function(test){
    var body = new Body();
    body.addShape(new Circle(1));
    test.ok(body.removeShape(body.shapes[0]));
    test.ok(!body.removeShape(new Circle(1)));
    test.equal(body.shapes.length, 0);
    test.done();
};

exports.setDensity = function(test){
    var body = new Body({ mass: 1 });
    body.addShape(new Circle(1));
    var inertiaBefore = body.inertia;
    body.setDensity(10);
    test.equal(body.mass, body.getArea() * 10);
    test.ok(inertiaBefore !== body.inertia);
    test.done();
};

exports.setZeroForce = function(test){
    var b = new Body({ force:[1,2], angularForce:3 });
    b.setZeroForce();
    test.equal(vec2.length(b.force),0);
    test.equal(b.angularForce,0);
    test.done();
};

exports.sleep = function(test){
    // STUB
    test.done();
};

exports.sleepTick = function(test){
    // STUB
    test.done();
};

exports.toLocalFrame = function(test){
    // STUB
    test.done();
};

exports.toWorldFrame = function(test){
    // STUB
    test.done();
};

exports.updateAABB = function(test){
    var b = new Body();
    b.updateAABB();

    var b = new Body(),
        s = new Circle(1);
    b.addShape(s);
    b.updateAABB();

    test.equal(b.aabb.lowerBound[0], -1, 'Lower AABB bound should be -1');
    test.equal(b.aabb.upperBound[0],  1, 'Upper AABB bound should be 1');
    test.equal(b.aabb.lowerBound[1], -1, 'Lower AABB bound should be -1');
    test.equal(b.aabb.upperBound[1],  1, 'Upper AABB bound should be 1');

    var b = new Body(),
        s = new Circle(1),
        offset = [-2,3];
    b.addShape(s,offset,Math.PI/2);
    b.updateAABB();

    test.equal(b.aabb.lowerBound[0], -s.radius + offset[0]);
    test.equal(b.aabb.upperBound[0],  s.radius + offset[0]);
    test.equal(b.aabb.lowerBound[1], -s.radius + offset[1]);
    test.equal(b.aabb.upperBound[1],  s.radius + offset[1]);

    test.done();
};

exports.updateBoundingRadius = function(test){
    var body = new Body({ mass: 1 });
    var shape = new Circle(1);
    body.addShape(shape);
    test.equal(body.boundingRadius, 1);
    shape.radius = 2;
    shape.updateBoundingRadius();
    body.updateBoundingRadius();
    test.equal(body.boundingRadius, 2);
    test.done();
};

exports.updateMassProperties = function(test){
    // STUB
    test.done();
};

exports.wakeUp = function(test){
    // STUB
    test.done();
};

exports.collisionResponse = function(test){
    var bodyA = new Body({ mass: 1, position: [1, 0] });
    bodyA.addShape(new Circle(1));

    var bodyB = new Body({ mass: 1, position: [-1, 0] });
    bodyB.addShape(new Circle(1));

    var world = new World();
    world.addBody(bodyA);
    world.addBody(bodyB);

    world.step(1 / 60);
    test.ok(world.narrowphase.contactEquations[0].enabled);

    bodyA.collisionResponse = false;
    world.step(1 / 60);
    test.ok(!world.narrowphase.contactEquations[0].enabled);

    bodyA.collisionResponse = true;
    bodyA.shapes[0].collisionResponse = false;
    world.step(1 / 60);
    test.ok(!world.narrowphase.contactEquations[0].enabled);

    test.done();
};

