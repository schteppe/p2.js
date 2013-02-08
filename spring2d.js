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
        this.gravity = new S.Vec2();
    };
    S.World.prototype.step = function(dt){
        var Nsprings = this.springs.length,
            springs = this.springs,
            bodies = this.bodies
            g = this.gravity,
            gx = g.x,
            gy = g.y,
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

        // Step
        for(var i=0; i!==Nbodies; i++){
            var body = bodies[i];
            if(body.mass>0){
                var minv = 1.0 / body.mass,
                    f = body.force,
                    pos = body.position,
                    velo = body.velocity;
                velo.x += f.x * dt * minv;
                velo.y += f.y * dt * minv;
                pos.x += velo.x * dt; // body: using new velocity to step
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

    S.Body = function(shape){
        this.mass = 1;
        this.position = new S.Vec2(0,0);
        this.velocity = new S.Vec2(0,0);
        this.force = new S.Vec2(0,0);
        this.shape = shape;
    };

    S.Shape = function(){};

    S.Particle = function(){
        S.Shape.apply(this);
    };

    S.Circle = function(){
        S.Shape.apply(this);
        this.radius = 1;
    };

    S.Vec2 = function(x,y){
        this.x = x||0.0;
        this.y = y||0.0;
    };
    S.Vec2.prototype.set = function(x,y){
        this.x=x;
        this.y=y;
    };

})(Spring2D);