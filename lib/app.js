import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import config from './config';
import { controlApi } from './api/control';
import { SourcesParser } from './core/sources-parser';
import { SourcesRouter } from './core/sources-router';

const { isLogEnabled } = config;

export class App {
  constructor(sources, serverConfig) {
    this.serverConfig = serverConfig;
    this.parser = new SourcesParser(sources);
    this.app = express();

    console.log('******* CONFIG **********'.yellow);

    this.initMiddleware();
    this.initControlApi();
    this.initMocks();
  }

  initMiddleware() {
    this.app.use(bodyParser.json());
    this.initLogger();
  }

  initMocks() {
    const router = new SourcesRouter(this.parser);
    router.registerSources(this.app, isLogEnabled);
  }

  /**
   *  Method to start logger of requests
   *    Actual format
   *      0.230 ms GET 200 /some/url/
   *    More option
   *      https://github.com/expressjs/morgan
   */
  initLogger() {
    if (isLogEnabled) {
      this.app.use(morgan(':response-time ms :method :status :url'));
    }
  }

  initControlApi() {
    const apiUrl = this.serverConfig.controlApiUrl
      ? this.serverConfig.controlApiUrl
      : '/api/v1';

    this.app.use(apiUrl, controlApi(this.parser));
  }

  start(port, callback) {
    return this.app.listen(port, callback);
  }
}
