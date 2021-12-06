import chai from 'chai';
import chaiHttp from 'chai-http';
import { serverStart, serverStop } from '../lib';
import sources from './sources';

chai.use(chaiHttp);

const should = chai.should();

describe('API mocks', () => {
  let server;

  before(() => {
    server = serverStart(sources, { port: 1337 });
  });

  after(() => {
    serverStop();
  });

  it('should call mocked API', done => {
    chai
      .request(server)
      .get('/item/5')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.responseKey.should.equal('urlParamBase');
        done();
      });
  });

  it('should call mocked API with file response', done => {
    chai
      .request(server)
      .get('/items/logo')
      .end((err, res) => {
        console.log(res.body);
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('image/jpg');
        chai.expect(res.body).to.have.lengthOf(2317786);
        done();
      });
  });
});
