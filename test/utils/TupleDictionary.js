var TupleDictionary = require(__dirname + '/../../src/utils/TupleDictionary');

exports.construct = function(test){
	var dict = new TupleDictionary();
    test.done();
};

exports.getKey = function(test){
	var dict = new TupleDictionary();
	var key = dict.getKey(1, 2);
	test.ok(typeof key === 'number');
    test.done();
};

exports.get = function(test){
	var dict = new TupleDictionary();
	var a = { id: 1 };
	var b = { id: 2 };
	var c = { id: 3 };
	dict.set(a.id, b.id, c);

	var obj = dict.get(a.id, b.id);
	test.deepEqual(obj, c, 'could not get by keys');

	obj = dict.get(b.id, a.id);
	test.deepEqual(obj, c, 'could not get by flipped keys');

	obj = dict.get(3, 4, c);
	test.equal(obj, undefined, 'could not get unset');

    test.done();
};

exports.set = function(test){
	var dict = new TupleDictionary();

	dict.set(1, 2, 3);
	var key = dict.getKey(1,2);
	test.deepEqual(dict.keys, [key]);
	test.equal(dict.data[key], 3);

	dict.set(2, 1, 3);
	test.deepEqual(dict.keys, [key]);

	dict.set(2, 1, 3);
	test.deepEqual(dict.keys, [key]);

    test.done();
};


exports.reset = function(test){
	var dict = new TupleDictionary();

	dict.set(1, 2, 1);
	dict.set(3, 4, 1);

	dict.reset();
	test.equal(dict.keys.length, 0);

    test.done();
};


exports.copy = function(test){
	var dict1 = new TupleDictionary();
	var dict2 = new TupleDictionary();

	dict1.set(1, 2, 1);
	dict1.set(2, 3, 2);
	dict1.set(4, 3, 3);

	dict2.copy(dict1);

	test.deepEqual(dict1, dict2);

    test.done();
};