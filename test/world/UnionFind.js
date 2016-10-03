var UnionFind = require(__dirname + '/../../src/world/UnionFind');

module.exports = {
    construct: function(test){
        var uf = new UnionFind(10);

        test.equal(uf.size, 10);
        test.equal(uf.count, 10);

        test.done();
    },

    resize: function(test){
        var uf = new UnionFind(10);

        test.equal(uf.size, 10);

        uf.resize(20);
        test.equal(uf.size, 20);
        test.equal(uf.count, 20);

        test.done();
    },

    union: function(test){
        var uf = new UnionFind(10);

        test.equal(uf.size, 10);

        uf.union(0, 1);
        uf.union(1, 2);
        uf.union(2, 3);

        uf.union(4, 5);
        uf.union(5, 6);
        uf.union(6, 7);

        uf.union(8, 9);

        test.equal(uf.find(0), uf.find(3));
        test.equal(uf.find(4), uf.find(7));
        test.equal(uf.find(8), uf.find(9));
        test.notEqual(uf.find(0), uf.find(9));

        test.done();
    }
};
