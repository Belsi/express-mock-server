'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nconf = require('nconf');

var _nconf2 = _interopRequireDefault(_nconf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { execSync } from 'child_process';

// Specifying an env delimiter allows us to override config when shipping to
// production server. 'foo__bar=2 gulp' will set config to '{foo: {bar: 2}}'
_nconf2.default.env('__');

// For local development with secrets. Check src/common/_secrets.json file.
// nconf.file('src/common/secrets.json');

// // The semver is for libraries, apps are versioned by git commit SHA.
// const sourceVersion = process.env.SOURCE_VERSION || execSync('git rev-parse HEAD')
//   .toString()
//   .trim();

// Remember, never put secrets in default config.
// Use environment variables for production, and secrets.json for development.
// http://www.codedependant.net/2015/01/31/production-ready-node-configuration
_nconf2.default.defaults({
  appName: 'node mock server',
  appVersion: 1,
  defaultLocale: 'en',
  isProduction: process.env.NODE_ENV === 'production',
  isLogEnabled: process.env.LOGGING === 'ON',
  locales: ['cs', 'en'],
  port: process.env.PORT || 8080
});

exports.default = _nconf2.default.get();