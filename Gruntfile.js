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
    grunt.registerTask('default', ['browserify','uglify']);

};
