
var gulp = require('gulp');

var server = require('./dist/index.js');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
import testSources from './test/sources';

gulp.task('testserver', function (cb) {
  var serverInstance = server.runServer(testSources, { port: 2121 });
  //serverInstance.close();
  cb();
});

// gulp.task('publish', function (cb) {
//   runSequence(
//     // 'build-clean',
//     // ['build-scripts', 'build-styles'],
//     // 'build-html',
//     cb);

//   // server.runServer([]);
//   // cb();
// });

gulp.task('test', shell.task(['npm run test']));
gulp.task('prepublish', shell.task(['npm run prepublish']));

// gulp.task('prepublish', shell.task([
//   'npm run prepublish'
// ]));


// npm run prepublish
// git comit and push
// npm version patch {prida tag do gitu, takye push}

