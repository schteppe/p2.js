spring2d.js
===========

JavaScript 2D particle/spring physics library

## Usage
```
// Create a world
var world = new Spring2D.World();

// Create two particles, connect them with a spring
var p1 = new Spring2D.Particle();
p2.position.set(0,0);
var p2 = new Spring2D.Particle();
p2.position.set(1,0);
var spring = new Spring2D.Spring(p1,p2);
spring.restLength = 1;
spring.stiffness = 100;

// Step the world
var timeStep = 1/60;
world.step(timeStep);
```