var JSONFileFormat = require('../src/serializer/JSONFileFormat');
var schema;

exports.create = function(test){
    var f = new JSONFileFormat();
    test.done();
};

exports.addVersion = function(test){
    var f = new JSONFileFormat();
    f.addVersion(1,validateFunc);
    f.addVersion(2,validateFunc);
    test.done();
};

exports.addUpgrader = function(test){
    var f = new JSONFileFormat();
    f.addVersion(1,validateFunc);
    f.addVersion(2,validateFunc);
    f.addVersion(3,schema);
    f.addUpgrader(1,2,upgrader);
    test.done();
};

exports.validate = function(test){
    var f = new JSONFileFormat();
    f.addVersion(1,validateFunc);
    f.addVersion(2,schema);
    var instance1 = {
            version:1,
        },
        instance2 = {
            version:2,
        },
        instance3 = {
            version:2,
            notAllowedProperty:'asdf'
        };
    test.ok(f.validate(instance1));
    test.ok(f.validate(instance2));
    test.ok(!f.validate(instance3));
    test.done();
};

exports.upgrade = function(test){
    var f = new JSONFileFormat();
    f.addVersion(1,validateFunc);
    f.addVersion(2,validateFunc);
    f.addUpgrader(1,2,upgrader);
    var instance = {
        version: 1,
    };
    f.upgrade(instance);
    test.equal(instance.version,2,"Should be able to upgrade a valid instance");

    var invalidInstance = { asdf: 1 };
    test.equal( f.upgrade(invalidInstance), false, "Should return false if passing an invalid instance.");
    test.done();
};

schema = {
    type: "object",
    properties: {
        version: { type:"number" },
    },
};

function validateFunc(instance){
    return true;
}
function upgrader(instance){
    instance.version = instance.version + 1;
    return instance;
}
