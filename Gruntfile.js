module.exports = function (grunt) {

  grunt.initConfig({
    watch: {
      automatic: {
        files: ['src/**/*.js']
      }
    }
  })

  MochaTester = {

    mochaOptions: {
      reporter: 'dot'
    },

    Mocha: require('mocha'),
    path: require('path'),
    fs: require('fs'),

    registerToWatchTask: function(target, mochaOptions){
      var tester = Object.create(this);

      tester.target = target;
      tester.mochaOptions = mochaOptions ? 
                                            mochaOptions : 
                                            this.mochaOptions;

      grunt.event.on("watch", tester.listener.bind(tester));
      return tester;
    },

    listener: function(action, filepath, target)
    {
      if (!this.isListenedEvent(action, target)) {
        return;
      }

      var testFile = this.getTestFilePath(filepath);

      if (filepath != testFile) {
        this.clearCache(filepath);
      }

      this.clearCache(testFile);
      this.createMochaWithFile(testFile);

      setTimeout(this.run.bind(this), 500);
    },

    isListenedEvent: function(action, target)
    {
      return action == 'changed' && target == this.target;
    },

    // */myFile.js
    // */test/myFileTest.js
    // either my file or his test file changed get the test file
    getTestFilePath: function(filepath)
    {
      var isTestFile = filepath.indexOf('Test.js') != -1,
            testFile = !isTestFile ? 
                           filepath.replace(/(.+)\/(\w+)\.js/, '/test/Test.js') : 
                           filepath;

      if (!isTestFile && !this.path.existsSync(filepath)) {
        throw new Error('\nTestFile not found:\n'+filepath)
      }

      return testFile;
    },

    // require cache all time, so second time zero test will execute
    // if does not clear from the cache
    clearCache: function(filepath)
    {
      require.cache[require.resolve('./'+filepath)] = undefined;
    },

    createMochaWithFile: function(filepath)
    {
      this.mocha = new this.Mocha(this.mochaOptions);
      this.mocha.addFile(filepath);
    },

    run: function()
    {
      this.mocha.run(function(failureCount){
        if (failureCount) {
          grunt.log.error('falling: ' + failureCount)
        } else {
          grunt.log.ok('OK');
        }
      });
    }
  }

   // Load the plugin that provides the "uglify" task.
   grunt.loadNpmTasks('grunt-contrib-uglify');

   // Default task(s).
   grunt.registerTask('default', ['uglify']);
 

  MochaTester.registerToWatchTask('automatic');
}