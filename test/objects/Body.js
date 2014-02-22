var Body = require(__dirname + '/../../src/objects/Body')
    Circle = require(__dirname + '/../../src/shapes/Circle')
    vec2 = require(__dirname + '/../../src/math/vec2')

exports.construct = function(test){

    // Static via mass=0
    var body = new Body({
        mass : 0,
    });
    test.equal(body.invMass,0);
    test.equal(body.motionState,Body.STATIC);

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

exports.applyForce = function(test){
    // STUB
    test.done();
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

exports.removeShape = function(test){
    // STUB
    test.done();
};

exports.setDensity = function(test){
    // STUB
    test.done();
};

exports.setDensity = function(test){
    // STUB
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
    // STUB
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

