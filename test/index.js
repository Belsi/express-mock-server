import assert from 'assert';
import http from 'http';
import request from 'request';
import { serverStart, serverStop } from '../lib/index.js';
import sources from './sources';
import urls from './urls';
import responseKey, { responseKeyParam } from './responsekey';
import Digger from './Digger';

const PORT = 1337;
const SERVER_NAME = '127.0.0.1';
const SERVER_URL_WITHOUT_PORT = 'http://' + SERVER_NAME;
const SERVER_URL = SERVER_URL_WITHOUT_PORT + ':' + PORT;

function createItemsExpectation(qs, key, done) {
  http.get(SERVER_URL + urls.items + qs, res => {
    new Digger(res, data => {
      assert.equal(key, data[responseKeyParam]);
      done();
    });
  });
}

function createItemExpectation(id, key, done) {
  http.get(SERVER_URL + urls.item + id, res => {
    new Digger(res, data => {
      assert.equal(key, data[responseKeyParam]);
      done();
    });
  });
}

function createCodeExpectation(url, code, done) {
  http.get(SERVER_URL + url, res => {
    assert.equal(code, res.statusCode);
    done();
  });
}

describe('server', () => {


  before(() => {
    serverStart(sources, { port: PORT });
  });

  after(() => {
    serverStop();
  });

  describe('Basic working', () => {
    it('should return 200', done => {
      createCodeExpectation('', 200, done);
    });

    it('should return 500', done => {
      createCodeExpectation(urls.error, 500, done);
    });

    it('should return 404', done => {
      createCodeExpectation(urls.notFound, 404, done);
    });

    // it('data should be 21', (done) => {
    //   http.get(SERVER_URL, res => {
    //     new Digger(res, (data) => {
    //       assert.equal(21, data.data);
    //       done();
    //     });
    //   });
    // });
  });

  describe('Query strings', () => {
    it('no query = expected empty', done => {
      createItemsExpectation('', responseKey.qsOptionalEmpty, done);
    });

    it('only q1 filled = expected q1', done => {
      const qs = '?q1=1';
      createItemsExpectation(qs, responseKey.qsOptionalQ1filled, done);
    });

    it('only q1 wrong filled = expected empty', done => {
      const qs = '?q1=2';
      createItemsExpectation(qs, responseKey.qsOptionalEmpty, done);
    });

    it('q1, q2, q3 filled  = expected q1, q2, q3', done => {
      const qs = '?q1=1&q2=2&q3=3';
      createItemsExpectation(qs, responseKey.qsOptionalQ1Q2Q3Filed, done);
    });

    it('q1, q2 filled  = expected q1', done => {
      const qs = '?q1=1&q2=2';
      createItemsExpectation(qs, responseKey.qsOptionalQ1filled, done);
    });
  });

  describe('url params', () => {
    it('item id lolek1 = expected urlParamBase', done => {
      createItemExpectation('lolek1', responseKey.urlParamBase, done);
    });

    // it('item id hardId = expected urlParamHardId', (done) => {
    //   createItemExpectation('hardId', responseKey.urlParamHardId, done);
    // });
  });

  describe('dynamic response', () => {
    it('query should be in response', done => {
      createDynamicResponseExpectation(responseKey.dynamicResponse, done);
    });
  });

  function createDynamicResponseExpectation(key, done) {
    const urlParamValue = 'urlParamValue';

    const postKey = 'bodyParam1';
    const postValue = 'bodyValue1';
    let postData = {};
    postData[postKey] = postValue;

    const qsKey = 'q1';
    const qsValue = 'lolek1';
    var qs = '?' + qsKey + '=' + qsValue;

    var options = {
      method: 'post',
      body: postData, // Javascript object
      json: true, // Use,If you are sending JSON data
      url: SERVER_URL + urls.dynamicResponseBase + urlParamValue + qs
    };

    request(options, (err, res, body) => {
      assert.equal(key, body[responseKeyParam]);
      assert.equal(
        urlParamValue,
        body.requestParams.urlParams[urls.dynamicResponseKey]
      );
      assert.equal(qsValue, body.requestParams.qsParams[qsKey]);
      assert.equal(postValue, body.requestParams.bodyParams[postKey]);
      done();
    });
  }
});
