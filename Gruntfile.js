var fs = require('fs');

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify : {
            core : {
                src : ["src/p2.js"],
                dest : 'build/p2.js',
                options:{
                    bundleOptions : {
                        standalone : "p2"
                    }
                }
            }
        },

        uglify : {
            build : {
                src : ['build/p2.js'],
                dest : 'build/p2.min.js'
            }
        },

        nodeunit: {
            all: ['test/**/*.js'],
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.registerTask('default', ['browserify','webworkerify','uglify','addLicense']);
    grunt.registerTask('test', ['nodeunit']);

    grunt.registerTask('webworkerify','Fixes the browserify bundle so it works in Web Workers',function(){
        var src = fs.readFileSync("build/p2.js");
        fs.writeFileSync("build/p2.js",src.toString().replace("global.p2","self.p2"));
    });

    grunt.registerTask('addLicense','Adds the LICENSE to the top of the built files',function(){
        var text = fs.readFileSync("LICENSE").toString();

        var dev = fs.readFileSync("build/p2.js").toString();
        var min = fs.readFileSync("build/p2.min.js").toString();

        fs.writeFileSync("build/p2.js",text+"\n"+dev);
        fs.writeFileSync("build/p2.min.js",text+"\n"+min);
    });
};
