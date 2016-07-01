'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _httpStatusCodes = require('http-status-codes');

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

require('colors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// https://www.npmjs.com/package/colors

var isLogEnabled = _config2.default.isLogEnabled;


function getApi(handler) {

  var app = (0, _express2.default)();

  app.use(_bodyParser2.default.json());

  app.post('/set', function (req, res) {
    if (isLogEnabled) console.log('API set new values'.green);
    req.body.forEach(function (record) {
      // console.log('new record is >');
      // console.log(JSON.stringify(record, null, "  "));
      // console.log('< new record is');
      handler.switchRecord(record);
    });
    res.status(_httpStatusCodes2.default.ACCEPTED).end(); //.send(req.body)
  });

  app.post('/reset', function (req, res) {
    if (isLogEnabled) console.log('API Reset'.green);
    handler.resetMap();
    res.status(_httpStatusCodes2.default.ACCEPTED).end();
  });

  app.on('mount', function () {
    console.log(('* Api URL        ' + app.mountpath).yellow);
  });

  return app;
}

exports.default = getApi;