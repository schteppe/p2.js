var p2 = require('../src/p2');
var pkg = require('../package.json');

module.exports = {
	version: function(test){
		test.equal(pkg.version, p2.version);
		test.done();
	}
};