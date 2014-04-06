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