	if (typeof module !== 'undefined') {
   		// export for node
    	module.exports = p2;
	} else {
    	// assign to window
    	this.p2 = p2;
	}

}).apply(this);