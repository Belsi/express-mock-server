import assert from 'assert';
import http from 'http';
let Server = require('../lib/index.js');
// import { runServer } from '../lib/index.js';

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

describe('server', function () {

  var serverInstance = null;

  before(function () {
    serverInstance = Server.runServer([sources], { port: 1337 });
  });

  after(function () {
    serverInstance.close();
  });

  describe('Working', () => {
    it('should return 200', done => {
      http.get('http://127.0.0.1:1337', res => {
        assert.equal(200, res.statusCode);
        done();
      });
    });

    it('data should be 21', function (done) {
      http.get('http://127.0.0.1:1337', res => {
        var data = '';

        res.on('data', function (chunk) {
          data += chunk;
        });

        res.on('end', function () {
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