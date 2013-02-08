p2.js
===========

JavaScript 2D physics library

## Usage
```
// Create a world
var world = new p2.World();

// Create two particles, connect them with a spring
var a = new p2.Particle();
a.position.set(0,0);
var b = new p2.Particle();
b.position.set(1,0);
var spring = new p2.Spring(a,b);
spring.restLength = 1;
spring.stiffness = 100;

// Step the world
var timeStep = 1/60;
world.step(timeStep);
```