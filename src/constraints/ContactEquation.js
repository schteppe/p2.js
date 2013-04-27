
    p2.ContactEquation = function(bi,bj){
        p2.Equation.call(this,bi,bj,0,1e6);
        this.penetration = 0.0;
        this.ri = V.create();
        this.penetrationVec = V.create();
        this.rj = V.create();
        this.ni = V.create();
        this.rixn = V.create();
        this.rjxn = V.create();
        this.rixw = V.create();
        this.rjxw = V.create();
        this.relVel = V.create();
        this.relForce = V.create();
    };
    p2.ContactEquation.prototype = new p2.Equation();
    p2.ContactEquation.prototype.constructor = p2.ContactEquation;
    p2.ContactEquation.prototype.computeB = function(a,b,h){
        var bi = this.bi,
            bj = this.bj,
            ri = this.ri,
            rj = this.rj,
            xi = bi.position,
            xj = bj.position;

        var vi = bi.velocity,
            wi = bi.angularVelocity,
            fi = bi.force,
            taui = bi.angularForce;

        var vj = bj.velocity,
            wj = bj.angularVelocity,
            fj = bj.force,
            tauj = bj.angularForce;

        var relVel = this.relVel,
            relForce = this.relForce,
            penetrationVec = this.penetrationVec,
            invMassi = bi.invMass,
            invMassj = bj.invMass,
            invIi = bi.invInertia,
            invIj = bj.invInertia,
            n = this.ni;

        // Caluclate cross products
        var rixn = this.rixn = Vcross(ri,n);
        var rjxn = this.rjxn = Vcross(rj,n);

        // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
        V.set(penetrationVec,0,0);
        Vadd(xj,rj,penetrationVec);
        Vsub(penetrationVec,xi,penetrationVec);
        Vsub(penetrationVec,ri,penetrationVec);

        var Gq = Vdot(n,penetrationVec);

        // Compute iteration
        var GW = Vdot(vj,n) - Vdot(vi,n) + wj * rjxn - wi * rixn;
        var GiMf = Vdot(fj,n)*invMassj - Vdot(fi,n)*invMassi + invIj*tauj*rjxn - invIi*taui*rixn;

        var B = - Gq * a - GW * b - h*GiMf;

        return B;
    };
    // Compute C = GMG+eps in the SPOOK equation
    p2.ContactEquation.prototype.computeC = function(eps){
        var bi = this.bi;
        var bj = this.bj;
        var rixn = this.rixn;
        var rjxn = this.rjxn;
        var invMassi = bi.invMass;
        var invMassj = bj.invMass;

        var C = invMassi + invMassj + eps;

        var invIi = bi.invInertia;
        var invIj = bj.invInertia;

        // Compute rxn * I * rxn for each body
        C += invIi * rixn * rixn;
        C += invIj * rjxn * rjxn;

        return C;
    };
    var computeGWlambda_ulambda = V.create();
    p2.ContactEquation.prototype.computeGWlambda = function(){
        var bi = this.bi;
        var bj = this.bj;
        var ulambda = computeGWlambda_ulambda;

        var GWlambda = 0.0;
        V.subtract(bj.vlambda, bi.vlambda, ulambda);
        GWlambda += V.dot(ulambda,this.ni);

        // Angular
        GWlambda -= bi.wlambda * this.rixn;
        GWlambda += bj.wlambda * this.rjxn;

        return GWlambda;
    };

    var addToWlambda_temp = V.create();
    p2.ContactEquation.prototype.addToWlambda = function(deltalambda){
        var bi = this.bi;
        var bj = this.bj;
        var rixn = this.rixn;
        var rjxn = this.rjxn;
        var invMassi = bi.invMass;
        var invMassj = bj.invMass;
        var n = this.ni;
        var temp = addToWlambda_temp;

        // Add to linear velocity
        Vscale(n,invMassi*deltalambda,temp);
        Vsub(bi.vlambda, temp , bi.vlambda);

        Vscale(n,invMassj*deltalambda,temp);
        Vadd(bj.vlambda, temp, bj.vlambda);

        // Add to angular velocity
        bi.wlambda -= bi.invInertia * rixn * deltalambda;
        bj.wlambda += bj.invInertia * rjxn * deltalambda;
    };
