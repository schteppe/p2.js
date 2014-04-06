var Equation = require(__dirname + '/../../src/equations/Equation');
var Body = require(__dirname + '/../../src/objects/Body');

exports.construct = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var minForce = -100;
    var maxForce = 100;
    var eq = new Equation(bodyA, bodyB, minForce, maxForce);
    test.equal(eq.minForce, minForce);
    test.equal(eq.maxForce, maxForce);
    test.equal(eq.bodyA, bodyA);
    test.equal(eq.bodyB, bodyB);
    test.done();
};

exports.addToWlambda = function(test){
    // STUB
    test.done();
};

exports.computeB = function(test){
    // STUB
    test.done();
};

exports.computeGW = function(test){
    // STUB
    test.done();
};

exports.computeGWlambda = function(test){
    // STUB
    test.done();
};

exports.computeGiMGt = function(test){
    // STUB
    test.done();
};

exports.computeGiMf = function(test){
    // STUB
    test.done();
};

exports.computeGq = function(test){
    // STUB
    test.done();
};

exports.computeInvC = function(test){
    // STUB
    test.done();
};

exports.updateSpookParams = function(test){
    // STUB
    test.done();
};

