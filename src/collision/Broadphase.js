var glMatrix = require('gl-matrix'),
    glMatrixExtensions = require('../gl-matrix-extensions'),
    vec2e = glMatrixExtensions.vec2,
    vec2 = glMatrix.vec2,
    mat2 = glMatrix.mat2;

var dist = vec2.create();
var rot = mat2.create();
var worldNormal = vec2.create();
var yAxis = vec2.fromValues(0,1);
exports.checkCircleCircle = function(c1,c2,result){
    vec2.sub(dist,c1.position,c2.position);
    var R1 = c1.shape.radius;
    var R2 = c2.shape.radius;
    if(vec2.sqrLen(dist) < (R1+R2)*(R1+R2)){
        result.push(c1);
        result.push(c2);
    }
};

exports.checkCirclePlane = function(c,p,result){
    vec2.sub(dist,c.position,p.position);
    vec2e.rotate(worldNormal,yAxis,p.angle);
    if(vec2.dot(dist,worldNormal) <= c.shape.radius){
        result.push(c);
        result.push(p);
    }
}

exports.checkCircleParticle = function(c,p,result){
    result.push(c);
    result.push(p);
};

// Generate contacts / do nearphase
exports.nearphaseCircleCircle = function(c1,c2,result,oldContacts){
    //var c = new p2.ContactEquation(c1,c2);
    var c = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(c1,c2);
    c.bi = c1;
    c.bj = c2;
    vec2.sub(c.ni,c2.position,c1.position);
    vec2.normalize(c.ni,c.ni);
    vec2.scale( c.ri,c.ni, c1.shape.radius);
    vec2.scale( c.rj,c.ni,-c2.shape.radius);
    result.push(c);
};

exports.nearphaseCircleParticle = function(c,p,result,oldContacts){
    // todo
};

var nearphaseCirclePlane_rot = mat2.create();
var nearphaseCirclePlane_planeToCircle = vec2.create();
var nearphaseCirclePlane_temp = vec2.create();
exports.nearphaseCirclePlane = function(c,p,result,oldContacts){
    var rot = nearphaseCirclePlane_rot;
    var contact = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(p,c);
    contact.bi = p;
    contact.bj = c;
    var planeToCircle = nearphaseCirclePlane_planeToCircle;
    var temp = nearphaseCirclePlane_temp;
    vec2e.rotate(contact.ni,yAxis,p.angle);

    vec2.scale( contact.rj,contact.ni, -c.shape.radius);

    vec2.sub(planeToCircle,c.position,p.position);
    var d = vec2.dot(contact.ni , planeToCircle );
    vec2.scale(temp,contact.ni,d);
    vec2.sub( contact.ri ,planeToCircle , temp );

    result.push(contact);
}

/**
 * Base class for broadphase implementations.
 * @class Broadphase
 * @constructor
 */
exports.Broadphase = function(){

};

/**
 * Get all potential intersecting body pairs.
 *
 * @method getCollisionPairs
 * @param  {World} world The world to search in.
 * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
 */
exports.Broadphase.prototype.getCollisionPairs = function(world){
    throw new Error("getCollisionPairs must be implemented in a subclass!");
};

