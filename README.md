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
Tests are written for Nodeunit. Run the tests with the command ```grunt test```.

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

### Change log

##### 0.5.0
* Added property ```.enableIslandSleeping``` to ```World```.
* Added property ```.useFrictionGravityOnZeroGravity``` to ```World```.
* Renamed ```.useWorldGravityForFrictionApproximation``` in ```World``` to ```.useWorldGravityAsFrictionGravity``` to keep things more uniform.
* Sleep improvements.
* Added property ```.frictionIterations``` to ```GSSolver```, and removed ```.skipFrictionIterations```.
* Upgraded to gl-matrix ```2.1.0```.
* Removed ```QuadTree```.
* Removed ```mat2```.
* Added ```Utils.extend```.
* Added methods ```.setStiffness``` and ```.setRelaxation``` methods to ```Constraint```.
* Removed properties ```.stiffness```, ```.relaxation``` and ```.useGlobalEquationParameters``` from ```GSSolver```.
* Added methods ```.setGlobalStiffness```, ```.setGlobalRelaxation```, ```.setGlobalEquationParameters``` to ```World```.
* Renamed property ```.eps``` to ```.epsilon``` for ```Equation```.
* Removed property ```.useBoundingBoxes``` from ```NaiveBroadphase``` in favor of the new property ```.boundingVolumeType``` in ```Broadphase```.
* Added methods ```.getMaxForce``` and ```.setMaxForce``` to ```LockConstraint```.
* Changed property names ```.bi```, ```.bj```, ```.ni```, ```.ri```, ```.rj``` to ```.bodyA```, ```.bodyB```, ```.normalA```, ```.contactPointA```, ```.contactPointB``` in ```Equation```, ```ContactEquation``` and ```FrictionEquation``` classes.
* Removed ```IslandSolver``` in favor of the new property ```World.islandSplit```.
* Changed constructors of the ```Constraints``` so they all take an ```options``` object as last parameter.
* Added property ```.collideConnected``` to ```Constraint```.
* Added property ```.islandSplit``` to ```World```.
* Added methods ```.disableBodyCollision``` and ```.enableBodyCollision``` to ```World```.
* Added properties ```.useWorldGravityForFrictionApproximation``` and ```.frictionGravity``` to ```World```.
* Added ```Heightfield``` class.
* Removed properties ```.defaultFriction``` and ```.defaultRestitution``` from ```World```, in favor of ```.defaultContactMaterial```.
* Added property ```.enabled``` to ```Equation```.
* Added property ```.surfaceVelocity``` to ```ContactMaterial```.
* Added property ```.sensor``` to ```Shape```.
* ```World``` now emits events ```'beginContact'```, ```'endContact'``` and ```'preSolve'```.
* Added property ```.gravityScale``` to ```Body```.
* Renamed class ```SAP1DBroadphase``` to ```SAPBroadphase```.
* Added property ```.interpolatedPosition``` to ``Body```.
* Added method ```.internalStep``` to ```World```.
* Added property ```.applyGravity``` to ```World```.
* Renamed method ```.computeC``` to ```.computeInvC``` in ```Equation```, and made it compute the inverse.
* Added static method ```Utils.splice```.
* Added property ```.world``` to ```Body```.
* Added property ```.fixedRotation``` to ```Body```.
* Added class ```AABB```.
* Added properties ```.aabb``` and ```.aabbNeedsUpdate``` to ```Body```, as well as a method ```.updateAABB```.
* Added property ```.useBoundingBoxes``` to ```NaiveBroadphase```.
* Added static method ```Broadphase.aabbCheck```.
* Added method ```.computeAABB``` to ```Shape```.
* Added static method ```Broadphase.canCollide```.
* ```Body``` now inherits from ```EventEmitter```, and dispatches events ```'sleep'```,```'sleepy'``` and ```'wakeup'```.
* Added properties ```.allowSleep```, ```.sleepState```, ```.sleepSpeedLimit```, ```.sleepTimeLimit```, ```.lastTimeSleepy``` as well as methods ```.sleep```, ```.wakeUp``` and ```.sleepTick``` to ```Body```.
* Added enums ```Body.AWAKE```, ```Body.SLEEPY```, ```Body.SLEEPING```.
* Added property ```.enableBodySleeping``` to ```World```.
* Added options ```.disableRotationalLock```, ```.lowerLimit```, ```.upperLimit``` to ```PrismaticConstraint``` constructor.
* Added methods ```.enableMotor```, ```.disableMotor``` to ```PrismaticConstraint``` as well as properties ```.motorEnabled```, ```.motorSpeed```, ```.motorEquation```.

##### 0.4.0
* Added properties ```.damping``` and ```.angularDamping``` to ```Body```.
* Added property ```.applyDamping``` to ```World```.
* Added properties ```.shapeA``` and ```.shapeB``` to ```ContactEquation``` and ```FrictionEquation```.
* Added property ```.contactEquation``` to ```FrictionEquation```.
* Added property ```.multiplier``` to ```Equation```.
* Added properties ```.lowerLimitEnabled```, ```.lowerLimit```, ```.upperLimitEnabled```, ```.upperLimit``` to ```RevoluteConstraint```.
* Added property ```.frictionCoefficient``` to ```FrictionEquation``` and ```Narrowphase```. The solver now updates the friction force bounds dynamically in the solver from this value. ```FrictionEquation.setSlipForce()``` is thus deprecated.
* Changed name of ```Narrowphase.convexPlane``` to ```Narrowphase.planeConvex```.
* Changed name of ```Narrowphase.capsulePlane``` to ```Narrowphase.planeCapsule```.
* Added property ```.emitImpactEvent``` to ```World```.
* Added method ```.getBodyById``` to ```World```.
* Added property ```.skipFrictionIterations``` to ```GSSolver```.
* Changed parameter names for ```PrismaticConstraint```. This breaks backwards compatibility.
* Added properties ```.localAxisA```, ```.localAnchorA```, ```.localAnchorB```, to ```PrismaticConstraint```.

##### 0.3.1
* Added method ```Narrowphase.prototype.collidedLastStep```
* Added property ```.firstImpact``` to ```ContactEquation``` and changed the way it handles restitution.
* ```Solver``` now inherits from ```EventEmitter```.
* ```IslandSolver``` now emits a ```'beforeSolveIsland'``` event.
* Added method ```Solver.prototype.sortEquations``` and property ```.equationSortFunction```.
* Added class ```LockConstraint```.
* Added property ```.time``` to ```World```.
* ```World``` now emits ```'impact'``` event.
* Added property ```Utils.ARRAY_TYPE```.

##### 0.3
* Added ```Utils```
* The returned array by ```Broadphase.prototype.getCollisionPairs``` is now reused in between calls.
* Added method ```.addEquations``` to ```Solver``` to faster add an array of ```Equation```s.
* Added method ```.updateArea``` and property ```.area``` to Shape
* Added methods ```.adjustCenterOfMass``` and ```.fromPolygon``` to ```Body```.
* Renamed ```Nearphase``` to ```Narrowphase```.
* Added methods ```.upgradeJSON```, ```.runNarrowphase``` and ```.integrateBody``` to ```World```.
* Renamed ```PointToPointConstraint``` to ```RevoluteConstraint```.
* Added static method ```GSSolver.iterateEquation```.
* Added methods ```.addConstraintVelocity```, ```.resetConstraintVelocity```, ```.setZeroForce``` to ```Body```.
* Added static method ```SAP1DBroadphase.checkBounds```.
* ```body.shapeOffsets``` and ```.shapeAngles``` may now only be vectors and numbers.

##### 0.2
* Removed ```World.collidingBodies``` since ```World.bodies``` can be used equivalently.
* Added property ```DistanceConstraint.distance```
* Added contact response between a lot of Shape types. Check table above.
* Added friction for most of the contact types
* Added ```PointToPointConstraint```
* Added ```Line```
* Added method ```Shape.computeMomentOfInertia```
* Added method ```Body.updateMassProperties```
* Removed ```mat2``` as it is not needed inside the library for now.
* Changed ```Shape``` usage. A ```Shape``` is now added to a ```Body``` via ```Body.addShape(shape,offset,angle)```.
* Removed ```Body.shape```, added ```Body.shapes```, ```.shapeOffsets```, ```.shapeAngles```
* Added ```Rectangle```
* Added method ```Convex.updateTriangles```
* Added method ```Convex.updateCenterOfMass```
* Fixed ```Convex.computeMomentOfInertia```, now it should be correct.
* Updated the Node.js API so that each class is required using the pattern ```var ClassName = require('./ClassName')``` instead of ```var ClassName = require('./ClassName').ClassName```
* Added ```Nearphase``` class
* Removed ```World.contacts``` and ```.frictionEquations``` in favor of ```World.nearphase.contactEquations``` and ```World.nearphase.frictionEquations```
* Added ```Capsule``` class
* Added ```Spring``` properties ```.localAnchorA```, ```.localAnchorB```.
* Added ```Spring``` methods ```.getWorldAnchorA```, ```.setWorldAnchorA``` and the corresponding for B.
* Added ```p2.version``` for browser.
* Added ```PrismaticConstraint```.
* Added properties ```.collisionGroup``` and ```.collisionMask``` to ```Shape```. This enables collision filtering.
* Added method ```World.hitTest```.
* Renamed equation properties ```.k``` and ```.d``` of ```Equation``` and ```GSSolver``` to ```.stiffness``` and ```.relaxation```, respectively. Removed properties ```.a```, ```.b```, ```.eps``` from both and instead compute them on the fly in the solver.
* Added property ```GSSolver.useGlobalEquationParameters``` so that it is possible to turn on and off per-equation solver settings (```.stiffness``` and ```.relaxation```).
* Removed ```Broadphase.<shapeTypeA><shapeTypeB>``` since they are not used in any broadphase implementation any more.
* Added experimental ```QuadTree``` broadphase.
* Added ```SAP1DBroadphase```
* Renamed ```World.friction``` to ```World.defaultFriction```
* Added class ```RotationalVelocityEquation```
* Added methods ```.enableMotor```, ```.disableMotor```, ```.setMotorSpeed``` to ```PointToPointConstraint```

##### 0.1

* Added ```EventEmitter```
* ```World``` now emits the following events: ```'postStep'```, ```'addBody'```, ```'addSpring'```
* Moved properties of ```Body.MotionState``` to ```Body```. Usage is now ```Body.STATIC```, ```Body.DYNAMIC```, ```Body.KINEMATIC```.
* Removed asynchronous behaviour of ```World.step()```.

