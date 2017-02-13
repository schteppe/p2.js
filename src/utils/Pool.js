module.exports = Pool;

/**
 * @class Object pooling utility.
 */
function Pool(options) {
	options = options || {};

	/**
	 * @property {Array} objects
	 * @type {Array}
	 */
	this.objects = [];

	if(options.size !== undefined){
		this.resize(options.size);
	}
}

/**
 * @method resize
 * @param {number} size
 * @return {Pool} Self, for chaining
 */
Pool.prototype.resize = function (size) {
	var objects = this.objects;

	while (objects.length > size) {
		objects.pop();
	}

	while (objects.length < size) {
		objects.push(this.create());
	}

	return this;
};

/**
 * Get an object from the pool or create a new instance.
 * @method get
 * @return {Object}
 */
Pool.prototype.get = function () {
	var objects = this.objects;
	return objects.length ? objects.pop() : this.create();
};

/**
 * Clean up and put the object back into the pool for later use.
 * @method release
 * @param {Object} object
 * @return {Pool} Self for chaining
 */
Pool.prototype.release = function (object) {
	this.destroy(object);
	this.objects.push(object);
	return this;
};
