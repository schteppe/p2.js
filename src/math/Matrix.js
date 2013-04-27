
    // Matrices
    p2.tMat2 = {};
    p2.oMat2 = {};
    p2.tMat2.create = function(e11,e12,e21,e22){
        matCount++;
        var m = new ARRAY_TYPE(4);
        m[0] = e11||0.0;
        m[1] = e12||0.0;
        m[2] = e21||0.0;
        m[3] = e22||0.0;
        return m;
    };
    p2.oMat2.create = function(e11,e12,e21,e22){
        return {e11:e11||0,
                e12:e12||0,
                e21:e21||0,
                e22:e22||0};
    };
    p2.tMat2.vectorMultiply = function(m,v,out){
        out[0] = m[0]*v[0] + m[1]*v[1];
        out[1] = m[2]*v[0] + m[3]*v[1];
    };
    p2.oMat2.vectorMultiply = function(m,v,out){
        out.x = m.e11*v.x + m.e12*v.y;
        out.y = m.e21*v.x + m.e22*v.y;
    };
    p2.tMat2.setIdentity = function(m){
        m[0] = 1.0;
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 1.0;
    };
    p2.oMat2.setIdentity = function(m){
        m.e11 = 1.0;
        m.e12 = 0.0;
        m.e21 = 0.0;
        m.e22 = 1.0;
    };
    p2.tMat2.setFromRotation = function(m,angle){
        m[0] =  cos(angle);
        m[1] = -sin(angle);
        m[2] =  sin(angle);
        m[3] =  cos(angle);
    };
    p2.oMat2.setFromRotation = function(m,angle){
        m.e11 =  cos(angle);
        m.e12 = -sin(angle);
        m.e21 =  sin(angle);
        m.e22 =  cos(angle);
    };

    var M = p2.M = p2.tMat2;
