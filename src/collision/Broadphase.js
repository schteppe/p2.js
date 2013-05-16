    // Broadphase
    var dist = V.create();
    var rot = M.create();
    var worldNormal = V.create();
    var yAxis = V.create(0,1);
    function checkCircleCircle(c1,c2,result){
        Vsub(c1.position,c2.position,dist);
        var R1 = c1.shape.radius;
        var R2 = c2.shape.radius;
        if(Vnorm2(dist) < (R1+R2)*(R1+R2)){
            result.push(c1);
            result.push(c2);
        }
    }
    function checkCirclePlane(c,p,result){
        Vsub(c.position,p.position,dist);
        M.setFromRotation(rot,p.angle);
        M.vectorMultiply(rot,yAxis,worldNormal);
        if(Vdot(dist,worldNormal) <= c.shape.radius){
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
        Vsub(c2.position,c1.position,c.ni);
        V.normalize(c.ni,c.ni);
        Vscale(c.ni, c1.shape.radius, c.ri);
        Vscale(c.ni,-c2.shape.radius, c.rj);
        result.push(c);
    }
    function nearphaseCircleParticle(c,p,result,oldContacts){
        // todo
    }
    var nearphaseCirclePlane_rot = M.create();
    var nearphaseCirclePlane_planeToCircle = V.create();
    var nearphaseCirclePlane_temp = V.create();
    function nearphaseCirclePlane(c,p,result,oldContacts){
        var rot = nearphaseCirclePlane_rot;
        var contact = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(p,c);
        contact.bi = p;
        contact.bj = c;
        var planeToCircle = nearphaseCirclePlane_planeToCircle;
        var temp = nearphaseCirclePlane_temp;

        M.setFromRotation(rot,p.angle);
        M.vectorMultiply(rot,yAxis,contact.ni);

        V.scale(contact.ni, -c.shape.radius, contact.rj);

        V.subtract(c.position,p.position,planeToCircle);
        var d = V.dot(contact.ni , planeToCircle );
        V.scale(contact.ni,d,temp);
        V.subtract(planeToCircle , temp , contact.ri );

        result.push(contact);
    }

    var step_r = V.create();
    var step_runit = V.create();
    var step_u = V.create();
    var step_f = V.create();
    var step_fhMinv = V.create();
    var step_velodt = V.create();
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
