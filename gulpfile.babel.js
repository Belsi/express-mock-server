import gulp from 'gulp';
import shell from 'gulp-shell';
import server from './dist/index.js';
import testSources from './test/sources';

gulp.task('test-server', cb => {
  server.serverStart(testSources, { port: 2121 });
  cb();
});

gulp.task('test', shell.task(['npm run test']));
gulp.task('prepublish', shell.task(['npm run prepublish']));

// npm run prepublish
// gulp test
// git comit and push
// npm version patch {prida tag do gitu, takye push}
// git push
// npm publish
