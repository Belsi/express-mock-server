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

  it('should monitor API calls', done => {
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
});
