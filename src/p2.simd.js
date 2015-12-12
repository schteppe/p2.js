
// SIMD shim
if(typeof SIMD !== 'undefined'){

    // Sneak in some SIMD stuff on initialize
    var oldUpdate = p2.Body.prototype.updateMassProperties;
    p2.Body.prototype.updateMassProperties = function(){
        if(this.position.length === 2){
            delete this.angle;
            delete this.angularVelocity;
            this.position = new Float32Array([this.position[0], this.position[1], 0, 0]);
            this.previousPosition = new Float32Array([this.previousPosition[0], this.previousPosition[1], 0, 0]);
            this.velocity = new Float32Array([this.velocity[0], this.velocity[1], 0, 0]);
            this.force = new Float32Array([this.force[0], this.force[1], 0, 0]);
            this.massMultiplier = new Float32Array([this.massMultiplier[0], this.massMultiplier[1], 1, 0]);
        }
        oldUpdate.apply(this);
    };

    Object.defineProperties(p2.Body.prototype, {
        angle: {
            get: function () {
                return this.position[2];
            },
            set: function (value) {
                this.position[2] = value;
            }
        },
        angularVelocity: {
            get: function () {
                return this.velocity[2];
            },
            set: function (value) {
                this.velocity[2] = value;
            }
        },
        angularForce: {
            get: function () {
                return this.force[2];
            },
            set: function (value) {
                this.force[2] = value;
            }
        },
        previousAngle: {
            get: function () {
                return this.previousPosition[2];
            },
            set: function (value) {
                this.previousPosition[2] = value;
            }
        }
    });

    p2.Body.prototype.integrate = function(dt){

        // Save old positions
        this.previousPosition.set(this.position);

        var dtVec = SIMD.Float32x4.splat(dt);
        var f = SIMD.Float32x4.load(this.force, 0);
        var v = SIMD.Float32x4.load(this.velocity, 0);
        var x = SIMD.Float32x4.load(this.position, 0);
        var massMult = SIMD.Float32x4.load(this.massMultiplier, 0);
        var iM = SIMD.Float32x4(this.invMass, this.invMass, this.invInertia, 0);

        var fhMinv = SIMD.Float32x4.mul(f, iM);
        fhMinv = SIMD.Float32x4.mul(fhMinv, dtVec);
        fhMinv = SIMD.Float32x4.mul(fhMinv, massMult);
        var v2 = SIMD.Float32x4.add(fhMinv, v);
        var v_dt = SIMD.Float32x4.mul(v2, dtVec);

        SIMD.Float32x4.store(this.velocity, 0, v2);

        // CCD
        if(!this.integrateToTimeOfImpact(dt)){
            var x2 = SIMD.Float32x4.add(x, v_dt);
            SIMD.Float32x4.store(this.position, 0, x2);
        }

        this.aabbNeedsUpdate = true;
    };
}
