
var gulp = require('gulp');

var server = require('./index.js');

gulp.task('test', function (cb) {
  server.runServer([]);
  cb();
});