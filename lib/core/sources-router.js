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
      this.registerGET(app, path, map, isLogEnabled);
      this.registerPOST(app, path, map, isLogEnabled);
      this.registerPUT(app, path, map, isLogEnabled);
      this.registerDELETE(app, path, map, isLogEnabled);
      this.registerPATCH(app, path, map, isLogEnabled);
    });
  }

  registerGET(app, path, map, isLogEnabled) {
    const pathItem = map[path];
    const gets = pathItem[methods.GET];
    if (gets) {
      gets.forEach(() => {
        app.get(path, (req, res) => {
          return requestHandler(map, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.GET, path);
      });
    }
  }

  registerPOST(app, path, map, isLogEnabled) {
    const pathItem = map[path];
    const posts = pathItem[methods.POST];
    if (posts) {
      posts.forEach(() => {
        app.post(path, (req, res) => {
          return requestHandler(map, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.POST, path);
      });
    }
  }

  registerPUT(app, path, map, isLogEnabled) {
    const pathItem = map[path];
    const puts = pathItem[methods.PUT];
    if (puts) {
      puts.forEach(() => {
        app.put(path, (req, res) => {
          return requestHandler(map, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.PUT, path);
      });
    }
  }

  registerDELETE(app, path, map, isLogEnabled) {
    const pathItem = map[path];
    const deletes = pathItem[methods.DELETE];
    if (deletes) {
      deletes.forEach(() => {
        app.delete(path, (req, res) => {
          return requestHandler(map, req, res);
        });
        this.logRegisteredPath(isLogEnabled, methods.DELETE, path);
      });
    }
  }

  registerPATCH(app, path, map, isLogEnabled) {
    const pathItem = map[path];
    const patches = pathItem[methods.PATCH];
    if (patches) {
      patches.forEach(() => {
        app.patch(path, (req, res) => {
          return requestHandler(map, req, res);
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
