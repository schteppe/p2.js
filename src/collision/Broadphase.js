    // Broadphase
    var dist = vec2.create();
    var rot = mat2.create();
    var worldNormal = vec2.create();
    var yAxis = vec2.fromValues(0,1);
    function checkCircleCircle(c1,c2,result){
        vec2.sub(dist,c1.position,c2.position);
        var R1 = c1.shape.radius;
        var R2 = c2.shape.radius;
        if(vec2.sqrLen(dist) < (R1+R2)*(R1+R2)){
            result.push(c1);
            result.push(c2);
        }
    }
    function checkCirclePlane(c,p,result){
        vec2.sub(dist,c.position,p.position);
        /*
        M.setFromRotation(rot,p.angle);
        vec2.transformMat2(worldNormal,yAxis,rot);
        */
        vec2.rotate(worldNormal,yAxis,p.angle);
        if(vec2.dot(dist,worldNormal) <= c.shape.radius){
            result.push(c);
            result.push(p);
        }
    }
    function checkCircleParticle(c,p,result){
        result.push(c);
        result.push(p);
    }

    // Generate contacts / do nearphase
    function nearphaseCircleCircle(c1,c2,result,oldContacts){
        //var c = new p2.ContactEquation(c1,c2);
        var c = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(c1,c2);
        c.bi = c1;
        c.bj = c2;
        vec2.sub(c.ni,c2.position,c1.position);
        vec2.normalize(c.ni,c.ni);
        vec2.scale( c.ri,c.ni, c1.shape.radius);
        vec2.scale( c.rj,c.ni,-c2.shape.radius);
        result.push(c);
    }
    function nearphaseCircleParticle(c,p,result,oldContacts){
        // todo
    }
    var nearphaseCirclePlane_rot = mat2.create();
    var nearphaseCirclePlane_planeToCircle = vec2.create();
    var nearphaseCirclePlane_temp = vec2.create();
    function nearphaseCirclePlane(c,p,result,oldContacts){
        var rot = nearphaseCirclePlane_rot;
        var contact = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(p,c);
        contact.bi = p;
        contact.bj = c;
        var planeToCircle = nearphaseCirclePlane_planeToCircle;
        var temp = nearphaseCirclePlane_temp;

        /*
        M.setFromRotation(rot,p.angle);
        vec2.transformMat2(contact.ni,yAxis,rot);
        */
        vec2.rotate(contact.ni,yAxis,p.angle);

        vec2.scale( contact.rj,contact.ni, -c.shape.radius);

        vec2.sub(planeToCircle,c.position,p.position);
        var d = vec2.dot(contact.ni , planeToCircle );
        vec2.scale(temp,contact.ni,d);
        vec2.sub( contact.ri ,planeToCircle , temp );

        result.push(contact);
    }

    var step_r = vec2.create();
    var step_runit = vec2.create();
    var step_u = vec2.create();
    var step_f = vec2.create();
    var step_fhMinv = vec2.create();
    var step_velodt = vec2.create();
    function now(){
        if(performance.now) return performance.now();
        else if(performance.webkitNow) return performance.webkitNow();
        else new Date().getTime();
    }

    /**
     * Base class for broadphase implementations.
     * @class
     */
    p2.Broadphase = function(){

    };

    /**
     * Get all potential intersecting body pairs.
     * @method
     * @memberof p2.Broadphase
     * @param  {p2.World} world The world to search in.
     * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
     */
    p2.Broadphase.prototype.getCollisionPairs = function(world){
        throw new Error("getCollisionPairs must be implemented in a subclass!");
    };

