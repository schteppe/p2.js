
    // Typed arrays!
    p2.tVec2 = {};
    p2.oVec2 = {};
    p2.tVec2.create = function(x,y){
        vecCount++;
        var a = new ARRAY_TYPE(2);
        a[0] = x||0;
        a[1] = y||0;
        return a;
    }
    p2.oVec2.create = function(x,y){
        return {x:x||0, y:y||0};
    }
    p2.tVec2.set = function(v, x, y) {
        v[0] = x;
        v[1] = y;
    }
    p2.oVec2.set = function(v, x, y) {
        v.x = x;
        v.y = y;
    }
    p2.tVec2.copy = function(a, out) {
        out[0] = a[0];
        out[1] = a[1];
    }
    p2.oVec2.copy = function(a, out) {
        out.x = a.x;
        out.y = a.y;
    }
    p2.tVec2.add = function(a, b, out) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
    }
    p2.oVec2.add = function(a, b, out) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
    }
    p2.tVec2.subtract = function(a, b, out) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
    }
    p2.oVec2.subtract = function(a, b, out) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
    }
    p2.tVec2.scale = function(a, s, out) {
        out[0] = a[0] * s;
        out[1] = a[1] * s;
    }
    p2.oVec2.scale = function(a, s, out) {
        out.x = a.x * s;
        out.y = a.y * s;
    }
    p2.tVec2.normalize = function(a, out) {
        var iLen = 1 / p2.tVec2.norm(a);
        out[0] = a[0] * iLen;
        out[1] = a[1] * iLen;
    }
    p2.oVec2.normalize = function(a, out) {
        var iLen = 1 / p2.oVec2.norm(a);
        out.x = a.x * iLen;
        out.y = a.y * iLen;
    }
    p2.tVec2.norm = function(a) {
        return sqrt((a[0] * a[0]) + (a[1] * a[1]));
    }
    p2.oVec2.norm = function(a) {
        return sqrt((a.x * a.x) + (a.y * a.y));
    }
    p2.tVec2.norm2 = function(a) {
        return (a[0] * a[0]) + (a[1] * a[1]);
    }
    p2.oVec2.norm2 = function(a) {
        return (a.x * a.x) + (a.y * a.y);
    }
    p2.tVec2.dot = function(a,b){
        return a[0]*b[0] + a[1]*b[1];
    };
    p2.oVec2.dot = function(a,b){
        return a.x*b.x + a.y*b.y;
    };
    p2.tVec2.cross = function(a,b){
        return a[0]*b[1] - a[1]*b[0];
    };
    p2.oVec2.cross = function(a,b){
        return a.x*b.y - a.y*b.x;
    };
    p2.tVec2.getX = function(v){ return v[0]; };
    p2.tVec2.getY = function(v){ return v[1]; };
    p2.oVec2.getX = function(v){ return v.x; };
    p2.oVec2.getY = function(v){ return v.y; };

    var V = p2.V = p2.tVec2;
    var Vadd = V.add;
    var Vscale = V.scale;
    var Vsub = V.subtract;
    var Vdot = V.dot;
    var Vcross = V.cross;
    var Vnorm2 = V.norm2;
    var Vcopy = V.copy;

