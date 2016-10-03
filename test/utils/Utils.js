var Utils = require(__dirname + '/../../src/utils/Utils');

exports.appendArray = function(test){
    var arrayA = [1,2,3];
    var arrayB = [4,5,6];
    Utils.appendArray(arrayA, arrayB);
    test.deepEqual(arrayA, [1, 2, 3, 4, 5, 6]);
    test.deepEqual(arrayB, [4, 5, 6]);
    test.done();
};

exports.arrayRemove = function(test){
    var array = [1,2,3];
    Utils.arrayRemove(array, 1);
    test.deepEqual(array, [2,3]);
    test.done();
};

exports.splice = function(test){
    var array = [1,2,3];
    Utils.splice(array, 1);
    test.deepEqual(array, [1,3]);
    test.done();
};

exports.extend = function(test){
    // STUB
    test.done();
};

exports.defaults = function(test){
    // STUB
    test.done();
};

