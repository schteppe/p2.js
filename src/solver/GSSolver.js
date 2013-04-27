
    p2.GSSolver = function(){
        p2.Solver.call(this);
        this.iterations = 10;
        this.h = 1.0/60.0;
        this.k = 1e7;
        this.d = 6;
        this.a = 0.0;
        this.b = 0.0;
        this.eps = 0.0;
        this.tolerance = 0;
        this.setSpookParams(this.k,this.d);
        this.debug = false;
        this.arrayStep = 30;
        this.lambda = new ARRAY_TYPE(this.arrayStep);
        this.Bs =     new ARRAY_TYPE(this.arrayStep);
        this.invCs =  new ARRAY_TYPE(this.arrayStep);
    };
    p2.GSSolver.prototype = new p2.Solver();
    p2.GSSolver.prototype.setSpookParams = function(k,d){
        var h=this.h;
        this.k = k;
        this.d = d;
        this.a = 4.0 / (h * (1 + 4 * d));
        this.b = (4.0 * d) / (1 + 4 * d);
        this.eps = 4.0 / (h * h * k * (1 + 4 * d));
    };
    p2.GSSolver.prototype.solve = function(dt,world){
        var d = this.d,
            ks = this.k,
            iter = 0,
            maxIter = this.iterations,
            tolSquared = this.tolerance*this.tolerance,
            a = this.a,
            b = this.b,
            eps = this.eps,
            equations = this.equations,
            Neq = equations.length,
            bodies = world.bodies,
            Nbodies = world.bodies.length,
            h = dt;

        // Things that does not change during iteration can be computed once
        if(this.lambda.length < Neq){
            this.lambda = new ARRAY_TYPE(Neq + this.arrayStep);
            this.Bs =     new ARRAY_TYPE(Neq + this.arrayStep);
            this.invCs =  new ARRAY_TYPE(Neq + this.arrayStep);
        }
        var invCs = this.invCs;
        var Bs = this.Bs;
        var lambda = this.lambda;

        // Create array for lambdas
        for(var i=0; i!==Neq; i++){
            var c = equations[i];
            lambda[i] = 0.0;
            Bs[i] = c.computeB(a,b,h);
            invCs[i] = 1.0 / c.computeC(eps);
        }

        var q, B, c, invC, deltalambda, deltalambdaTot, GWlambda, lambdaj;

        if(Neq !== 0){
            var i,j, minForce, maxForce, lambdaj_plus_deltalambda;

            // Reset vlambda
            for(i=0; i!==Nbodies; i++){
                var b=bodies[i], vlambda=b.vlambda;
                V.set(vlambda,0,0);
                b.wlambda = 0;
            }

            // Iterate over equations
            for(iter=0; iter!==maxIter; iter++){

                // Accumulate the total error for each iteration.
                deltalambdaTot = 0.0;

                for(j=0; j!==Neq; j++){

                    c = equations[j];

                    // Compute iteration
                    maxForce = c.maxForce;
                    minForce = c.minForce;
                    B = Bs[j];
                    invC = invCs[j];
                    lambdaj = lambda[j];
                    GWlambda = c.computeGWlambda(eps);
                    deltalambda = invC * ( B - GWlambda - eps * lambdaj );

                    // Clamp if we are not within the min/max interval
                    lambdaj_plus_deltalambda = lambdaj + deltalambda;
                    if(lambdaj_plus_deltalambda < minForce){
                        deltalambda = minForce - lambdaj;
                    } else if(lambdaj_plus_deltalambda > maxForce){
                        deltalambda = maxForce - lambdaj;
                    }
                    lambda[j] += deltalambda;

                    deltalambdaTot += abs(deltalambda);

                    c.addToWlambda(deltalambda);
                }

                // If the total error is small enough - stop iterate
                if(deltalambdaTot*deltalambdaTot <= tolSquared) break;
            }

            // Add result to velocity
            for(i=0; i!==Nbodies; i++){
                var b=bodies[i], v=b.velocity;
                Vadd(v, b.vlambda, v);
                b.angularVelocity += b.wlambda;
            }
        }
        errorTot = deltalambdaTot;
        return iter;
    };
