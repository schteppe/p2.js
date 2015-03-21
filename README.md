p2.js
=====

2D rigid body physics engine written in JavaScript. Includes collision detection, contacts, friction, restitution, motors, springs, advanced constraints and various shape types.

[Demos](#demos) | [Examples](#examples) | [Documentation](http://schteppe.github.io/p2.js/docs/) | [Download](https://raw.github.com/schteppe/p2.js/master/build/p2.js) | [CDN](http://cdnjs.com/libraries/p2.js)

### Featured projects using p2.js
* [Google I/O 2015 Experiment](http://www.chromeexperiments.com/detail/io-2015-experiment) by Instrument
* [PixiLights, a Christmas Experiment](http://christmasexperiments.com/experiments/11) by Mat Groves

### Demos
These demos use the p2 Demo framework, which provides rendering and interactivity. Use mouse/touch to throw or create objects. Use the right menu (or console!) to tweak parameters. Or just check the source to see how to programmatically build the current scene using p2.

* [Car](http://schteppe.github.io/p2.js/demos/car.html)
* [Circle container](http://schteppe.github.io/p2.js/demos/circles.html)
* [Collision tests](http://schteppe.github.io/p2.js/demos/collisions.html)
* [Compound objects](http://schteppe.github.io/p2.js/demos/compound.html)
* [Concave objects](http://schteppe.github.io/p2.js/demos/concave.html)
* [Constraints](http://schteppe.github.io/p2.js/demos/constraints.html)
* [DistanceConstraint](http://schteppe.github.io/p2.js/demos/distanceConstraint.html)
* [Fixed rotation](http://schteppe.github.io/p2.js/demos/fixedRotation.html)
* [Friction](http://schteppe.github.io/p2.js/demos/friction.html)
* [Gear constraint](http://schteppe.github.io/p2.js/demos/gearConstraint.html)
* [Heightfield](http://schteppe.github.io/p2.js/demos/heightfield.html)
* [Island solver](http://schteppe.github.io/p2.js/demos/islandSolver.html)
* [Kinematic body](http://schteppe.github.io/p2.js/demos/kinematic.html)
* [Lock constraint](http://schteppe.github.io/p2.js/demos/lock.html)
* [Piston](http://schteppe.github.io/p2.js/demos/piston.html)
* [Prismatic constraint](http://schteppe.github.io/p2.js/demos/prismatic.html)
* [Ragdoll](http://schteppe.github.io/p2.js/demos/ragdoll.html)
* [Sensor](http://schteppe.github.io/p2.js/demos/removeSensor.html)
* [Restitution](http://schteppe.github.io/p2.js/demos/restitution.html)
* [Sleep](http://schteppe.github.io/p2.js/demos/sleep.html)
* [Springs](http://schteppe.github.io/p2.js/demos/springs.html)
* [Surface velocity](http://schteppe.github.io/p2.js/demos/surfaceVelocity.html)
* [Suspension](http://schteppe.github.io/p2.js/demos/suspension.html)
* [Tearable constraints](http://schteppe.github.io/p2.js/demos/tearable.html)

### Examples
Examples showing how to use p2.js with your favorite renderer.

* [Canvas: Asteroids game](http://schteppe.github.io/p2.js/examples/canvas/asteroids.html)
* [Canvas: Box on plane](http://schteppe.github.io/p2.js/examples/canvas/box.html)
* [Canvas: Character demo](http://schteppe.github.io/p2.js/examples/canvas/character.html)
* [Canvas: Circle on plane](http://schteppe.github.io/p2.js/examples/canvas/circle.html)
* [Canvas: Interpolation](http://schteppe.github.io/p2.js/examples/canvas/interpolation.html)
* [Canvas: Mousejoint](http://schteppe.github.io/p2.js/examples/canvas/mouseJoint.html)
* [Canvas: Sensors](http://schteppe.github.io/p2.js/examples/canvas/sensors.html)
* [Canvas: Sensors 2](http://schteppe.github.io/p2.js/examples/canvas/sensors2.html)
* [Pixi.js: Box on plane](http://schteppe.github.io/p2.js/examples/pixijs/box.html)

### Sample code
The following example uses the [World](http://schteppe.github.io/p2.js/docs/classes/World.html), [Circle](http://schteppe.github.io/p2.js/docs/classes/Circle.html), [Body](http://schteppe.github.io/p2.js/docs/classes/Body.html) and [Plane](http://schteppe.github.io/p2.js/docs/classes/Plane.html) classes to set up a simple physics scene with a ball on a plane.
```js
// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity:[0, -9.82]
});

// Create an empty dynamic body
var circleBody = new p2.Body({
    mass: 5,
    position: [0, 10]
});

// Add a circle shape to the body.
var radius = 1;
var circleShape = new p2.Circle(radius);
circleBody.addShape(circleShape);

// ...and add the body to the world.
// If we don't add it to the world, it won't be simulated.
world.addBody(circleBody);

// Create an infinite ground plane.
var groundBody = new p2.Body({
    mass: 0 // Setting mass to 0 makes the body static
});
var groundShape = new p2.Plane();
groundBody.addShape(groundShape);
world.addBody(groundBody);

// To get the trajectories of the bodies,
// we must step the world forward in time.
// This is done using a fixed time step size.
var timeStep = 1 / 60; // seconds

// The "Game loop". Could be replaced by, for example, requestAnimationFrame.
setInterval(function(){

    // The step method moves the bodies forward in time.
    world.step(timeStep);

    // Print the circle position to console.
    // Could be replaced by a render call.
    console.log("Circle y position: " + circleBody.position[1]);

}, 1000 * timeStep);
```

### Install
##### Browser
Download either [p2.js](build/p2.js) or the minified [p2.min.js](build/p2.min.js) and include the script in your HTML:
```html
<script src="p2.js" type="text/javascript"></script>
```

If you would like to use ordinary ```Array``` instead of ```Float32Array```, define ```GLMAT_ARRAY_TYPE``` globally before loading the library.

```html
<script type="text/javascript">GLMAT_ARRAY_TYPE = Array;</script>
<script src="p2.js" type="text/javascript"></script>
```

##### Node.js
```
npm install p2
```
Then require it like so:
```js
var p2 = require('p2');
```

### Supported collision pairs
|                                                                              | Circle | Plane | Rectangle | Convex | Particle | Line   | Capsule | Heightfield | Ray    |
| :--------------------------------------------------------------------------: |:------:|:-----:|:---------:|:------:|:--------:|:------:|:-------:|:-----------:|:------:|
| [Circle](http://schteppe.github.io/p2.js/docs/classes/Circle.html)           | Yes    | -     | -         | -      | -        | -      | -       | -           | -      |
| [Plane](http://schteppe.github.io/p2.js/docs/classes/Plane.html)             | Yes    | -     | -         | -      | -        | -      | -       | -           | -      |
| [Rectangle](http://schteppe.github.io/p2.js/docs/classes/Rectangle.html)     | Yes    | Yes   | Yes       | -      | -        | -      | -       | -           | -      |
| [Convex](http://schteppe.github.io/p2.js/docs/classes/Convex.html)           | Yes    | Yes   | Yes       | Yes    | -        | -      | -       | -           | -      |
| [Particle](http://schteppe.github.io/p2.js/docs/classes/Particle.html)       | Yes    | Yes   | Yes       | Yes    | -        | -      | -       | -           | -      |
| [Line](http://schteppe.github.io/p2.js/docs/classes/Line.html)               | Yes    | Yes   | (todo)    | (todo) | -        | (todo) | -       | -           | -      |
| [Capsule](http://schteppe.github.io/p2.js/docs/classes/Capsule.html)         | Yes    | Yes   | Yes       | Yes    | Yes      | (todo) | Yes     | -           | -      |
| [Heightfield](http://schteppe.github.io/p2.js/docs/classes/Heightfield.html) | Yes    | -     | Yes       | Yes    | (todo)   | (todo) | (todo)  | (todo)      | -      |
| Ray                                                                          | Yes    | Yes   | Yes       | (todo) | -        | (todo) | (todo)  | (todo)      | -      |

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
