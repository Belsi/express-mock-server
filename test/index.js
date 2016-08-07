import assert from 'assert';
import http from 'http';
import { runServer } from '../lib/index.js';


const sources = [
  {
    request: {
      'method': 'GET',
      'path': '/'
    },
    response: {
      'statusCode': 200,
      'body': JSON.stringify(
        {
          "data": 21
        }
      )
    }
  }
];

describe('server', () => {

  var serverInstance = null;

  before(() => {
    serverInstance = runServer([sources], { port: 1337 });
  });

  after(() => {
    serverInstance.close();
  });

  describe('Basic working', () => {

    it('should return 200', done => {
      http.get('http://127.0.0.1:1337', res => {
        assert.equal(200, res.statusCode);
        done();
      });
    });

    it('data should be 21', (done) => {
      http.get('http://127.0.0.1:1337', res => {
        var data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          let jsonData = JSON.parse(data);
          assert.equal(21, jsonData.data);
          done();
        });
      });
    });

  });

});




// var server = require('./dist/index.js');
// var shell = require('gulp-shell');
// var runSequence = require('run-sequence');

// gulp.task('test', function (cb) {
//   var serverInstance = server.runServer([], { port: 2121 });
//   serverInstance.close();
//   cb();
// });