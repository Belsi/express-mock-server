import express from 'express';
import { ACCEPTED } from 'http-status-codes';
import config from '../config';

const router = express.Router({});
const { isLogEnabled } = config;

export const controlApi = sourcesParser => {
  router.post('/set', (req, res) => {
    if (isLogEnabled) {
      console.log('API set new values'.green);
    }

    req.body.forEach(record => {
      // console.log('new record is >');
      // console.log(JSON.stringify(record, null, "  "));
      // console.log('< new record is');
      sourcesParser.switchRecord(record);
    });

    res.status(ACCEPTED).end();
  });

  router.post('/reset', (req, res) => {
    if (isLogEnabled) {
      console.log('API Reset'.green);
    }

    sourcesParser.resetMap();

    res.status(ACCEPTED).end();
  });

  return router;
};
