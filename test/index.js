import assert from 'assert';
import http from 'http';

import {runServer} from'../lib/index.js';

describe('Example Node Server', () => {
  it('should return 200', done => {
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

    runServer([sources], {port:1337});

    // todo nahradit promisou a thenem
    setTimeout(function () {
      http.get('http://127.0.0.1:1337', res => {
        assert.equal(200, res.statusCode);
        done();
      });
    }, 1800);

  });
});