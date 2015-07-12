var ContactEquationPool = require(__dirname + '/../../src/utils/ContactEquationPool');
var ContactEquation = require(__dirname + '/../../src/equations/ContactEquation');

exports.construct = function(test){
    var pool = new ContactEquationPool();
    test.done();
};

exports.resize = function(test){
    var pool = new ContactEquationPool();
    pool.resize(10);
    test.equal(pool.objects.length, 10);
    test.done();
};

exports.getRelease = function(test){
    var pool = new ContactEquationPool();
    test.equal(pool.objects.length, 0);
    var object = pool.get();
    object.bodyA = 'asd';
    object.bodyB = 'asd2';
    test.ok(object instanceof ContactEquation, 'should create contact equations');
    test.equal(pool.objects.length, 0, 'should not increase pool size when creating');
    pool.release(object);
    test.equal(object.bodyA, null, 'should clean released object');
    test.equal(object.bodyB, null, 'should clean released object');
    test.equal(pool.objects.length, 1, 'should add released object to pool');
    var object2 = pool.get();
    test.equal(object, object2, 'should return pooled object');
    test.done();
};

