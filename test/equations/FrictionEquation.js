var FrictionEquation = require(__dirname + '/../../src/equations/FrictionEquation');
var Body = require(__dirname + '/../../src/objects/Body');

exports.construct = function(test){
	var slipForce = 100;
    var bodyA = new Body();
    var bodyB = new Body();
    var eq = new FrictionEquation(bodyA, bodyB, slipForce);
    test.equal(eq.minForce, -slipForce);
    test.equal(eq.maxForce, slipForce);
    test.done();
};

exports.setSlipForce = function(test){
    // STUB
    test.done();
};

