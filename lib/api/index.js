import bodyParser from 'body-parser';
import HttpStatus from 'http-status-codes';
import express from 'express';
import config from '../config';
import 'colors';

const { isLogEnabled } = config;

function getApi(handler) {
  const app = express();

  app.use(bodyParser.json());

  app.post('/set', function(req, res) {
    if (isLogEnabled) console.log('API set new values'.green);
    req.body.forEach(record => {
      // console.log('new record is >');
      // console.log(JSON.stringify(record, null, "  "));
      // console.log('< new record is');
      handler.switchRecord(record);
    });
    res.status(HttpStatus.ACCEPTED).end(); //.send(req.body)
  });

  app.post('/reset', function(req, res) {
    if (isLogEnabled) console.log('API Reset'.green);
    handler.resetMap();
    res.status(HttpStatus.ACCEPTED).end();
  });

  app.on('mount', () => {
    console.log(`* Api URL        ${app.mountpath}`.yellow);
  });

  return app;
}

export default getApi;
