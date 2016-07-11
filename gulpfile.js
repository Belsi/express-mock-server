
var gulp = require('gulp');

var server = require('./dist/index.js');

gulp.task('test', function (cb) {
  server.runServer([]);
  cb();
});


/*
npm run prepublish


*/