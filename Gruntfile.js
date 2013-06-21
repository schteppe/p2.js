var fs = require('fs');

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify : {
            test : {
                src : ["src/p2.js"],
                dest : 'build/p2.js',
                options : {
                    standalone : "p2"
                }
            }
        },

        uglify : {
            build : {
                src : ['build/p2.js'],
                dest : 'build/p2.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.registerTask('default', ['browserify','webworkerify','uglify']);

    grunt.registerTask('webworkerify','Fixes the browserify bundle so it works in Web Workers',function(){
        var src = fs.readFileSync("build/p2.js");
        fs.writeFileSync("build/p2.js",src.toString().replace("global.p2","self.p2"));
    });
};
