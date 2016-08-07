import assert from 'assert';
import http from 'http';
import { runServer } from '../lib/index.js';
import sources from './sources';
import urls from './urls';
import responseKey, { responseKeyParam } from './responsekey';
import Digger from './Digger';

const PORT = 1337;
const SERVER_URL = 'http://127.0.0.1:'+PORT;

function createItemsExpectation(qs, key, done){
  http.get(SERVER_URL + urls.items + qs, res => {
    new Digger(res, (data) => {
      assert.equal(key, data[responseKeyParam]);
      done();
    });
  });
}

function createItemExpectation(id, key, done){
  http.get(SERVER_URL + urls.item + id, res => {
    new Digger(res, (data) => {
      assert.equal(key, data[responseKeyParam]);
      done();
    });
  });
}

function createCodeExpectation(url, code, done){
  http.get(SERVER_URL + url, res => {
    assert.equal(code, res.statusCode);
    done();
  });
}

describe('server', () => {

  var serverInstance = null;

  before(() => {
    serverInstance = runServer(sources, { port: PORT });
  });

  after(() => {
    serverInstance.close();
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

    it('no query = expected empty', (done) => {
      createItemsExpectation('', responseKey.qsOptionalEmpty, done);
    });

    it('only q1 filled = expected q1', (done) => {
      const qs = '?q1=1';
      createItemsExpectation(qs, responseKey.qsOptionalQ1filled, done);
    });

    it('only q1 wrong filled = expected empty', (done) => {
      const qs = '?q1=2';
      createItemsExpectation(qs, responseKey.qsOptionalEmpty, done);
    });

    it('q1, q2, q3 filled  = expected q1, q2, q3', (done) => {
      const qs = '?q1=1&q2=2&q3=3';
      createItemsExpectation(qs, responseKey.qsOptionalQ1Q2Q3Filed, done);
    });

    it('q1, q2 filled  = expected q1', (done) => {
      const qs = '?q1=1&q2=2';
      createItemsExpectation(qs, responseKey.qsOptionalQ1filled, done);
    });

  });

  describe('url params', () => {

    it('item id lolek1 = expected urlParamBase', (done) => {
      createItemExpectation('lolek1', responseKey.urlParamBase, done);
    });

    // it('item id hardId = expected urlParamHardId', (done) => {
    //   createItemExpectation('hardId', responseKey.urlParamHardId, done);
    // });


  });

});

