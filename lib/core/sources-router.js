import { methods } from '../constants';
import { requestHandler } from './request-handler';

export class SourcesRouter {
  /**
   * @param {SourcesParser} parser
   */
  constructor(parser) {
    this.parser = parser;
  }

  registerSources(app, isLogEnabled) {
    const map = this.parser.getMap();
    Object.keys(map).forEach(path => {
      this.registerGET(app, path, isLogEnabled);
      this.registerPOST(app, path, isLogEnabled);
      this.registerPUT(app, path, isLogEnabled);
      this.registerDELETE(app, path, isLogEnabled);
      this.registerPATCH(app, path, isLogEnabled);
    });
  }

  registerGET(app, path, map, isLogEnabled) {
    const pathItem = this.parser.getMap()[path];
    const gets = pathItem[methods.GET];

    if (gets) {
      gets.forEach(() => {
        app.get(path, (req, res) => {
          requestHandler(this.parser, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.GET, path);
      });
    }
  }

  registerPOST(app, path, map, isLogEnabled) {
    const pathItem = this.parser.getMap()[path];
    const posts = pathItem[methods.POST];
    if (posts) {
      posts.forEach(() => {
        app.post(path, (req, res) => {
          requestHandler(this.parser, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.POST, path);
      });
    }
  }

  registerPUT(app, path, map, isLogEnabled) {
    const pathItem = this.parser.getMap()[path];
    const puts = pathItem[methods.PUT];
    if (puts) {
      puts.forEach(() => {
        app.put(path, (req, res) => {
          requestHandler(this.parser, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.PUT, path);
      });
    }
  }

  registerDELETE(app, path, map, isLogEnabled) {
    const pathItem = this.parser.getMap()[path];
    const deletes = pathItem[methods.DELETE];
    if (deletes) {
      deletes.forEach(() => {
        app.delete(path, (req, res) => {
          requestHandler(this.parser, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.DELETE, path);
      });
    }
  }

  registerPATCH(app, path, map, isLogEnabled) {
    const pathItem = this.parser.getMap()[path];
    const patches = pathItem[methods.PATCH];
    if (patches) {
      patches.forEach(() => {
        app.patch(path, (req, res) => {
          requestHandler(this.parser, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.PATCH, path);
      });
    }
  }

  /**
   *  Method to log registred path
   */
  logRegisteredPath(isLogEnabled, method, path) {
    if (isLogEnabled) {
      console.log(`REG ${method} ${path}`.magenta);
    }
  }
}
