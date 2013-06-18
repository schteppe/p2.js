    exports.vec2 = {
        getX : function(a){
        	return a[0];
        },

        getY : function(a){
        	return a[1];
        },

        crossLength : function(a,b){
        	return a[0] * b[1] - a[1] * b[0];
        },

        rotate : function(out,a,angle){
            var c = Math.cos(angle),
                s = Math.sin(angle);
            out[0] = c*a[0] -s*a[1];
            out[1] = s*a[0] +c*a[1];
        }
    };
