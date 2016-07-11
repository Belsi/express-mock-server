'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('./constants');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isLogEnabled = _config2.default.isLogEnabled;

var Record = function Record(record) {
  _classCallCheck(this, Record);

  this.__record = record;
  this.queryStringParameters = record.request.queryStringParameters;
  this.body = record.request.body;
  this.response = record.response;
};

/**
 *  Class for handling sources
 */


var Handler = function () {
  function Handler(sources) {
    _classCallCheck(this, Handler);

    this.sources = sources;
    this.generateMapFromSources(sources);
  }

  /**
   *  @public
   *  @return {!Object}
   */


  _createClass(Handler, [{
    key: 'getMap',
    value: function getMap() {
      return this.map;
    }

    /**
     *  @public
     */

  }, {
    key: 'resetMap',
    value: function resetMap() {
      this.generateMapFromSources(this.sources);
    }

    /**
     *  Method to initialize sources to map
     *  @param {Object} sources
     */

  }, {
    key: 'generateMapFromSources',
    value: function generateMapFromSources(sources) {
      var GENERATE_TITLE = 'Generate original map from sources';
      if (isLogEnabled) console.time(GENERATE_TITLE);
      this.map = {};
      sources.forEach(this.setSource.bind(this, this.map));
      this.sortMap();
      if (isLogEnabled) console.timeEnd(GENERATE_TITLE);
    }

    /**
     *
     */

  }, {
    key: 'setSource',
    value: function setSource(map, source) {
      source.forEach(this.setRecord.bind(this, map));
    }

    /**
     *
     */

  }, {
    key: 'switchRecord',
    value: function switchRecord(record) {
      var _this = this;

      var SET_NEW_REC = 'Set new record';
      if (isLogEnabled) console.time(SET_NEW_REC);
      var _record$request = record.request;
      var method = _record$request.method;
      var path = _record$request.path;
      var queryStringParameters = _record$request.queryStringParameters;
      var body = _record$request.body;

      var isChanged = false;
      this.map[path][method].forEach(function (changedRecord, index) {
        // console.log('**************'.blue);
        // console.log(JSON.stringify(body));
        // console.log(JSON.stringify(changedRecord.body));
        // console.log(JSON.stringify(body) == JSON.stringify(changedRecord.body));
        if (isQueryStringEqual(queryStringParameters, changedRecord.queryStringParameters) && JSON.stringify(body) === JSON.stringify(changedRecord.body)) {
          // console.log('CHANGE FROM '.green);
          // console.log(JSON.stringify(this.map[path][method][index], null, "  "));
          _this.map[path][method][index] = new Record(record);
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

  }, {
    key: 'setRecord',
    value: function setRecord(map, record) {
      var _record$request2 = record.request;
      var method = _record$request2.method;
      var path = _record$request2.path;

      if (!map[path]) map[path] = {};
      if (!map[path][method]) map[path][method] = [];
      map[path][method].push(new Record(record));
    }

    /**
     *  Method to sort map
     */

  }, {
    key: 'sortMap',
    value: function sortMap() {
      var _this2 = this;

      Object.keys(this.map).forEach(function (path) {
        var pathItem = _this2.map[path];
        var gets = pathItem[_constants.methods.GET];
        if (gets) {
          gets.sort(compare);
        }
        var posts = pathItem[_constants.methods.POST];
        if (posts) {
          posts.sort(compare);
        }
        var puts = pathItem[_constants.methods.PUT];
        if (puts) {
          puts.sort(compare);
        }
        var deletes = pathItem[_constants.methods.DELETE];
        if (deletes) {
          deletes.sort(compare);
        }
        var patches = pathItem[_constants.methods.PATCH];
        if (patches) {
          patches.sort(compare);
        }
      });
    }
  }]);

  return Handler;
}();

/**
 *  @TODO REFAKTOR
 */


function isQueryStringEqual(qs1, qs2) {
  if (qs1 && !qs2 || !qs1 && qs2) return false;
  if (!qs1 && !qs2) return true;
  if (qs1.length !== qs2.length) return false;
  var isEqual = true;
  var qs1ref = {};
  var qs2ref = {};

  qs1.forEach(function (item) {
    qs1ref[item['name']] = item['values'];
  });

  qs2.forEach(function (item) {
    qs2ref[item['name']] = item['values'];
  });

  Object.keys(qs1ref).forEach(function (name) {
    var values = qs1ref[name];
    var qs2Values = qs2ref[name];
    if (qs2Values.length != values.length) {
      isEqual = false;
    } else {
      values.forEach(function (value) {
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
  if (b.queryStringParameters.length != a.queryStringParameters.length) return b.queryStringParameters.length - a.queryStringParameters.length;

  // toto posledni pravidlo je kvuli obecnemu parametru, aby prevazili konkretni nad obecnym.   2 > .*
  var aSpecificCount = 0;
  var bSpecificCount = 0;
  a.queryStringParameters.forEach(function (qs, index) {
    if (qs['values'].indexOf(_constants.REG_ALL) !== -1) aSpecificCount++;
  });
  b.queryStringParameters.forEach(function (qs) {
    if (qs['values'].indexOf(_constants.REG_ALL) !== -1) bSpecificCount++;
  });
  return aSpecificCount - bSpecificCount;
}

exports.default = Handler;