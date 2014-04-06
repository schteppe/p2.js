p2.js
=====

2D rigid body physics engine written in JavaScript. Includes collision detection, contacts, friction, restitution, motors, springs, advanced constraints and various shape types.

[Demos](#demos) | [Examples](#examples) | [Documentation](http://schteppe.github.io/p2.js/docs/) | [Download](https://raw.github.com/schteppe/p2.js/master/build/p2.js)

### Demos
* [Car](http://schteppe.github.io/p2.js/demos/car.html)
* [Circle container](http://schteppe.github.io/p2.js/demos/circles.html)
* [Collision tests](http://schteppe.github.io/p2.js/demos/collisions.html)
* [Compound objects](http://schteppe.github.io/p2.js/demos/compound.html)
* [Concave objects](http://schteppe.github.io/p2.js/demos/concave.html)
* [Constraints](http://schteppe.github.io/p2.js/demos/constraints.html)
* [Fixed rotation](http://schteppe.github.io/p2.js/demos/fixedRotation.html)
* [Friction](http://schteppe.github.io/p2.js/demos/friction.html)
* [Gear constraint](http://schteppe.github.io/p2.js/demos/gearConstraint.html)
* [Heightfield](http://schteppe.github.io/p2.js/demos/heightfield.html)
* [Island solver](http://schteppe.github.io/p2.js/demos/islandSolver.html)
* [Lock constraint](http://schteppe.github.io/p2.js/demos/lock.html)
* [Piston](http://schteppe.github.io/p2.js/demos/piston.html)
* [Prismatic constraint](http://schteppe.github.io/p2.js/demos/prismatic.html)
* [Ragdoll](http://schteppe.github.io/p2.js/demos/ragdoll.html)
* [Sensor](http://schteppe.github.io/p2.js/demos/removeSensor.html)
* [Restitution](http://schteppe.github.io/p2.js/demos/restitution.html)
* [Sleep](http://schteppe.github.io/p2.js/demos/sleep.html)
* [Springs](http://schteppe.github.io/p2.js/demos/springs.html)
* [Tearable constraints](http://schteppe.github.io/p2.js/demos/tearable.html)
* [Surface velocity](http://schteppe.github.io/p2.js/demos/surfaceVelocity.html)
* [Suspension](http://schteppe.github.io/p2.js/demos/suspension.html)

### Examples
Examples showing how to use p2.js with your favorite renderer.

* [Canvas: Circle on plane](http://schteppe.github.io/p2.js/examples/canvas/circle.html)
* [Canvas: Box on plane](http://schteppe.github.io/p2.js/examples/canvas/box.html)
* [Canvas: Asteroids game](http://schteppe.github.io/p2.js/examples/canvas/asteroids.html)
* [Pixi.js: Box on plane](http://schteppe.github.io/p2.js/examples/pixijs/box.html)

More examples coming soon.

### Sample code
The following example uses the [World](http://schteppe.github.io/p2.js/docs/classes/World.html), [Circle](http://schteppe.github.io/p2.js/docs/classes/Circle.html), [Body](http://schteppe.github.io/p2.js/docs/classes/Body.html) and [Plane](http://schteppe.github.io/p2.js/docs/classes/Plane.html) classes to set up a simple physics scene with a ball on a plane.
```js
// Setup our world
var world = new p2.World({ gravity:[0,-9.82] });

// Create a circle
var radius = 1,
    circleShape = new p2.Circle(radius),
    circleBody = new p2.Body({ mass:5, position:[0,10] });
circleBody.addShape(circleShape);

// Create a plane
var groundShape = new p2.Plane(),
    groundBody = new p2.Body({ mass:0 });
groundBody.addShape(groundShape);

// Add the bodies to the world
world.addBody(circleBody);
world.addBody(groundBody);

// Step the simulation
setInterval(function(){
    world.step(1.0/60.0);
    console.log("Circle y position: " + circleBody.position[1]);
}, 1000.0/60.0);
```

### Install
##### Browser
Download either [p2.js](build/p2.js) or the minified [p2.min.js](build/p2.min.js) and include the script in your HTML:
```html
<script src="p2.js" type="text/javascript"></script>
```
##### Node.js
Until the code gets somewhat more stable, use the git url to install:
```
npm install git://github.com/schteppe/p2.js
```
Or add the dependency to your ```package.json```:
```
    ...
    "dependencies" : {
        "p2" : "git://github.com/schteppe/p2.js"
    }
    ...
```
Then require it like so:
```js
var p2 = require('p2');
```

### Supported collision pairs
|                                                                              | Circle | Plane | Rectangle | Convex | Particle | Line   | Capsule | Heightfield |
| :--------------------------------------------------------------------------: |:------:|:-----:|:---------:|:------:|:--------:|:------:|:-------:|:-----------:|
| [Circle](http://schteppe.github.io/p2.js/docs/classes/Circle.html)           | Yes    | Yes   | Yes       | Yes    | Yes      | Yes    | Yes     | Yes         |
| [Plane](http://schteppe.github.io/p2.js/docs/classes/Plane.html)             | -      | -     | Yes       | Yes    | Yes      | Yes    | Yes     | -           |
| [Rectangle](http://schteppe.github.io/p2.js/docs/classes/Rectangle.html)     | -      | -     | Yes       | Yes    | Yes      | (todo) | Yes     | (todo)      |
| [Convex](http://schteppe.github.io/p2.js/docs/classes/Convex.html)           | -      | -     | -         | Yes    | Yes      | (todo) | Yes     | (todo)      |
| [Particle](http://schteppe.github.io/p2.js/docs/classes/Particle.html)       | -      | -     | -         | -      | -        | -      | Yes     | (todo)      |
| [Line](http://schteppe.github.io/p2.js/docs/classes/Line.html)               | -      | -     | -         | -      | -        | (todo) | (todo)  | (todo)      |
| [Capsule](http://schteppe.github.io/p2.js/docs/classes/Capsule.html)         | -      | -     | -         | -      | -        | -      | Yes     | (todo)      |
| [Heightfield](http://schteppe.github.io/p2.js/docs/classes/Heightfield.html) | -      | -     | -         | -      | -        | -      | -       | -           |

Note that concave polygon shapes can be created using [Body.fromPolygon](http://schteppe.github.io/p2.js/docs/classes/Body.html#method_fromPolygon).

### Unit testing
Tests are written for [Nodeunit](https://github.com/caolan/nodeunit). Run the tests with the command ```grunt test```.

### Contribute
Make sure you have git, [Node.js](http://nodejs.org), NPM and [grunt](http://gruntjs.com/) installed.
```
git clone https://github.com/schteppe/p2.js.git; # Clone the repo
cd p2.js;
npm install;                                     # Install dependencies
                                                 # (make changes to source)
grunt;                                           # Builds build/p2.js and build/p2.min.js
```
The most recent commits are currently pushed to the ```master``` branch. Thanks for contributing!