import chai from 'chai';
import chaiHttp from 'chai-http';
import { serverStart, serverStop } from '../lib';
import sources from './sources';

chai.use(chaiHttp);

const should = chai.should();

describe('recording API', () => {
  let server;

  before(() => {
    server = serverStart(sources, { port: 1337 });
  });

  after(() => {
    serverStop();
  });

  it('should start monitoring', done => {
    chai
      .request(server)
      .post('/api/v1/recording/start')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.id.should.be.a('string');
        done();
      });
  });

  it('should return empty monitoring result', done => {
    chai
      .request(server)
      .post('/api/v1/recording/start')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.id.should.be.a('string');

        const monitoringId = res.body.id;

        chai
          .request(server)
          .post(`/api/v1/recording/${monitoringId}/stop`)
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.equal(200);
            res.body.should.be.an('array').and.be.empty;
            done();
          });
      });
  });

  it('should return 404 if monitoring ID does not exists', done => {
    chai
      .request(server)
      .post('/api/v1/recording/xxx/stop')
      .end((err, res) => {
        res.status.should.equal(404);
        done();
      });
  });

  it('should monitor GET API call', done => {
    chai
      .request(server)
      .post('/api/v1/recording/start')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.id.should.be.a('string');

        const monitoringId = res.body.id;

        chai
          .request(server)
          .get(`/items`)
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.equal(200);

            chai
              .request(server)
              .post(`/api/v1/recording/${monitoringId}/stop`)
              .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.body.should.be.an('array').and.to.have.lengthOf(1);
                res.body[0].method.should.equal('GET');
                res.body[0].path.should.equal('/items');
                done();
              });
          });
      });
  });

  it('should monitor POST API call', done => {
    chai
      .request(server)
      .post('/api/v1/recording/start')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.id.should.be.a('string');

        const monitoringId = res.body.id;

        chai
          .request(server)
          .post(`/dynamic/response/555?queryParam=queryValue`)
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.equal(200);

            chai
              .request(server)
              .post(`/api/v1/recording/${monitoringId}/stop`)
              .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.body.should.be.an('array').and.to.have.lengthOf(1);
                res.body[0].method.should.equal('POST');
                res.body[0].path.should.equal('/dynamic/response/555');
                res.body[0].query.should.deep.equal({
                  queryParam: 'queryValue'
                });

                res.body[0].responseBody.should.deep.equal({
                  responseKey: 'dynamicResponse',
                  requestParams: {
                    qsParams: { queryParam: 'queryValue' },
                    bodyParams: {},
                    urlParams: { urlParam: '555' }
                  }
                });
                done();
              });
          });
      });
  });
});
