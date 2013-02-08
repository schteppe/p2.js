/**
 * spring2d.js
 * Physics library for simulating springs and bodies
 * @author Stefan Hedman <schteppe@gmail.com>
 */
var Spring2D = {};
(function(S){

    var sqrt = Math.sqrt;

    S.World = function(){
        this.springs = [];
        this.bodies = [];
        this.solver = new S.GSSolver();
        this.contacts = [];
        this.collidingBodies = [];
        this.gravity = new S.Vec2();
    };
    S.World.prototype.step = function(dt){
        var Nsprings = this.springs.length,
            springs = this.springs,
            bodies = this.bodies,
            collidingBodies=this.collidingBodies,
            g = this.gravity,
            gx = g.x,
            gy = g.y,
            solver = this.solver,
            Nbodies = this.bodies.length;

        // Reset forces, add gravity
        for(var i=0; i!==Nbodies; i++){
            bodies[i].force.set(gx,gy);
        }

        // Calculate all new spring forces
        for(var i=0; i!==Nsprings; i++){
            var s = springs[i];
            var k = s.stiffness;
            var d = s.damping;
            var l = s.restLength;
            var bodyA = s.bodyA;
            var bodyB = s.bodyB;

            var rx = bodyA.position.x - bodyB.position.x;
            var ry = bodyA.position.y - bodyB.position.y;
            var ux = bodyA.velocity.x - bodyB.velocity.x;
            var uy = bodyA.velocity.y - bodyB.velocity.y;
            var rlen = sqrt(rx*rx + ry*ry);
            var fx = -( k*(rlen-l) + d*ux*rx/rlen ) * rx/rlen;
            var fy = -( k*(rlen-l) + d*uy*ry/rlen ) * ry/rlen;

            bodyA.force.x += fx;
            bodyA.force.y += fy;
            bodyB.force.x -= fx;
            bodyB.force.y -= fy;
        }

        // Broadphase
        function checkCircleCircle(c1,c2,result){
            if(c1.position.vsub(c2.position).norm() < c1.shape.radius+c2.shape.radius){
                result.push(c1);
                result.push(c2);
            }
        }
        function checkCirclePlane(c,p,result){
            var worldNormal = new S.Mat2().setFromRotation(p.angle).vmult(new S.Vec2(0,1)); // todo: cache matrix and vecs
            if(c.position.vsub(p.position).dot(worldNormal) <= c.shape.radius){
                result.push(c);
                result.push(p);
            }
        }
        function checkCircleParticle(c,p,result){
            result.push(c);
            result.push(p);
        }
        var result = [];
        for(var i=0, Ncolliding=collidingBodies.length; i!==Ncolliding; i++){
            var bi = collidingBodies[i];
            var si = bi.shape;

            for(var j=0; j!==i; j++){
                var bj = collidingBodies[j];
                var sj = bj.shape;

                if(si instanceof S.Circle){
                         if(sj instanceof S.Circle)   checkCircleCircle  (bi,bj,result);
                    else if(sj instanceof S.Particle) checkCircleParticle(bi,bj,result);
                    else if(sj instanceof S.Plane)    checkCirclePlane   (bi,bj,result);
                } else if(si instanceof S.Particle){
                         if(sj instanceof S.Circle)   checkCircleParticle(bj,bi,result);
                } else if(si instanceof S.Plane){
                         if(sj instanceof S.Circle)   checkCirclePlane   (bj,bi,result);
                }
            }
        }

        // Generate contacts / do nearphase
        function nearphaseCircleCircle(c1,c2,result){
            var c = new S.ContactEquation(c1,c2);
            c2.position.vsub(c1.position,c.ni);
            c.ni.normalize();
            c.ni.smult(c1.shape.radius, c.ri);
            c.ni.smult(-c2.shape.radius, c.rj);
            result.push(c);
        }
        function nearphaseCircleParticle(c,p,result){
            // todo
        }
        function nearphaseCirclePlane(c,p,result){
            var contact = new S.ContactEquation(p,c);
            contact.ni = new S.Mat2().setFromRotation(p.angle).vmult(new S.Vec2(0,1));
            contact.ni.smult(-c.shape.radius, contact.rj);
            var planeToCircle = c.position.vsub(p.position);
            contact.ri = planeToCircle.vsub ( contact.ni.smult( contact.ni.dot( planeToCircle ) ) );
            result.push(contact);
        }
        var contacts = this.contacts = [];
        for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
            var bi = result[i];
            var bj = result[i+1];
            var si = bi.shape;
            var sj = bj.shape;
            if(si instanceof S.Circle){
                     if(sj instanceof S.Circle)   nearphaseCircleCircle  (bi,bj,contacts);
                else if(sj instanceof S.Particle) nearphaseCircleParticle(bi,bj,contacts);
                else if(sj instanceof S.Plane)    nearphaseCirclePlane   (bi,bj,contacts);
            } else if(si instanceof S.Particle){
                     if(sj instanceof S.Circle)   nearphaseCircleParticle(bj,bi,contacts);
            } else if(si instanceof S.Plane){
                     if(sj instanceof S.Circle)   nearphaseCirclePlane   (bj,bi,contacts);
            }
        }

        // Solver
        for(var i=0, Ncontacts=contacts.length; i!==Ncontacts; i++){
            solver.addEquation(contacts[i]);
        }
        solver.solve(dt,this);
        solver.removeAllEquations();

        // Step
        for(var i=0; i!==Nbodies; i++){
            var body = bodies[i];
            if(body.mass>0){
                var minv = 1.0 / body.mass,
                    f = body.force,
                    pos = body.position,
                    velo = body.velocity;

                body.angularVelocity += body.angularForce * body.invInertia * dt;
                velo.x += f.x * dt * minv;
                velo.y += f.y * dt * minv;
                pos.x += velo.x * dt; // Note: using new velocity to step
                pos.y += velo.y * dt;
            }
        }
    };
    S.World.prototype.addSpring = function(s){
        this.springs.push(s);
    };
    S.World.prototype.removeSpring = function(s){
        var idx = this.springs.indexOf(s);
        if(idx===-1)
            this.springs.splice(idx,1);
    };
    S.World.prototype.addBody = function(body){
        this.bodies.push(body);
        this.collidingBodies.push(body);
    };
    S.World.prototype.removeBody = function(body){
        var idx = this.bodies.indexOf(body);
        if(idx===-1)
            this.bodies.splice(idx,1);
    };

    S.Spring = function(bodyA,bodyB){
        this.restLength = 1;
        this.stiffness = 100;
        this.damping = 1;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
    };

    S.Body = function(mass,shape){
        this.shape = shape;

        this.mass = mass;
        this.invMass = mass > 0 ? 1/mass : 0;
        this.inertia = mass; // todo
        this.invInertia = this.invMass; // todo

        this.position = new S.Vec2();
        this.velocity = new S.Vec2();

        this.vlambda = new S.Vec2();
        this.wlambda = 0;

        this.angle = 0;
        this.angularVelocity = 0;

        this.force = new S.Vec2();
        this.angularForce = 0;
    };

    S.Shape = function(){};

    S.Particle = function(){
        S.Shape.apply(this);
    };

    S.Circle = function(radius){
        S.Shape.apply(this);
        this.radius = radius || 1;
    };

    S.Plane = function(){
        S.Shape.apply(this);
    };

    S.Vec2 = function(x,y){
        this.x = x||0.0;
        this.y = y||0.0;
    };
    S.Vec2.prototype.set = function(x,y){
        this.x=x;
        this.y=y;
    };
    S.Vec2.prototype.dot = function(v){
        return this.x*v.x + this.y*v.y;
    };
    S.Vec2.prototype.vadd = function(v,target){
        target = target || new S.Vec2();
        target.x = this.x + v.x;
        target.y = this.y + v.y;
        return target;
    };
    S.Vec2.prototype.vsub = function(v,target){
        target = target || new S.Vec2();
        target.x = this.x - v.x;
        target.y = this.y - v.y;
        return target;
    };
    // Vector cross product - returns magnitude of the resulting vector along the 3rd dimension
    S.Vec2.prototype.vcross = function(v){
        return this.x*v.y - this.y*v.x;
    };
    S.Vec2.prototype.normalize = function(){
        var l = this.norm();
        this.x /= l;
        this.y /= l;
    };
    S.Vec2.prototype.norm = function(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    S.Vec2.prototype.smult = function(scalar,target){
        target = target || new S.Vec2();
        target.x = this.x * scalar;
        target.y = this.y * scalar;
        return target;
    };

    S.Mat2 = function(e11,e12,e21, e22){
        this.e11 = e11||0.0;
        this.e12 = e12||0.0;
        this.e21 = e21||0.0;
        this.e22 = e22||0.0;
    };
    S.Mat2.prototype.vmult = function(v,target){
        target = target || new S.Vec2();
        target.x = this.e11*v.x + this.e12*v.y;
        target.y = this.e21*v.x + this.e22*v.y;
        return target;
    };
    S.Mat2.prototype.setIdentity = function(){
        this.e11 = 1.0;
        this.e12 = 0.0;
        this.e21 = 0.0;
        this.e22 = 1.0;
        return this;
    };
    S.Mat2.prototype.setFromRotation = function(angle){
        this.e11 =  Math.cos(angle);
        this.e12 = -Math.sin(angle);
        this.e21 =  Math.sin(angle);
        this.e22 =  Math.cos(angle);
        return this;
    };

    S.Solver = function(){
        this.equations = [];
    };
    S.Solver.prototype.solve = function(dt,world){ return 0; };
    S.Solver.prototype.addEquation = function(eq){
        this.equations.push(eq);
    };
    S.Solver.prototype.removeEquation = function(eq){
        var i = this.equations.indexOf(eq);
        if(i!=-1)
            this.equations.splice(i,1);
    };
    S.Solver.prototype.removeAllEquations = function(){
        this.equations = [];
    };

    S.Equation = function(bi,bj,minForce,maxForce){
      this.id = -1;
      this.minForce = typeof(minForce)=="undefined" ? -1e6 : minForce;
      this.maxForce = typeof(maxForce)=="undefined" ? 1e6 : maxForce;
      this.bi = bi;
      this.bj = bj;
    };
    S.Equation.prototype.constructor = S.Equation;


    S.ContactEquation = function(bi,bj){
        S.Equation.call(this,bi,bj,0,1e6);
        this.penetration = 0.0;
        this.ri = new S.Vec2();
        this.penetrationVec = new S.Vec2();
        this.rj = new S.Vec2();
        this.ni = new S.Vec2();
        this.rixn = new S.Vec2();
        this.rjxn = new S.Vec2();
        this.rixw = new S.Vec2();
        this.rjxw = new S.Vec2();

        this.invIi = new S.Mat2();
        this.invIj = new S.Mat2();

        this.relVel = new S.Vec2();
        this.relForce = new S.Vec2();
    };
    S.ContactEquation.prototype = new S.Equation();
    S.ContactEquation.prototype.constructor = S.ContactEquation;
    S.ContactEquation.prototype.computeB = function(a,b,h){
        var bi = this.bi;
        var bj = this.bj;
        var ri = this.ri;
        var rj = this.rj;
        var xi = bi.position;
        var xj = bj.position;
        var rixn = this.rixn;
        var rjxn = this.rjxn;

        var vi = bi.velocity;
        var wi = bi.angularVelocity;
        var fi = bi.force;
        var taui = bi.angularForce;

        var vj = bj.velocity;
        var wj = bj.angularVelocity;
        var fj = bj.force;
        var tauj = bj.angularForce;

        var relVel = this.relVel;
        var relForce = this.relForce;
        var penetrationVec = this.penetrationVec;
        var invMassi = bi.invMass;
        var invMassj = bj.invMass;

        var invIi = bi.invInertia;
        var invIj = bj.invInertia;

        var n = this.ni;

        // Caluclate cross products
        var rixn = this.rixn = ri.vcross(n);
        var rjxn = this.rjxn = rj.vcross(n);

        // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
        var penetrationVec = xj.vadd(rj).vsub(xi.vadd(ri));

        var Gq = n.dot(penetrationVec);

        // Compute iteration
        var GW = vj.dot(n) - vi.dot(n) + wj * rjxn - wi * rixn;
        var GiMf = fj.dot(n)*invMassj - fi.dot(n)*invMassi + invIj*tauj*rjxn - invIi*taui*rixn;

        var B = - Gq * a - GW * b - h*GiMf;

        return B;
    };
    // Compute C = GMG+eps in the SPOOK equation
    S.ContactEquation.prototype.computeC = function(eps){
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
    var computeGWlambda_ulambda = new S.Vec2();
    S.ContactEquation.prototype.computeGWlambda = function(){
        var bi = this.bi;
        var bj = this.bj;
        var ulambda = computeGWlambda_ulambda;

        var GWlambda = 0.0;
        bj.vlambda.vsub(bi.vlambda, ulambda);
        GWlambda += ulambda.dot(this.ni);

        // Angular
        GWlambda -= bi.wlambda * this.rixn;
        GWlambda += bj.wlambda * this.rjxn;

        return GWlambda;
    };
    S.ContactEquation.prototype.addToWlambda = function(deltalambda){
        var bi = this.bi;
        var bj = this.bj;
        var rixn = this.rixn;
        var rjxn = this.rjxn;
        var invMassi = bi.invMass;
        var invMassj = bj.invMass;
        var n = this.ni;

        // Add to linear velocity
        bi.vlambda.vsub(n.smult(invMassi * deltalambda),bi.vlambda);
        bj.vlambda.vadd(n.smult(invMassj * deltalambda),bj.vlambda);

        // Add to angular velocity
        bi.wlambda -= bi.invInertia * rixn * deltalambda;
        bj.wlambda += bj.invInertia * rjxn * deltalambda;
    };

    S.GSSolver = function(){
        S.Solver.call(this);
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
    };
    S.GSSolver.prototype = new S.Solver();
    S.GSSolver.prototype.setSpookParams = function(k,d){
        var h=this.h;
        this.k = k;
        this.d = d;
        this.a = 4.0 / (h * (1 + 4 * d));
        this.b = (4.0 * d) / (1 + 4 * d);
        this.eps = 4.0 / (h * h * k * (1 + 4 * d));
    };
    S.GSSolver.prototype.solve = function(dt,world){
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
        var invCs = [];
        var Bs = [];

        // Create array for lambdas
        var lambda = [];
        for(var i=0; i!==Neq; i++){
            var c = equations[i];
            lambda.push(0.0);
            Bs.push(c.computeB(a,b,h));
            invCs.push(1.0 / c.computeC(eps));
        }

        var q, B, c, invC, deltalambda, deltalambdaTot, GWlambda, lambdaj;

        if(Neq !== 0){
            var i,j,abs=Math.abs;

            // Reset vlambda
            for(i=0; i!==Nbodies; i++){
                var b=bodies[i], vlambda=b.vlambda;
                vlambda.set(0,0);
                b.wlambda = 0;
            }

            // Iterate over equations
            for(iter=0; iter!==maxIter; iter++){

                // Accumulate the total error for each iteration.
                deltalambdaTot = 0.0;

                for(j=0; j!==Neq; j++){

                    c = equations[j];

                    // Compute iteration
                    B = Bs[j];
                    invC = invCs[j];
                    lambdaj = lambda[j];
                    GWlambda = c.computeGWlambda(eps);
                    deltalambda = invC * ( B - GWlambda - eps * lambdaj );

                    // Clamp if we are not within the min/max interval
                    if(lambdaj + deltalambda < c.minForce){
                        deltalambda = c.minForce - lambdaj;
                    } else if(lambdaj + deltalambda > c.maxForce){
                        deltalambda = c.maxForce - lambdaj;
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
                v.vadd(b.vlambda, v);
                b.angularVelocity += b.wlambda;
            }
        }
        errorTot = deltalambdaTot;
        return iter; 
    };

})(Spring2D);