p2.js
=====

JavaScript 2D rigid body physics engine.

### Features
* Rigid body physics
* Collision detection (no CCD)
* Constraints: Contacts, DistanceConstraint, PointToPoint, friction
* Springs
* Body motion states (dynamic, kinematic, static)
* Various shapes and collisions (see table below)

### Install
##### Browser
Download either [p2.js](build/p2.js) or the minified [p2.min.js](build/p2.min.js) and include the script in your HTML:
```html
<script src="p2.js" type="text/javascript"></script>
```
##### Node.js
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

### Example
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

### Supported collision pairs
|           | Circle | Plane | Rectangle | Convex | Particle | Line   | Capsule |
| :-------: |:------:|:-----:|:---------:|:------:|:--------:|:------:|:-------:|
| Circle    | Yes    | Yes   | Yes       | Yes    | Yes      | Yes    | (todo)  |
| Plane     | -      | -     | Yes       | Yes    | Yes      | Yes    | (todo)  |
| Rectangle | -      | -     | Yes       | Yes    | Yes      | (todo) | (todo)  |
| Convex    | -      | -     | -         | Yes    | Yes      | (todo) | (todo)  |
| Particle  | -      | -     | -         | -      | -        | -      | (todo)  |
| Line      | -      | -     | -         | -      | -        | (todo) | (todo)  |
| Capsule   | -      | -     | -         | -      | -        | -      | (todo)  |

### Change log
##### Current
* Removed ```World.collidingBodies``` since ```World.bodies``` can be used equivalently.
* Added property ```DistanceConstraint.distance```
* Added contact response between a lot of Shape types. Check table above.
* Added friction for most of the contact types
* Added ```PointToPointConstraint```
* Added ```Line```
* Added ```Compound```
* Added method ```Shape.computeMomentOfInertia```
* Added method ```Body.updateMassProperties```
* Removed ```mat2``` as it is not needed inside the library for now.
* Changed ```Shape``` usage. A ```Shape``` is now added to a ```Body``` via ```Body.addShape(shape,offset,angle)```. Thus, ```Compound``` is not needed.
* Removed ```Compound```.
* Removed ```Body.shape```, added ```Body.shapes```, ```.shapeOffsets```, ```.shapeAngles```
* Added ```Rectangle```
* Added method ```Convex.updateTriangles```
* Added method ```Convex.updateCenterOfMass```
* Fixed ```Convex.computeMomentOfInertia```, now it should be correct.
* Updated the Node.js API so that each class is required using the pattern ```var ClassName = require('./ClassName')``` instead of ```var ClassName = require('./ClassName').ClassName```
* Added ```Nearphase``` class
* Removed ```World.contacts``` and ```.frictionEquations``` in favor of ```World.nearphase.contactEquations``` and ```World.nearphase.frictionEquations```
* Added ```Capsule``` class

##### 0.1

* Added ```EventEmitter```
* ```World``` now emits the following events: ```postStep```, ```addBody```, ```addSpring```
* Moved properties of ```Body.MotionState``` to ```Body```. Usage is now ```Body.STATIC```, ```Body.DYNAMIC```, ```Body.KINEMATIC```.
* Removed asynchronous behaviour of ```World.step()```.

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
