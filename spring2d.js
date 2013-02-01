/**
 * spring2d.js
 * Physics library for simulating springs and particles
 * @author Stefan Hedman <schteppe@gmail.com>
 */
var Spring2D = {};
(function(S){

    var sqrt = Math.sqrt;

    S.World = function(){
        this.springs = [];
        this.particles = [];
        this.gravity = new S.Vec2();
    };
    S.World.prototype.step = function(dt){
        var Nsprings = this.springs.length,
            springs = this.springs,
            particles = this.particles
            g = this.gravity,
            gx = g.x,
            gy = g.y,
            Nparticles = this.particles.length;

        // Reset forces, add gravity
        for(var i=0; i!==Nparticles; i++){
            particles[i].force.set(gx,gy);
        }

        // Calculate all new forces
        for(var i=0; i!==Nsprings; i++){
            var s = springs[i];
            var k = s.stiffness;
            var d = s.damping;
            var l = s.restLength;
            var particleA = s.particleA;
            var particleB = s.particleB;

            var rx = particleA.position.x - particleB.position.x;
            var ry = particleA.position.y - particleB.position.y;
            var ux = particleA.velocity.x - particleB.velocity.x;
            var uy = particleA.velocity.y - particleB.velocity.y;
            var rlen = sqrt(rx*rx + ry*ry);
            var fx = -( k*(rlen-l) + d*ux*rx/rlen ) * rx/rlen;
            var fy = -( k*(rlen-l) + d*uy*ry/rlen ) * ry/rlen;

            particleA.force.x += fx;
            particleA.force.y += fy;
            particleB.force.x -= fx;
            particleB.force.y -= fy;
        }

        // Step
        for(var i=0; i!==Nparticles; i++){
            var particle = particles[i];
            if(particle.mass>0){
                var minv = 1.0 / particle.mass,
                    f = particle.force,
                    pos = particle.position,
                    velo = particle.velocity;
                velo.x += f.x * dt * minv;
                velo.y += f.y * dt * minv;
                pos.x += velo.x * dt; // Particle: using new velocity to step
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
    S.World.prototype.addParticle = function(particle){
        this.particles.push(particle);
    };
    S.World.prototype.removeParticle = function(particle){
        var idx = this.particles.indexOf(particle);
        if(idx===-1)
            this.particles.splice(idx,1);
    };

    S.Spring = function(particleA,particleB){
        this.restLength = 1;
        this.stiffness = 100;
        this.damping = 1;
        this.particleA = particleA;
        this.particleB = particleB;
    };

    S.Particle = function(){
        this.mass = 1;
        this.position = new S.Vec2(0,0);
        this.velocity = new S.Vec2(0,0);
        this.force = new S.Vec2(0,0);
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