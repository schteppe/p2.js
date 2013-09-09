p2.js
=====

JavaScript 2D rigid body physics engine.

## Install
#### Browser
Download either [p2.js](build/p2.js) or the minified [p2.min.js](build/p2.min.js) and include the script in your HTML:
```html
<script src="p2.js" type="text/javascript"></script>
```
#### Node.js
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

## Example
```js
// Setup our world
var world = new p2.World({ gravity:[0,-9.82] });

// Create a circle
var radius = 1,
    circleShape = new p2.Circle(radius),
    circleBody = new p2.Body({ mass:5, shape: circleShape, position:[0,10] });

// Create a plane
var groundShape = new p2.Plane(),
    groundBody = new p2.Body({ mass:0, shape:groundShape });
    
// Add the bodies to the world
world.addBody(circleBody);
world.addBody(groundBody);

// Step the simulation
setInterval(function(){
    world.step(1.0/60.0);
    console.log("Circle y position: " + circleBody.position[1]);
}, 1000.0/60.0);
```

### How to build
Requires [Node.js](http://nodejs.org), NPM and [grunt](http://gruntjs.com/). Just run ```grunt``` in the project directory:
```
grunt   # Bundles build/p2.js and build/p2.min.js
```
