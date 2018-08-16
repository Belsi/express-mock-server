import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import config from './config';
import { controlApi } from './api/control';
import { SourcesParser } from './core/sources-parser';
import { SourcesRouter } from './core/sources-router';
import { recordingApi } from './api/recording';
import { apiRecorder } from './api/recording/api-recorder';

const { isLogEnabled } = config;

export class App {
  constructor(sources, serverConfig) {
    this.parser = new SourcesParser(sources);
    this.apiUrl = this.getApiUrl(serverConfig);
    this.app = express();

    console.log('******* CONFIG **********'.yellow);

    this.initMiddleware();
    this.initControlApi();
    this.initMocks();
  }

  initMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(apiRecorder(this.apiUrl));
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
    this.app.use(this.apiUrl, controlApi(this.parser));
    this.app.use(this.apiUrl, recordingApi());
  }

  getApiUrl({ controlApiUrl } = {}) {
    return controlApiUrl ? controlApiUrl : '/api/v1';
  }

  start(port, callback) {
    return this.app.listen(port, callback);
  }
}
