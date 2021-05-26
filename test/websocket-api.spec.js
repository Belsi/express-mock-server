import chai from 'chai';
import chaiHttp from 'chai-http';
import { serverStart, serverStop } from '../lib';
import sources from './sources';

chai.use(chaiHttp);

const should = chai.should();

describe('websocket API', () => {
  let server;

  before(() => {
    server = serverStart(sources, { port: 1337, webSocketEnabled: true });
  });

  after(() => {
    serverStop();
  });

  it('should send message to clients', done => {
    chai
      .request(server)
      .post('/api/v1/websocket/clients/message')
      .end((err, res) => {
        should.not.exist(err);

        res.status.should.equal(200);
        res.body.status.should.be.true;
        done();
      });
  });

  it('should disconnect all clients', done => {
    chai
      .request(server)
      .post('/api/v1/websocket/clients/disconnect')
      .end((err, res) => {
        should.not.exist(err);

        res.status.should.equal(200);
        res.body.status.should.be.true;
        done();
      });
  });

});
