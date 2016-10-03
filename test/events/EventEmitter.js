var EventEmitter = require(__dirname + '/../../src/events/EventEmitter');

exports.construct = function(test){
    var emitter = new EventEmitter();
    test.done();
};

exports.emit = function(test){
    // STUB
    test.done();
};

exports.has = function(test){
    var listener = function(){};
    var emitter = new EventEmitter();
    emitter.on('event', listener);

    test.ok(emitter.has('event'));

    test.done();
};

exports.on = function(test){
    var calls = 0;
    var listener = function(){
        calls++;
    };
    var emitter = new EventEmitter();
    emitter.on('event', listener);
    test.equal(calls, 0);

    emitter.emit({ type: 'event' });
    test.equal(calls, 1);

    test.done();
};

exports.off = function(test){
    var calls = 0;
    var listener = function(){
        calls++;
    };
    var emitter = new EventEmitter();
    emitter.on('event', listener);
    test.equal(calls, 0);

    emitter.emit({ type: 'event' });
    test.equal(calls, 1);

    emitter.off('event', listener);
    emitter.emit({ type: 'event' });
    test.equal(calls, 1);

    // Do it again!
    emitter.off('event', listener);
    emitter.emit({ type: 'event' });
    test.equal(calls, 1);

    test.done();
};
