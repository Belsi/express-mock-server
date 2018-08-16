import { methods, REG_ALL } from './../constants';
import config from './../config';

const { isLogEnabled } = config;

class Record {
  constructor(record) {
    this.__record = record;
    this.queryStringParameters = record.request.queryStringParameters;
    this.body = record.request.body;
    this.response = record.response;
  }
}

/**
 *  Class for handling sources
 */
export class SourcesParser {
  constructor(sources) {
    this.sources = sources;
    this.generateMapFromSources(sources);
  }

  /**
   *  @public
   *  @return {!Object}
   */
  getMap() {
    return this.map;
  }

  /**
   *  @public
   */
  resetMap() {
    this.generateMapFromSources(this.sources);
  }

  /**
   *  Method to initialize sources to map
   *  @param {Object} sources
   */
  generateMapFromSources(sources) {
    const GENERATE_TITLE = 'Generate original map from sources';
    if (isLogEnabled) {
      console.time(GENERATE_TITLE);
    }

    this.map = {};
    sources.forEach(source => {
      this.setSource(this.map, source);
    });
    this.sortMap();

    if (isLogEnabled) {
      console.timeEnd(GENERATE_TITLE);
    }
  }

  /**
   *
   */
  setSource(map, source) {
    source.forEach(record => {
      this.setRecord(map, record);
    });
  }

  /**
   *
   */
  switchRecord(record) {
    const SET_NEW_REC = 'Set new record';
    if (isLogEnabled) console.time(SET_NEW_REC);
    let { method, path, queryStringParameters, body } = record.request;
    let isChanged = false;
    this.map[path][method].forEach((changedRecord, index) => {
      // console.log('**************'.blue);
      // console.log(JSON.stringify(body));
      // console.log(JSON.stringify(changedRecord.body));
      // console.log(JSON.stringify(body) == JSON.stringify(changedRecord.body));
      if (
        isQueryStringEqual(
          queryStringParameters,
          changedRecord.queryStringParameters
        ) &&
        JSON.stringify(body) === JSON.stringify(changedRecord.body)
      ) {
        // console.log('CHANGE FROM '.green);
        // console.log(JSON.stringify(this.map[path][method][index], null, "  "));
        this.map[path][method][index] = new Record(record);
        // console.log('CHANGE TO '.blue);
        // console.log(JSON.stringify(this.map[path][method][index], null, "  "));
        isChanged = true;
      }
    });
    if (!isChanged) {
      this.setRecord(this.map, record);
    }
    this.sortMap();
    if (isLogEnabled) console.timeEnd(SET_NEW_REC);
  }

  /**
   *
   */
  setRecord(map, record) {
    let { method, path } = record.request;
    if (!map[path]) map[path] = {};
    if (!map[path][method]) map[path][method] = [];
    map[path][method].push(new Record(record));
  }

  /**
   *  Method to sort map
   */
  sortMap() {
    Object.keys(this.map).forEach(path => {
      let pathItem = this.map[path];
      let gets = pathItem[methods.GET];
      if (gets) {
        gets.sort(compare);
      }
      let posts = pathItem[methods.POST];
      if (posts) {
        posts.sort(compare);
      }
      let puts = pathItem[methods.PUT];
      if (puts) {
        puts.sort(compare);
      }
      let deletes = pathItem[methods.DELETE];
      if (deletes) {
        deletes.sort(compare);
      }
      let patches = pathItem[methods.PATCH];
      if (patches) {
        patches.sort(compare);
      }
    });
  }
}

/**
 * TODO: refactoring
 */
function isQueryStringEqual(qs1, qs2) {
  if ((qs1 && !qs2) || (!qs1 && qs2)) return false;
  if (!qs1 && !qs2) return true;
  if (qs1.length !== qs2.length) return false;
  let isEqual = true;
  let qs1ref = {};
  let qs2ref = {};

  qs1.forEach(item => {
    qs1ref[item['name']] = item['values'];
  });

  qs2.forEach(item => {
    qs2ref[item['name']] = item['values'];
  });

  Object.keys(qs1ref).forEach(name => {
    let values = qs1ref[name];
    let qs2Values = qs2ref[name];
    if (qs2Values.length != values.length) {
      isEqual = false;
    } else {
      values.forEach(value => {
        if (qs2Values.indexOf(value) === -1) {
          isEqual = false;
        }
      });
    }
  });
  return isEqual;
}

/**
 *  Method to compare two requests for sorting by params count
 */
function compare(a, b) {
  if (!a.queryStringParameters && !b.queryStringParameters) return 0;
  if (!a.queryStringParameters) return 1;
  if (!b.queryStringParameters) return -1;
  if (b.queryStringParameters.length != a.queryStringParameters.length)
    return b.queryStringParameters.length - a.queryStringParameters.length;

  // toto posledni pravidlo je kvuli obecnemu parametru, aby prevazili konkretni nad obecnym.   2 > .*
  let aSpecificCount = 0;
  let bSpecificCount = 0;
  a.queryStringParameters.forEach((qs, index) => {
    if (qs['values'].indexOf(REG_ALL) !== -1) aSpecificCount++;
  });
  b.queryStringParameters.forEach(qs => {
    if (qs['values'].indexOf(REG_ALL) !== -1) bSpecificCount++;
  });
  return aSpecificCount - bSpecificCount;
}
