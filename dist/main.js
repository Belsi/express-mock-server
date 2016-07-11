'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // https://www.npmjs.com/package/colors


exports.createServer = createServer;
exports.runServer = runServer;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _httpStatusCodes = require('http-status-codes');

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _sources = require('./sources.handler');

var _sources2 = _interopRequireDefault(_sources);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _constants = require('./constants');

var _MatchingResult = require('./src/MatchingResult');

var _MatchingResult2 = _interopRequireDefault(_MatchingResult);

var _MatchItem = require('./src/MatchItem');

var _MatchItem2 = _interopRequireDefault(_MatchItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isLogEnabled = _config2.default.isLogEnabled;

var Server = function () {

  /**
   *
   */

  function Server(sources, serverConfig) {
    _classCallCheck(this, Server);

    this.app = (0, _express2.default)();
    this.serverConfig = serverConfig;

    this.startLogger(isLogEnabled, this.app, _morgan2.default);

    this.handler = new _sources2.default(sources);

    console.log('******* CONFIG **********'.yellow);

    this.app.use(_bodyParser2.default.json());

    var DEFAULT_CONTRLOL_API_URL = '/api/v1';
    var controlApiUrl = DEFAULT_CONTRLOL_API_URL;
    if (serverConfig.controlApiUrl) {
      controlApiUrl = serverConfig.controlApiUrl;
    }
    this.app.use(controlApiUrl, (0, _api2.default)(this.handler));
  }

  /**
   *                  exist     dont      exist     dont
   *  req/master        0         1         0         1
   *  bundle/slave      0         0         1         1
   *  result =          strict    default   no        subset/no
   *
   *  @param {Object} masterQS          request
   *  @param {Array.<Object>} slaveQS   bundle
   */


  _createClass(Server, [{
    key: 'getMatchingResultByQueryStrings',
    value: function getMatchingResultByQueryStrings(masterQS, slaveQS) {
      var TYPE_SPECIFIC_REGEX = 'SPECIFIC_REGEX';
      var isMasterExist = !!masterQS && JSON.stringify(masterQS) !== '{}';
      var isSlaveExist = !!slaveQS;
      // console.log('+++++++++++'.green);
      // console.log(masterQS);
      // console.log(slaveQS);
      // console.log('+++++++++++'.blue);
      if (!isMasterExist && !isSlaveExist) return _MatchingResult.MATCH_STRICT;
      if (!isMasterExist && isSlaveExist) return _MatchingResult.MATCH_NO;
      if (isMasterExist && !isSlaveExist) return _MatchingResult.MATCH_DEFAULT;
      var result = null;
      var countOfMatches = 0;
      var countOfMatchesUnspecific = 0;
      slaveQS.forEach(function (_ref) {
        var name = _ref.name;
        var values = _ref.values;
        var type = _ref.type;

        if (!masterQS[name]) {
          result = _MatchingResult.MATCH_NO;
        } else {
          var isContained = values.indexOf(masterQS[name]) !== -1;

          var isSpecific = values.indexOf(_constants.REG_ALL) === -1;
          if (type === TYPE_SPECIFIC_REGEX) {
            isSpecific = true;
            if (!isContained) {
              values.forEach(function (value) {
                var regex = new RegExp(value);

                // console.log(name);
                // console.log(regex);
                // console.log(masterQS[name]);
                // console.log('regex.test(masterQS[name]) ' +regex.test(masterQS[name]));
                if (regex.test(masterQS[name])) {
                  isSpecific = false;
                }
              });
            }
          }

          if (isSpecific && !isContained) {
            result = _MatchingResult.MATCH_NO;
          } else {
            if (!isSpecific) countOfMatchesUnspecific++;
            countOfMatches++;
          }
        }
      });

      if (result !== null) return result;

      var masterQSLength = Object.keys(masterQS).length;
      var slaveQSLength = slaveQS.length;

      if (slaveQSLength === countOfMatches && countOfMatches === masterQSLength) return _MatchingResult.MATCH_STRICT;
      return new _MatchingResult2.default(_MatchingResult.MATCH_TYPE.SUBSET, countOfMatches, countOfMatchesUnspecific);
    }

    /**
     *
     */

  }, {
    key: 'matchRecordGet',
    value: function matchRecordGet(req, bundle) {
      var matches = this.getMatchesByQueryString(req, bundle);
      matches.sort(function (a, b) {
        return b.result.compare(a.result);
      });
      // console.log('+++++++++++++++++');
      // myLog(matches);
      if (matches.length === 0) return null;
      return matches[0].record;
    }

    /**
     *
     */

  }, {
    key: 'getMatchesByQueryString',
    value: function getMatchesByQueryString(req, bundle) {
      var _this = this;

      var matches = [];
      bundle.forEach(function (record) {
        var result = _this.getMatchingResultByQueryStrings(req.query, record.queryStringParameters);
        // console.log('result');
        // console.log(result);
        if (!result.isNo()) {
          matches.push(new _MatchItem2.default(record, result));
        }
      });
      return matches;
    }

    /**
     *  TODO refaktor jako v getu do MatchItem
     */

  }, {
    key: 'matchRecordPost',
    value: function matchRecordPost(req, bundle) {
      var matches = this.getMatchesByQueryString(req, bundle);
      matches.sort(function (a, b) {
        return b.result.compare(a.result);
      });

      var requestBody = req.body;

      // console.log('***********');
      // console.log(requestBody);
      // console.log('=========== matches count: '+matches.length);
      // myLog(matches);
      // console.log('..................');

      var searchedRecord = null;
      var searchedRecordDefault = null;
      var searchedRecordRegex = null;
      matches.forEach(function (_ref2) {
        var record = _ref2.record;
        var body = record.body;

        if (!!body) {
          if (!!body.type && !!body.value) {

            switch (body.type) {
              case "REGEX":
                {
                  var value = body.value;

                  var re = new RegExp(value, 'g');
                  var str = JSON.stringify(requestBody);
                  var result = str.match(re);
                  // console.log('+++++++++++++');
                  // console.log(str);
                  // console.log(value);
                  // console.log(result);

                  var isMatched = !!result;
                  if (isMatched && !searchedRecordRegex) {
                    searchedRecordRegex = record;
                  }
                  // console.log('REGEX '+!!result);
                  break;
                }
              case "JSON":
                {
                  // match only filled
                  if (body.matchType && body.matchType === 'ONLY_MATCHING_FIELDS') {
                    var _ret = function () {
                      var recordBodyValue = JSON.parse(body.value);

                      // let requestBodyKeysLength = Object.keys(requestBody).length;
                      // let recordBodyKeysLength = Object.keys(recordBodyValue).length;
                      // if(requestBodyKeysLength === recordBodyKeysLength){
                      var isMatched = true;
                      Object.keys(recordBodyValue).forEach(function (key) {
                        var value = recordBodyValue[key];
                        if (JSON.stringify(value) !== JSON.stringify(requestBody[key])) {
                          isMatched = false;
                        }
                      });
                      if (isMatched && !searchedRecord) {
                        searchedRecord = record;
                      }
                      // console.log('TEST FOR MATCH = '+isMatched);
                      // }else{
                      // console.log('NO MATCH');
                      // }
                      return 'break'; // break only if type is ONLY_MATCHING_FIELDS
                    }();

                    if (_ret === 'break') break;
                  }
                }
              case "STRING":
              default:
                {
                  // exact match
                  // console.log('******');
                  // console.log(body.value);
                  // console.log('------------');
                  // console.log(JSON.stringify(requestBody));
                  // console.log('=============');
                  // console.log(body.value === JSON.stringify(requestBody));

                  var _isMatched = body.value === JSON.stringify(requestBody);
                  if (_isMatched && !searchedRecord) {
                    searchedRecord = record;
                  }
                  // console.log('EXACT DEFAULT '+isMatched);
                }
            }
          } else {
            var _isMatched2 = body === JSON.stringify(requestBody);
            if (_isMatched2 && !searchedRecord) {
              searchedRecord = record;
            }
            // console.log('EXACT');
            // exact match
          }
        } else {

          var isRequestBodyEmpty = !requestBody || JSON.stringify(requestBody) === '{}';
          // console.log('ELSE');
          // console.log('isRequestBodyEmpty '+isRequestBodyEmpty);
          // console.log(requestBody);
          if (isRequestBodyEmpty && !searchedRecord) {
            searchedRecord = record;
          } else if (!searchedRecordDefault) {
            searchedRecordDefault = record;
          }
        }

        // myLog(record);
      });

      if (!searchedRecord) {
        searchedRecord = searchedRecordRegex;
      }
      if (!searchedRecord) {
        searchedRecord = searchedRecordDefault;
      }

      // console.log('POST RESULT'.yellow);
      // console.log(JSON.stringify(searchedRecord, null, "  "));
      return searchedRecord;
    }

    /**
     *
     */

  }, {
    key: 'cb',
    value: function cb(req, res) {
      var map = this.handler.getMap();
      var method = req.method;
      var path = req.route.path;
      var bundle = map[path][method];

      // console.log(method);
      // console.log(req.body);

      var response = null;
      var matchedRecord = null;

      if (bundle.length === 1) {
        response = bundle[0].response;
      } else {

        switch (method) {

          case _constants.methods.POST:
            {
              matchedRecord = this.matchRecordPost(req, bundle);
              break;
            }

          case _constants.methods.GET:
          case _constants.methods.PUT:
          case _constants.methods.DELETE:
          case _constants.methods.PATCH:
          default:
            {
              matchedRecord = this.matchRecordGet(req, bundle);
            }
        }

        if (matchedRecord !== null) {
          response = matchedRecord.response;
        }

        if (response === null) {
          console.log(_colors2.default.bgRed.white('ERR no reaponse but why?'));
          console.log('method ' + method + '    path ' + path);
          console.log('QUERY'.yellow);
          console.log(req.query);
          console.log('BODY'.yellow);
          console.log(req.body);
          res.status(_httpStatusCodes2.default.NOT_FOUND).send('NOT FOUND - no reaponse but why? Look to console.').end();
          return;
        }
      }

      if (!!response.headers) {
        response.headers.forEach(function (headerItem) {
          res.setHeader(headerItem['name'], headerItem['values'][0]);
        });
      }

      var APPLICATION_JSON = 'application/json';
      res.status(response.statusCode).type(APPLICATION_JSON).send(response.body).end();
    }
  }, {
    key: 'init',


    /**
     *
     */
    value: function init() {
      var _this2 = this;

      // registrace paths
      var map = this.handler.getMap();

      Object.keys(map).forEach(function (path) {
        var pathItem = map[path];
        var gets = pathItem[_constants.methods.GET];
        if (gets) {
          gets.forEach(function (record) {
            _this2.app.get(path, _this2.cb.bind(_this2));
            _this2.logRegistredPath(isLogEnabled, _constants.methods.GET, path);
          });
        }

        var posts = pathItem[_constants.methods.POST];
        if (posts) {
          posts.forEach(function (record) {
            _this2.app.post(path, _this2.cb.bind(_this2));
            _this2.logRegistredPath(isLogEnabled, _constants.methods.POST, path);
          });
        }

        var puts = pathItem[_constants.methods.PUT];
        if (puts) {
          puts.forEach(function (record) {
            _this2.app.put(path, _this2.cb.bind(_this2));
            _this2.logRegistredPath(isLogEnabled, _constants.methods.PUT, path);
          });
        }

        var deletes = pathItem[_constants.methods.DELETE];
        if (deletes) {
          deletes.forEach(function (record) {
            _this2.app.delete(path, _this2.cb.bind(_this2));
            _this2.logRegistredPath(isLogEnabled, _constants.methods.DELETE, path);
          });
        }

        var patches = pathItem[_constants.methods.PATCH];
        if (patches) {
          patches.forEach(function (record) {
            _this2.app.patch(path, _this2.cb.bind(_this2));
            _this2.logRegistredPath(isLogEnabled, _constants.methods.PATCH, path);
          });
        }
      });
    }

    /**
     *
     */

  }, {
    key: 'start',
    value: function start() {
      this.init();
      var port = _config2.default.port;

      var serverPort = port;
      if (this.serverConfig.port) {
        serverPort = this.serverConfig.port;
      }

      this.serverStart(this.app, serverPort);
    }

    /**
     *  Method to log registred path
     */

  }, {
    key: 'logRegistredPath',
    value: function logRegistredPath(isLogEnabled, method, path) {
      if (isLogEnabled) {
        console.log(('REG ' + method + ' ' + path).magenta);
      }
    }

    /**
     *  Method to start logger of requests
     *    Actual format
     *      0.230 ms GET 200 /some/url/
     *    More option
     *      https://github.com/expressjs/morgan
     */

  }, {
    key: 'startLogger',
    value: function startLogger(isLogEnabled, app, morgan) {
      if (isLogEnabled) {
        this.app.use(morgan(':response-time ms :method :status :url'));
      }
    }

    /**
     *  Method to start server
     */

  }, {
    key: 'serverStart',
    value: function serverStart(app, port) {
      this.app.listen(port, function () {
        console.log(('* Server port    ' + port).yellow);
        console.log('*************************'.yellow);
        console.log(_colors2.default.bgGreen.white('Server START'));
      });
    }
  }]);

  return Server;
}();

/**
 *
 */


function myLog(obj) {
  console.log(JSON.stringify(obj, null, "  "));
}

/**
 *
 *  @param {Object} serverConfig
              controlApiUrl    ['/api/v1']
              port             [8080]
 */
function createServer(sources) {
  var serverConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return new Server(sources, serverConfig);
}

/**
 *  Method to run whole server
 */
function runServer(sources) {
  var serverConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var server = new Server(sources, serverConfig);
  server.start();
  return server;
}