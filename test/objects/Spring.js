var Spring = require(__dirname + '/../../src/objects/Spring');
var Body = require(__dirname + '/../../src/objects/Body');

exports.construct = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var spring = new Spring(bodyA, bodyB);

    var options = {
        restLength: 1,
        stiffness: 2,
        damping: 3,
        localAnchorA: [4,5],
        localAnchorB: [6,7],
    };
    spring = new Spring(bodyA, bodyB, options);
    test.equal(spring.stiffness,    options.stiffness);
    test.equal(spring.restLength,   options.restLength);
    test.equal(spring.damping,      options.damping);

    // TODO: pass worldAnchorA/B

    test.done();
};

exports.applyForce = function(test){
    // STUB
    test.done();
};

exports.getWorldAnchorA = function(test){
    // STUB
    test.done();
};

exports.getWorldAnchorB = function(test){
    // STUB
    test.done();
};

exports.setWorldAnchorA = function(test){
    // STUB
    test.done();
};

exports.setWorldAnchorB = function(test){
    // STUB
    test.done();
};

