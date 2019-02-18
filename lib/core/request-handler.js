import { NOT_FOUND } from 'http-status-codes';
import { methods } from './../constants';
import { isFunction } from './utils';
import { matchRecordPost } from './matchers/http-post-matcher';
import { matchRecordGet } from './matchers/http-get-matcher';

const APPLICATION_JSON = 'application/json';

export const requestHandler = (sourcesParser, req, res) => {
  let method = req.method;
  let path = req.route.path;
  let definitions = sourcesParser.getMap()[path][method];

  // console.log(method);
  // console.log(req.body);

  let response = null;
  let matchedRecord = null;

  if (definitions.length === 1) {
    matchedRecord = definitions[0];
    response = matchedRecord.response;
  } else {
    switch (method) {
      case methods.POST: {
        matchedRecord = matchRecordPost(req, definitions);
        break;
      }

      case methods.GET:
      case methods.PUT:
      case methods.DELETE:
      case methods.PATCH:
      default: {
        matchedRecord = matchRecordGet(req, definitions);
      }
    }

    if (matchedRecord !== null) {
      response = matchedRecord.response;
    }

    if (response === null) {
      console.log('ERR no reaponse but why?'.bgRed.white);
      console.log('I know this URL but no match for parameters.'.bgBlue.white);
      console.log(`method ${method}    path ${path}`);
      console.log('QUERY'.yellow);
      console.log(req.query);
      console.log('BODY'.yellow);
      console.log(req.body);
      console.log('bundle'.yellow);
      // myLog(bundle);
      res
        .status(NOT_FOUND)
        .send('NOT FOUND - no reaponse but why? Look to console.')
        .end();
      return;
    }
  }

  if (isFunction(response)) {
    response = response(req.params, req.query, req.body);
  }

  if (!!response.headers) {
    response.headers.forEach(headerItem => {
      res.setHeader(headerItem['name'], headerItem['values'][0]);
    });
  }

  res.status(response.statusCode).type(APPLICATION_JSON);

  if (response.delay) {
    setTimeout(() => {
      res.send(response.body);
    }, response.delay);
  } else {
    res.send(response.body);
  }
};
