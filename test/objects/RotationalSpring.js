var RotationalSpring = require(__dirname + '/../../src/objects/RotationalSpring');
var Body = require(__dirname + '/../../src/objects/Body');
var vec2 = require(__dirname + '/../../src/math/vec2');

var bodyA, bodyB, spring;
var options = {
    restAngle: 1,
    stiffness: 2,
    damping: 3,
};

exports.setUp = function(callback){
    bodyA = new Body();
    bodyB = new Body();
    spring = new RotationalSpring(bodyA, bodyB, options);
    callback();
};

exports.construct = function(test){
    test.equal(spring.stiffness,    options.stiffness);
    test.equal(spring.restAngle,    options.restAngle);
    test.equal(spring.damping,      options.damping);
    test.done();
};

exports.applyForce = function(test){
    bodyA.angle = Math.PI / 4;
    bodyB.angle = 0;
    spring.applyForce();
    test.ok(bodyA.angularForce < 0);
    test.ok(bodyB.angularForce > 0);
    test.done();
};
