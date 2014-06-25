var LinearSpring = require(__dirname + '/../../src/objects/LinearSpring');
var Body = require(__dirname + '/../../src/objects/Body');
var vec2 = require(__dirname + '/../../src/math/vec2');

var bodyA, bodyB, spring;
var options = {
    restLength: 1,
    stiffness: 2,
    damping: 3,
    localAnchorA: [4,5],
    localAnchorB: [6,7],
};

exports.setUp = function(callback){
    bodyA = new Body();
    bodyB = new Body();
    spring = new LinearSpring(bodyA, bodyB, options);
    callback();
};

exports.construct = function(test){
    test.equal(spring.stiffness,    options.stiffness);
    test.equal(spring.restLength,   options.restLength);
    test.equal(spring.damping,      options.damping);

    // TODO: pass worldAnchorA/B

    test.done();
};

exports.applyForce = function(test){
    spring.setWorldAnchorA([0,0]);
    spring.setWorldAnchorB([0,0]);
    bodyA.position[0] = 1;
    bodyB.position[0] = -1;
    spring.applyForce();
    test.ok(bodyA.force[0] < 0);
    test.ok(bodyB.force[0] > 0);
    test.done();
};

exports.getWorldAnchorA = function(test){
    var v = vec2.create();
    spring.getWorldAnchorA(v);
    test.equal(v[0], options.localAnchorA[0]);
    test.equal(v[1], options.localAnchorA[1]);
    test.done();
};

exports.getWorldAnchorB = function(test){
    var v = vec2.create();
    spring.getWorldAnchorB(v);
    test.equal(v[0], options.localAnchorB[0]);
    test.equal(v[1], options.localAnchorB[1]);
    test.done();
};

exports.setWorldAnchorA = function(test){
    var v = vec2.create();
    spring.setWorldAnchorA([0,0]);
    spring.getWorldAnchorA(v);
    test.equal(v[0], 0);
    test.equal(v[1], 0);
    test.done();
};

exports.setWorldAnchorB = function(test){
    var v = vec2.create();
    spring.setWorldAnchorB([0,0]);
    spring.getWorldAnchorB(v);
    test.equal(v[0], 0);
    test.equal(v[1], 0);
    test.done();
};

