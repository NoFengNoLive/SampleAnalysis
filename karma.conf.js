module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'lib/jquery/dist/jquery.js',
      'lib/angular/angular.js',
      'lib/angular-mocks/angular-mocks.js',
      'app.js',
      'js/tokenTable/*.js',
      'js/wordTable/*.js',
      'js/symbolTable/*.js',
      'js/lexicalAnalysis/*.js',
      'js/grammaticalAnalysis/*.js'
    ],
    exclude: ['karma.conf.js'],
    preprocessors: {
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  })
}
