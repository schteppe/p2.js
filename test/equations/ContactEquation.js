var ContactEquation = require(__dirname + '/../../src/equations/ContactEquation');
var Body = require(__dirname + '/../../src/objects/Body');

exports.construct = function(test){
	var bodyA = new Body();
	var bodyB = new Body();
    var eq = new ContactEquation(bodyA, bodyB);

    test.done();
};

exports.computeB = function(test){
    // TODO
    test.done();
};

exports.getVelocityAlongNormal = function(test){
    var bodyA = new Body({ position: [-1, 0] });
	var bodyB = new Body({ position: [1, 0] });
    var eq = new ContactEquation(bodyA, bodyB);
	test.equal(eq.getVelocityAlongNormal(), 0);
	eq.normalA[0] = 1; // points out from bodyA toward bodyB
	eq.normalA[1] = 0;
	bodyB.velocity[0] = 1; // Away from bodyA along the positive normal direction
	test.equal(eq.getVelocityAlongNormal(), -1);

    test.done();
};