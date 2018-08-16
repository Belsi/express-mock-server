import chai from 'chai';
import chaiHttp from 'chai-http';
import { serverStart, serverStop } from '../lib';
import urls from './urls';
import { createSource } from './sources';

chai.use(chaiHttp);

const should = chai.should();

const sources = [
  [
    createSource({
      method: 'GET',
      path: urls.items,
      statusCode: 200,
      key: [{ id: 1 }]
    })
  ]
];

const sourceSwitch = [
  createSource({
    method: 'GET',
    path: urls.items,
    statusCode: 400,
    key: { message: 'API set' }
  })
];

describe('control API', () => {
  let server;

  before(() => {
    server = serverStart(sources, { port: 1337 });
  });

  after(() => {
    serverStop();
  });

  it('should set new response for API', done => {
    chai
      .request(server)
      .get('/items')
      .then(res => {
        res.status.should.equal(200);
        res.body.responseKey.should.be.a('array').to.have.lengthOf(1);

        return chai
          .request(server)
          .post('/api/v1/set')
          .send(sourceSwitch);
      })
      .then(res => {
        res.status.should.equal(202);
        return chai.request(server).get('/items');
      })
      .then(res => {
        res.status.should.equal(400);
        res.body.responseKey.message.should.equal('API set');
        done();
      });
  });

  it('should reset response for API', done => {
    chai
      .request(server)
      .post('/api/v1/set')
      .send(sourceSwitch)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(202);

        chai
          .request(server)
          .get('/items')
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.equal(400);
            res.body.responseKey.message.should.equal('API set');

            chai
              .request(server)
              .post('/api/v1/reset')
              .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(202);

                chai
                  .request(server)
                  .get('/items')
                  .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.body.responseKey.should.be
                      .a('array')
                      .to.have.lengthOf(1);
                    done();
                  });
              });
          });
      });
  });
});
