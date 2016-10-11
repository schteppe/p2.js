/* global p2 */

(function(p2){

p2.StateMachine = StateMachine;

/**
 * var fsm = new StateMachine({
 *     states: [
 *         1, 2, 3 // first one is the initial state
 *     ],
 *     transitions: [
 *         [1, 2],
 *         [2, 3],
 *         [3, 1]
 *     ]
 * });
 */
function StateMachine(options){
    p2.EventEmitter.call(this);

    this.states = options.states.slice(0);
    this.state = this.states[0];
    this.transitions = [];
    for(var i=0; i < options.transitions.length; i++){
        this.transitions.push([
            options.transitions[i][0],
            options.transitions[i][1]
        ]);
    }
}
StateMachine.prototype = Object.create(p2.EventEmitter.prototype);

StateMachine.prototype.transitionTo = function(toState){
    if(this.state === toState){
        return;
    }

    // Check if OK
    var ok = false;
    for(var i=0; i<this.transitions.length; i++){
        if(this.transitions[i][0] === this.state && this.transitions[i][1] === toState){
            ok = true;
            break;
        }
    }

    if(!ok){
        throw new Error('Illegal transition from ' + this.state + ' to ' + toState + '.');
    }

    this.state = toState;
    this.emit({
        state: toState
    });
    this.onStateChanged(toState);

    return this;
};

// To be implemented by subclasses
StateMachine.prototype.onStateChanged = function(){};

})(p2);