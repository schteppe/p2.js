module.exports = IslandNode;

/**
 * @class IslandNode
 * @constructor
 */
function IslandNode(body){
    this.body = body;
    this.neighbors = [];
    this.equations = [];
    this.visited = false;
}

/**
 * Clean this node from bodies and equations.
 * @method reset
 */
IslandNode.prototype.reset = function(){
    this.equations.length = 0;
    this.neighbors.length = 0;
    this.visited = false;
    this.body = null;
};
