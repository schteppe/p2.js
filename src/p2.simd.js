/* global SIMD, p2 */

if(typeof SIMD !== 'undefined' && typeof(p2) !== 'undefined'){
    var vec2 = p2.vec2;
    var Equation = p2.Equation;
    var Body = p2.Body;

    // Sneak in some SIMD stuff on initialize
    p2.Body.prototype.updateMassProperties = function(){
        if(this.position.length === 2){
            delete this.angle;
            delete this.angularVelocity;
            delete this.angularForce;
            this.position = new Float32Array([this.position[0], this.position[1], this._oldAngle, 0]);
            this.previousPosition = new Float32Array([this.previousPosition[0], this.previousPosition[1], 0, 0]);
            this.velocity = new Float32Array([this.velocity[0], this.velocity[1], 0, 0]);
            this.force = new Float32Array([this.force[0], this.force[1], 0, 0]);
            this.massMultiplier = new Float32Array([this.massMultiplier[0], this.massMultiplier[1], 1, 0]);
            this.invMassSolve2 = new Float32Array([this.mass ? 1/this.mass : 0, this.mass ? 1/this.mass : 0, 1, 0]);
            this.vlambda = new Float32Array([0, 0, 0, 0]);
        }

        if(this.type === Body.STATIC || this.type === Body.KINEMATIC){

            this.mass = Number.MAX_VALUE;
            this.invMass = 0;
            this.inertia = Number.MAX_VALUE;
            this.invInertia = 0;
            this.invMassSolve2.set([0,0,0,0]);

        } else {
            var shapes = this.shapes,
                N = shapes.length,
                m = this.mass / N,
                I = 0;

            if(!this.fixedRotation){
                for(var i=0; i<N; i++){
                    var shape = shapes[i],
                        r2 = vec2.squaredLength(shape.position),
                        Icm = shape.computeMomentOfInertia(m);
                    I += Icm + m*r2;
                }
                this.inertia = I;
                this.invInertia = I>0 ? 1/I : 0;

            } else {
                this.inertia = Number.MAX_VALUE;
                this.invInertia = 0;
            }

            // Inverse mass properties are easy
            this.invMass = 1 / this.mass;

            vec2.set(
                this.massMultiplier,
                this.fixedX ? 0 : 1,
                this.fixedY ? 0 : 1
            );
        }
    };

    Object.defineProperties(p2.Body.prototype, {
        angle: {
            get: function () {
                return this.position[2];
            },
            set: function (value) {
                if(this.position.length === 2)
                    this._oldAngle = value;
                else
                    this.position[2] = value;
            }
        },
        angularVelocity: {
            get: function () {
                return this.velocity[2];
            },
            set: function (value) {
                this.velocity[2] = value;
            }
        },
        angularForce: {
            get: function () {
                return this.force[2];
            },
            set: function (value) {
                this.force[2] = value;
            }
        },
        previousAngle: {
            get: function () {
                return this.previousPosition[2];
            },
            set: function (value) {
                this.previousPosition[2] = value;
            }
        },
        invMassSolve: {
            get: function () {
                return this.invMassSolve2[0];
            },
            set: function (value) {
                if(this.invMassSolve2)
                    this.invMassSolve2[0] = value;
                else
                    this._tmpInvMassSolve = value;
            }
        },
        invInertiaSolve: {
            get: function () {
                return this.invMassSolve2[2];
            },
            set: function (value) {
                if(this.invMassSolve2)
                    this.invMassSolve2[2] = value;
                else
                    this._tmpInvInertiaSolve = value;
            }
        },
        wlambda: {
            get: function () {
                return this.vlambda[2];
            },
            set: function (value) {
                this.vlambda[2] = value;
            }
        }
    });

    p2.Body.prototype.integrate = function(dt){

        // Save old positions
        this.previousPosition.set(this.position);

        var dtVec = SIMD.Float32x4.splat(dt);
        var f = SIMD.Float32x4.load(this.force, 0);
        var v = SIMD.Float32x4.load(this.velocity, 0);
        var x = SIMD.Float32x4.load(this.position, 0);
        var massMult = SIMD.Float32x4.load(this.massMultiplier, 0);
        var iM = SIMD.Float32x4(this.invMass, this.invMass, this.invInertia, 0);

        var fhMinv = SIMD.Float32x4.mul(f, iM);
        fhMinv = SIMD.Float32x4.mul(fhMinv, dtVec);
        fhMinv = SIMD.Float32x4.mul(fhMinv, massMult);
        var v2 = SIMD.Float32x4.add(fhMinv, v);
        var v_dt = SIMD.Float32x4.mul(v2, dtVec);

        SIMD.Float32x4.store(this.velocity, 0, v2);

        // CCD
        if(!this.integrateToTimeOfImpact(dt)){
            var x2 = SIMD.Float32x4.add(x, v_dt);
            SIMD.Float32x4.store(this.position, 0, x2);
        }

        this.aabbNeedsUpdate = true;
    };

    Equation.prototype._constructCallback = function(){
        this.GA = new Float32Array([this.G[0], this.G[1], this.G[2], 0]);
        this.GB = new Float32Array([this.G[3], this.G[4], this.G[5], 0]);
    };

    p2.ContactEquation.prototype.computeB = function(a,b,h){
        var bi = this.bodyA,
            bj = this.bodyB,
            ri = this.contactPointA,
            rj = this.contactPointB,
            xi = bi.position,
            xj = bj.position;

        var penetrationVec = this.penetrationVec,
            n = this.normalA,
            GA = this.GA,
            GB = this.GB;

        // Caluclate cross products
        var rixn = vec2.crossLength(ri,n),
            rjxn = vec2.crossLength(rj,n);

        // G = [-n -rixn n rjxn]
        GA[0] = -n[0];
        GA[1] = -n[1];
        GA[2] = -rixn;
        GB[0] = n[0];
        GB[1] = n[1];
        GB[2] = rjxn;

        // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
        vec2.add(penetrationVec,xj,rj);
        vec2.sub(penetrationVec,penetrationVec,xi);
        vec2.sub(penetrationVec,penetrationVec,ri);

        // Compute iteration
        var GW, Gq;
        if(this.firstImpact && this.restitution !== 0){
            Gq = 0;
            GW = (1/b)*(1+this.restitution) * this.computeGW();
        } else {
            Gq = vec2.dot(n,penetrationVec) + this.offset;
            GW = this.computeGW();
        }

        var GiMf = this.computeGiMf();
        var B = - Gq * a - GW * b - h*GiMf;

        return B;
    };

    p2.FrictionEquation.prototype.computeB = function(a,b,h){
        var bi = this.bodyA,
            bj = this.bodyB,
            ri = this.contactPointA,
            rj = this.contactPointB,
            t = this.t,
            GA = this.GA,
            GB = this.GB;

        GA[0] = -t[0];
        GA[1] = -t[1];
        GA[2] = -vec2.crossLength(ri,t);
        GB[0] = t[0];
        GB[1] = t[1];
        GB[2] = vec2.crossLength(rj,t);

        var GW = this.computeGW(),
            GiMf = this.computeGiMf();

        var B = /* - g * a  */ - GW * b - h*GiMf;

        return B;
    };

    Equation.prototype.gmult = function(GA, GB, vA, vB){
        var ga = SIMD.Float32x4.load(GA, 0);
        var gb = SIMD.Float32x4.load(GB, 0);
        var va = SIMD.Float32x4.load(vA, 0);
        var vb = SIMD.Float32x4.load(vB, 0);
        var product = SIMD.Float32x4.add(
            SIMD.Float32x4.mul(ga, va),
            SIMD.Float32x4.mul(gb, vb)
        );
        return (
            SIMD.Float32x4.extractLane(product, 0) +
            SIMD.Float32x4.extractLane(product, 1) +
            SIMD.Float32x4.extractLane(product, 2)
        );
    };

    var qi = vec2.create(),
        qj = vec2.create();
    Equation.prototype.computeGq = function(){
        var bi = this.bodyA,
            bj = this.bodyB,
            xi = bi.position,
            xj = bj.position;
        return this.gmult(this.GA, this.GB, qi, qj) + this.offset;
    };

    Equation.prototype.computeGW = function(){
        var bi = this.bodyA,
            bj = this.bodyB,
            vi = bi.velocity,
            vj = bj.velocity,
            wi = bi.angularVelocity,
            wj = bj.angularVelocity;
        return this.gmult(this.GA,this.GB,vi,vj) + this.relativeVelocity;
    };

    Equation.prototype.computeGWlambda = function(){
        var bi = this.bodyA,
            bj = this.bodyB,
            vi = bi.vlambda,
            vj = bj.vlambda;
        return this.gmult(this.GA, this.GB,vi,vj);
    };

    var iMfi = vec2.create(),
        iMfj = vec2.create();
    Equation.prototype.computeGiMf = function(){
        var bi = this.bodyA,
            bj = this.bodyB,
            fi = SIMD.Float32x4.load(bi.force, 0),
            fj = SIMD.Float32x4.load(bj.force, 0),
            invMassi = SIMD.Float32x4.load(bi.invMassSolve2, 0),
            invMassj = SIMD.Float32x4.load(bj.invMassSolve2, 0),
            massMulti = SIMD.Float32x4.load(bi.massMultiplier, 0),
            massMultj = SIMD.Float32x4.load(bj.massMultiplier, 0);

        var iMfi = SIMD.Float32x4.mul(fi, invMassi);
        var iMfj = SIMD.Float32x4.mul(fj, invMassj);
        iMfi = SIMD.Float32x4.mul(iMfi, massMulti);
        iMfj = SIMD.Float32x4.mul(iMfj, massMultj);

        var ga = SIMD.Float32x4.load(this.GA, 0);
        var gb = SIMD.Float32x4.load(this.GB, 0);
        var product = SIMD.Float32x4.add(
            SIMD.Float32x4.mul(ga, iMfi),
            SIMD.Float32x4.mul(gb, iMfj)
        );
        return (
            SIMD.Float32x4.extractLane(product, 0) +
            SIMD.Float32x4.extractLane(product, 1) +
            SIMD.Float32x4.extractLane(product, 2)
        );
    };

    Equation.prototype.computeGiMGt = function(){
        var bi = this.bodyA;
        var bj = this.bodyB;
        var invMassi = SIMD.Float32x4.load(bi.invMassSolve2, 0),
            invMassj = SIMD.Float32x4.load(bj.invMassSolve2, 0),
            massMulti = SIMD.Float32x4.load(bi.massMultiplier, 0),
            massMultj = SIMD.Float32x4.load(bj.massMultiplier, 0);

        var ga = SIMD.Float32x4.load(this.GA, 0);
        var gb = SIMD.Float32x4.load(this.GB, 0);

        var product1 = SIMD.Float32x4.mul( SIMD.Float32x4.mul(ga,ga) , SIMD.Float32x4.mul(invMassi, massMulti) );
        var product2 = SIMD.Float32x4.mul( SIMD.Float32x4.mul(gb,gb) , SIMD.Float32x4.mul(invMassj, massMultj) );

        return (
            SIMD.Float32x4.extractLane(product1, 0) +
            SIMD.Float32x4.extractLane(product1, 1) +
            SIMD.Float32x4.extractLane(product1, 2) +
            SIMD.Float32x4.extractLane(product2, 0) +
            SIMD.Float32x4.extractLane(product2, 1) +
            SIMD.Float32x4.extractLane(product2, 2)
        );


        // var bi = this.bodyA,
        //     bj = this.bodyB,
        //     invMassi = bi.invMassSolve,
        //     invMassj = bj.invMassSolve,
        //     invIi = bi.invInertiaSolve,
        //     invIj = bj.invInertiaSolve,
        //     G = this.G;

        // return  G[0] * G[0] * invMassi * bi.massMultiplier[0] +
        //         G[1] * G[1] * invMassi * bi.massMultiplier[1] +
        //         G[2] * G[2] *    invIi +
        //         G[3] * G[3] * invMassj * bj.massMultiplier[0] +
        //         G[4] * G[4] * invMassj * bj.massMultiplier[1] +
        //         G[5] * G[5] *    invIj;
    };

    var addToWlambda_temp = vec2.create(),
        addToWlambda_Gi = vec2.create(),
        addToWlambda_Gj = vec2.create(),
        addToWlambda_ri = vec2.create(),
        addToWlambda_rj = vec2.create(),
        addToWlambda_Mdiag = vec2.create();
    Equation.prototype.addToWlambda = function(deltalambda){
        var bi = this.bodyA,
            bj = this.bodyB,
            deltalambdaVec = SIMD.Float32x4.splat(deltalambda);

        var invMassi = SIMD.Float32x4.load(bi.invMassSolve2, 0),
            invMassj = SIMD.Float32x4.load(bj.invMassSolve2, 0),
            massMulti = SIMD.Float32x4.load(bi.massMultiplier, 0),
            massMultj = SIMD.Float32x4.load(bj.massMultiplier, 0),
            vlambdai = SIMD.Float32x4.load(bi.vlambda, 0),
            vlambdaj = SIMD.Float32x4.load(bj.vlambda, 0);

        var ga = SIMD.Float32x4.load(this.GA, 0);
        var gb = SIMD.Float32x4.load(this.GB, 0);

        var temp = SIMD.Float32x4.mul(ga, SIMD.Float32x4.mul(invMassi, deltalambdaVec));
        temp = SIMD.Float32x4.mul(temp, massMulti);
        vlambdai = SIMD.Float32x4.add(vlambdai, temp);

        temp = SIMD.Float32x4.mul(gb, SIMD.Float32x4.mul(invMassj, deltalambdaVec));
        temp = SIMD.Float32x4.mul(temp, massMultj);
        vlambdaj = SIMD.Float32x4.add(vlambdaj, temp);

        SIMD.Float32x4.store(bi.vlambda, 0, vlambdai);
        SIMD.Float32x4.store(bj.vlambda, 0, vlambdaj);


        // var bi = this.bodyA,
        //     bj = this.bodyB,
        //     temp = addToWlambda_temp,
        //     Gi = addToWlambda_Gi,
        //     Gj = addToWlambda_Gj,
        //     ri = addToWlambda_ri,
        //     rj = addToWlambda_rj,
        //     invMassi = bi.invMassSolve,
        //     invMassj = bj.invMassSolve,
        //     invIi = bi.invInertiaSolve,
        //     invIj = bj.invInertiaSolve,
        //     Mdiag = addToWlambda_Mdiag,
        //     G = this.G;

        // Gi[0] = G[0];
        // Gi[1] = G[1];
        // Gj[0] = G[3];
        // Gj[1] = G[4];

        // vec2.scale(temp, Gi, invMassi*deltalambda);
        // vec2.multiply(temp, temp, bi.massMultiplier);
        // vec2.add( bi.vlambda, bi.vlambda, temp);
        // bi.wlambda += invIi * G[2] * deltalambda;

        // vec2.scale(temp, Gj, invMassj*deltalambda);
        // vec2.multiply(temp, temp, bj.massMultiplier);
        // vec2.add( bj.vlambda, bj.vlambda, temp);
        // bj.wlambda += invIj * G[5] * deltalambda;
    };

}
