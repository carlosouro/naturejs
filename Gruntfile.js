module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

		//ODB_BUILD

    // Configuration to be run (and then tested).
    odb_build: {

    	src_folder: "src/",
    	dest_folder: "build/",
  		js : {
				"nature.js": ["nature.js"]
		},
		copy:{
			'package.json': '../package.json',
            'manifest.json': '../manifest.json'
		},
    	version_replace:["package.json"]
    },
    watch: {
        scripts: {
            files: ['**.js'],
            tasks: ['build'],
            options: {
                spawn: false,
            },
        },
    }
  });

  //load odb_grunt_packager tasks
  grunt.loadNpmTasks('odb_grunt_packager');

  grunt.registerTask('build', ['odb_build:dev']); //basic build

  //prod build
  //on an npm case, because usually prod_compress:false, the only difference is jshint runs for src
  grunt.registerTask('build-prod', ['odb_build:prod']);

  //release process
  //1 - odb_version: request the user to assign a version
  //2 - production build
  //3 - publish build to npm repo
  grunt.registerTask('release', ['odb_version', 'odb_build:prod', 'odb_release']); //asks the user for a version, builds and releases
};
