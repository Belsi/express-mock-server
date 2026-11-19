import fs from 'fs';
import path from 'path';
import chai from 'chai';
import chaiHttp from 'chai-http';
import etag from 'etag';
import { serverStart, serverStop } from '../lib';
import sources from './sources';

chai.use(chaiHttp);

const should = chai.should();

const FIXED_ETAG = '"fixed-etag"';
const IMAGE_PATH = path.join(__dirname, 'image.jpg');
const IMAGE_SIZE = 2317786;

const explicitEtagSource = {
  request: {
    method: 'GET',
    path: '/cache/explicit-etag',
  },
  response: {
    statusCode: 200,
    headers: [{ name: 'ETag', values: [FIXED_ETAG] }],
    body: JSON.stringify({ responseKey: 'explicitEtag' }),
  },
};

const allSources = [...sources, [explicitEtagSource]];

// Validators Express / send would generate for these responses with caching enabled
const itemBody = JSON.stringify({ responseKey: 'urlParamBase' });
const itemEtag = etag(itemBody, { weak: true });
const imageStat = fs.statSync(IMAGE_PATH);
const imageEtag = etag(imageStat);
const imageLastModified = imageStat.mtime.toUTCString();

describe('HTTP cache', () => {
  describe('disabled (default)', () => {
    let server;

    before(() => {
      server = serverStart(allSources, { port: 1337 });
    });

    after(() => {
      serverStop();
    });

    it('should not send ETag and answer 200 to a conditional GET', async () => {
      const first = await chai.request(server).get('/item/5');
      first.status.should.equal(200);
      should.not.exist(first.headers.etag);
      first.headers['cache-control'].should.equal('no-store');

      const second = await chai
        .request(server)
        .get('/item/5')
        .set('If-None-Match', itemEtag);
      second.status.should.equal(200);
      should.not.exist(second.headers.etag);
      second.body.responseKey.should.equal('urlParamBase');
    });

    it('should not send validators and answer 200 to a conditional file GET', async () => {
      const res = await chai
        .request(server)
        .get('/items/logo')
        .set('If-None-Match', imageEtag)
        .set('If-Modified-Since', imageLastModified);
      res.status.should.equal(200);
      should.not.exist(res.headers.etag);
      should.not.exist(res.headers['last-modified']);
      res.headers['cache-control'].should.equal('no-store');
      chai.expect(res.body).to.have.lengthOf(IMAGE_SIZE);
    });

    it('should honour an ETag set explicitly by the source', async () => {
      const res = await chai
        .request(server)
        .get('/cache/explicit-etag')
        .set('If-None-Match', FIXED_ETAG);
      res.status.should.equal(304);
    });
  });

  describe('enabled (httpCache: true)', () => {
    let server;

    before(() => {
      server = serverStart(allSources, { port: 1337, httpCache: true });
    });

    after(() => {
      serverStop();
    });

    it('should send ETag and answer 304 to a conditional GET', async () => {
      const first = await chai.request(server).get('/item/5');
      first.status.should.equal(200);
      first.headers.etag.should.equal(itemEtag);
      should.not.exist(first.headers['cache-control']);

      const second = await chai
        .request(server)
        .get('/item/5')
        .set('If-None-Match', first.headers.etag);
      second.status.should.equal(304);
    });

    it('should answer 304 to a conditional file GET', async () => {
      const first = await chai.request(server).get('/items/logo');
      first.status.should.equal(200);
      first.headers.etag.should.equal(imageEtag);

      const second = await chai
        .request(server)
        .get('/items/logo')
        .set('If-None-Match', first.headers.etag);
      second.status.should.equal(304);
    });
  });
});
