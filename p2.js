/**
 * p2.js
 * 2D physics library
 * @author Stefan Hedman <schteppe@gmail.com>
 */
var p2 = {};
(function(p2){

    var vecCount = 0;
    var matCount = 0;
    var ARRAY_TYPE = Float32Array;

    var cos = Math.cos;
    var sin = Math.sin;
    var sqrt = Math.sqrt;
    var floor = Math.floor;

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

    var V = p2.V = p2.tVec2;
    var M = p2.M = p2.tMat2;
    var Vadd = V.add;
    var Vscale = V.scale;
    var Vsub = V.subtract;
    var Vdot = V.dot;
    var Vnorm2 = V.norm2;


    // Broadphase
    var dist = V.create();
    var rot = M.create();
    var worldNormal = V.create();
    var yAxis = V.create(0,1);
    function checkCircleCircle(c1,c2,result){
        Vsub(c1.position,c2.position,dist);
        var R1 = c1.shape.radius;
        var R2 = c2.shape.radius;
        if(Vnorm2(dist) < (R1+R2)*(R1+R2)){
            result.push(c1);
            result.push(c2);
        }
    }
    function checkCirclePlane(c,p,result){
        Vsub(c.position,p.position,dist);
        M.setFromRotation(rot,p.angle);
        M.vectorMultiply(rot,yAxis,worldNormal);
        if(V.dot(dist,worldNormal) <= c.shape.radius){
            result.push(c);
            result.push(p);
        }
    }
    function checkCircleParticle(c,p,result){
        result.push(c);
        result.push(p);
    }

    // Generate contacts / do nearphase
    function nearphaseCircleCircle(c1,c2,result,oldContacts){
        //var c = new p2.ContactEquation(c1,c2);
        var c = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(c1,c2);
        c.bi = c1;
        c.bj = c2;
        Vsub(c2.position,c1.position,c.ni);
        V.normalize(c.ni,c.ni);
        Vscale(c.ni, c1.shape.radius, c.ri);
        Vscale(c.ni,-c2.shape.radius, c.rj);
        result.push(c);
    }
    function nearphaseCircleParticle(c,p,result,oldContacts){
        // todo
    }
    var nearphaseCirclePlane_rot = M.create();
    var nearphaseCirclePlane_planeToCircle = V.create();
    var nearphaseCirclePlane_temp = V.create();
    function nearphaseCirclePlane(c,p,result,oldContacts){
        var rot = nearphaseCirclePlane_rot;
        var contact = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(p,c);
        contact.bi = p;
        contact.bj = c;
        var planeToCircle = nearphaseCirclePlane_planeToCircle;
        var temp = nearphaseCirclePlane_temp;

        M.setFromRotation(rot,p.angle);
        M.vectorMultiply(rot,yAxis,contact.ni);

        V.scale(contact.ni, -c.shape.radius, contact.rj);

        V.subtract(c.position,p.position,planeToCircle);
        var d = V.dot(contact.ni , planeToCircle );
        V.scale(contact.ni,d,temp);
        V.subtract(planeToCircle , temp , contact.ri );

        result.push(contact);
    }

    var step_r = V.create();
    var step_runit = V.create();
    var step_u = V.create();
    var step_f = V.create();
    var step_fhMinv = V.create();
    var step_velodt = V.create();
    function now(){
        if(performance.now) return performance.now();
        else if(performance.webkitNow) return performance.webkitNow();
        else new Date().getTime();
    }

    p2.Broadphase = function(){

    };
    p2.NaiveBroadphase = function(){
        p2.Broadphase.apply(this);
        this.getCollisionPairs = function(world){
            var collidingBodies = world.collidingBodies;
            var result = [];
            for(var i=0, Ncolliding=collidingBodies.length; i!==Ncolliding; i++){
                var bi = collidingBodies[i];
                var si = bi.shape;
                for(var j=0; j!==i; j++){
                    var bj = collidingBodies[j];
                    var sj = bj.shape;
                    if(si instanceof p2.Circle){
                             if(sj instanceof p2.Circle)   checkCircleCircle  (bi,bj,result);
                        else if(sj instanceof p2.Particle) checkCircleParticle(bi,bj,result);
                        else if(sj instanceof p2.Plane)    checkCirclePlane   (bi,bj,result);
                    } else if(si instanceof p2.Particle){
                             if(sj instanceof p2.Circle)   checkCircleParticle(bj,bi,result);
                    } else if(si instanceof p2.Plane){
                             if(sj instanceof p2.Circle)   checkCirclePlane   (bj,bi,result);
                    }
                }
            }
            return result;
        };
    };
    p2.NaiveBroadphase.prototype = new p2.Broadphase();
    p2.GridBroadphase = function(xmin,xmax,ymin,ymax,nx,ny){
        p2.Broadphase.apply(this);

        nx = nx || 10;
        ny = ny || 10;
        var binsizeX = (xmax-xmin) * nx;
        var binsizeY = (ymax-ymin) * ny;

        function getBinIndex(x,y){
            var xi = Math.floor(nx * (x - xmin) / (xmax-xmin));
            var yi = Math.floor(ny * (y - ymin) / (ymax-ymin));
            return xi*ny + yi;
        }

        this.getCollisionPairs = function(world){
            var result = [];
            var collidingBodies = world.collidingBodies;
            var Ncolliding = Ncolliding=collidingBodies.length;

            var bins=[], Nbins=nx*ny;
            for(var i=0; i<Nbins; i++)
                bins.push([]);

            var xmult = nx / (xmax-xmin);
            var ymult = ny / (ymax-ymin)

            // Put all bodies into bins
            for(var i=0; i!==Ncolliding; i++){
                var bi = collidingBodies[i];
                var si = bi.shape;

                if(si instanceof p2.Circle){
                    // Put in bin
                    // check if overlap with other bins
                    var x = V.getX(bi.position);
                    var y = V.getY(bi.position);
                    var r = si.radius;

                    var xi1 = floor(xmult * (x-r - xmin));
                    var yi1 = floor(ymult * (y-r - ymin));
                    var xi2 = floor(xmult * (x+r - xmin));
                    var yi2 = floor(ymult * (y+r - ymin));

                    for(var j=xi1; j<=xi2; j++){
                        for(var k=yi1; k<=yi2; k++){
                            var xi = j;
                            var yi = k;
                            if(xi*ny + yi >= 0 && xi*ny + yi < Nbins)
                                bins[ xi*ny + yi ].push(bi);
                        }
                    }
                } else if(si instanceof p2.Plane){
                    // Put in all bins for now
                    // Todo: check if the distance to the plane is less than some value
                    for(var j=0; j!==Nbins; j++) bins[j].push(bi);
                } else {
                    throw new Error("Shape not supported in GridBroadphase!");
                }
            }

            // Check each bin
            for(var i=0; i!==Nbins; i++){
                var bin = bins[i];
                for(var j=0, NbodiesInBin=bin.length; j!==NbodiesInBin; j++){
                    var bi = bin[j];
                    var si = bi.shape;

                    for(var k=0; k!==j; k++){
                        var bj = bin[k];
                        var sj = bj.shape;

                        if(si instanceof p2.Circle){
                                 if(sj instanceof p2.Circle)   checkCircleCircle  (bi,bj,result);
                            else if(sj instanceof p2.Particle) checkCircleParticle(bi,bj,result);
                            else if(sj instanceof p2.Plane)    checkCirclePlane   (bi,bj,result);
                        } else if(si instanceof p2.Particle){
                                 if(sj instanceof p2.Circle)   checkCircleParticle(bj,bi,result);
                        } else if(si instanceof p2.Plane){
                                 if(sj instanceof p2.Circle)   checkCirclePlane   (bj,bi,result);
                        }
                    }
                }
            }
            return result;
        };
    };
    p2.GridBroadphase.prototype = new p2.Broadphase();

    p2.World = function(broadphase){
        this.springs = [];
        this.bodies = [];
        this.solver = new p2.GSSolver();
        this.contacts = [];
        this.oldContacts = [];
        this.collidingBodies = [];
        this.gravity = V.create();
        this.lastStepTime = 0.0;
        this.broadphase = broadphase || new p2.NaiveBroadphase();
    };
    p2.World.prototype.step = function(dt){
        var t0 = now();
        vecCount = 0; // Start counting vector creations
        matCount = 0;
        var Nsprings = this.springs.length,
            springs = this.springs,
            bodies = this.bodies,
            collidingBodies=this.collidingBodies,
            g = this.gravity,
            solver = this.solver,
            Nbodies = this.bodies.length,
            broadphase = this.broadphase;

        // Reset forces, add gravity
        for(var i=0; i!==Nbodies; i++)
            V.copy(g,bodies[i].force);

        // Calculate all new spring forces
        for(var i=0; i!==Nsprings; i++){
            var s = springs[i];
            var k = s.stiffness;
            var d = s.damping;
            var l = s.restLength;
            var bodyA = s.bodyA;
            var bodyB = s.bodyB;
            var r = step_r;
            var r_unit = step_runit;
            var u = step_u;
            var f = step_f;

            Vsub(bodyA.position,bodyB.position,r);
            Vsub(bodyA.velocity,bodyB.velocity,u);
            var rlen = V.norm(r);
            V.normalize(r,r_unit);
            Vscale(r_unit, k*(rlen-l) + d*V.dot(u,r_unit), f);
            Vsub(bodyA.force, f, bodyA.force);
            Vadd(bodyB.force, f, bodyB.force);
        }

        // Broadphase
        var result = broadphase.getCollisionPairs(this);

        var oldContacts = this.contacts.concat(this.oldContacts);
        var contacts = this.contacts = [];
        for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
            var bi = result[i];
            var bj = result[i+1];
            var si = bi.shape;
            var sj = bj.shape;
            if(si instanceof p2.Circle){
                     if(sj instanceof p2.Circle)   nearphaseCircleCircle  (bi,bj,contacts,oldContacts);
                else if(sj instanceof p2.Particle) nearphaseCircleParticle(bi,bj,contacts,oldContacts);
                else if(sj instanceof p2.Plane)    nearphaseCirclePlane   (bi,bj,contacts,oldContacts);
            } else if(si instanceof p2.Particle){
                     if(sj instanceof p2.Circle)   nearphaseCircleParticle(bj,bi,contacts,oldContacts);
            } else if(si instanceof p2.Plane){
                     if(sj instanceof p2.Circle)   nearphaseCirclePlane   (bj,bi,contacts,oldContacts);
            }
        }
        this.oldContacts = oldContacts;

        // Solver
        for(var i=0, Ncontacts=contacts.length; i!==Ncontacts; i++){
            solver.addEquation(contacts[i]);
        }
        solver.solve(dt,this);
        solver.removeAllEquations();

        // Step
        var fhMinv = step_fhMinv;
        var velodt = step_velodt;
        for(var i=0; i!==Nbodies; i++){
            var body = bodies[i];
            if(body.mass>0){
                var minv = 1.0 / body.mass,
                    f = body.force,
                    pos = body.position,
                    velo = body.velocity;
                body.angularVelocity += body.angularForce * body.invInertia * dt;
                Vscale(f,dt*minv,fhMinv);
                Vadd(fhMinv,velo,velo);
                Vscale(velo,dt,velodt);
                Vadd(pos,velodt,pos);
            }
        }

        var t1 = now();
        this.lastStepTime = t1-t0;
        this.vecCreations = vecCount;
        this.matCreations = matCount;
    };
    p2.World.prototype.addSpring = function(s){
        this.springs.push(s);
    };
    p2.World.prototype.removeSpring = function(s){
        var idx = this.springs.indexOf(s);
        if(idx===-1)
            this.springs.splice(idx,1);
    };
    p2.World.prototype.addBody = function(body){
        this.bodies.push(body);
        this.collidingBodies.push(body);
    };
    p2.World.prototype.removeBody = function(body){
        var idx = this.bodies.indexOf(body);
        if(idx===-1)
            this.bodies.splice(idx,1);
    };

    p2.Spring = function(bodyA,bodyB){
        this.restLength = 1;
        this.stiffness = 100;
        this.damping = 1;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
    };

    p2.Body = function(mass,shape){
        this.shape = shape;

        this.mass = mass;
        this.invMass = mass > 0 ? 1/mass : 0;
        this.inertia = mass; // todo
        this.invInertia = this.invMass; // todo

        this.position = V.create();
        this.velocity = V.create();

        this.vlambda = V.create();
        this.wlambda = 0;

        this.angle = 0;
        this.angularVelocity = 0;

        this.force = V.create();
        this.angularForce = 0;
    };

    p2.Shape = function(){};

    p2.Particle = function(){
        p2.Shape.apply(this);
    };

    p2.Circle = function(radius){
        p2.Shape.apply(this);
        this.radius = radius || 1;
    };

    p2.Plane = function(){
        p2.Shape.apply(this);
    };

    p2.Solver = function(){
        this.equations = [];
    };
    p2.Solver.prototype.solve = function(dt,world){ return 0; };
    p2.Solver.prototype.addEquation = function(eq){
        this.equations.push(eq);
    };
    p2.Solver.prototype.removeEquation = function(eq){
        var i = this.equations.indexOf(eq);
        if(i!=-1)
            this.equations.splice(i,1);
    };
    p2.Solver.prototype.removeAllEquations = function(){
        this.equations = [];
    };

    p2.Equation = function(bi,bj,minForce,maxForce){
      this.id = -1;
      this.minForce = typeof(minForce)=="undefined" ? -1e6 : minForce;
      this.maxForce = typeof(maxForce)=="undefined" ? 1e6 : maxForce;
      this.bi = bi;
      this.bj = bj;
    };
    p2.Equation.prototype.constructor = p2.Equation;

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
        var rixn = this.rixn = V.cross(ri,n);
        var rjxn = this.rjxn = V.cross(rj,n);
        

        // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
        V.set(penetrationVec,0,0);
        V.add(xj,rj,penetrationVec);
        V.subtract(penetrationVec,xi,penetrationVec);
        V.subtract(penetrationVec,ri,penetrationVec);

        var Gq = V.dot(n,penetrationVec);

        // Compute iteration
        var GW = V.dot(vj,n) - V.dot(vi,n) + wj * rjxn - wi * rixn;
        var GiMf = V.dot(fj,n)*invMassj - V.dot(fi,n)*invMassi + invIj*tauj*rjxn - invIi*taui*rixn;

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
            var i,j,abs=Math.abs;

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
                V.add(v, b.vlambda, v);
                b.angularVelocity += b.wlambda;
            }
        }
        errorTot = deltalambdaTot;
        return iter; 
    };

})(p2);