var EventEmitter = function () {}

module.exports = EventEmitter;

EventEmitter.prototype = {
    constructor: EventEmitter,
    on: function ( type, listener ) {
        if ( this._listeners === undefined ) this._listeners = {};
        var listeners = this._listeners;
        if ( listeners[ type ] === undefined ) {
            listeners[ type ] = [];
        }
        if ( listeners[ type ].indexOf( listener ) === - 1 ) {
            listeners[ type ].push( listener );
        }
        return this;
    },
    has: function ( type, listener ) {
        if ( this._listeners === undefined ) return false;
        var listeners = this._listeners;
        if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {
            return true;
        }
        return false;
    },
    off: function ( type, listener ) {
        if ( this._listeners === undefined ) return;
        var listeners = this._listeners;
        var index = listeners[ type ].indexOf( listener );
        if ( index !== - 1 ) {
            listeners[ type ].splice( index, 1 );
        }
    },
    emit: function ( event ) {
        if ( this._listeners === undefined ) return;
        var listeners = this._listeners;
        var listenerArray = listeners[ event.type ];
        if ( listenerArray !== undefined ) {
            event.target = this;
            for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {
                listenerArray[ i ].call( this, event );
            }
        }
        return this;
    }
};
