// http://www.codedependant.net/2015/01/31/production-ready-node-configuration
import nconf from 'nconf';
// import { execSync } from 'child_process';

// Specifying an env delimiter allows us to override config when shipping to
// production server. 'foo__bar=2 gulp' will set config to '{foo: {bar: 2}}'
nconf.env('__');

// For local development with secrets. Check src/common/_secrets.json file.
// nconf.file('src/common/secrets.json');

// // The semver is for libraries, apps are versioned by git commit SHA.
// const sourceVersion = process.env.SOURCE_VERSION || execSync('git rev-parse HEAD')
//   .toString()
//   .trim();

// Remember, never put secrets in default config.
// Use environment variables for production, and secrets.json for development.
nconf.defaults({
  appName: 'node mock server',
  appVersion: 1,
  defaultLocale: 'en',
  isProduction: process.env.NODE_ENV === 'production',
  isLogEnabled: process.env.LOGGING === 'ON',
  locales: ['cs', 'en'],
  port: process.env.PORT || 8080
});

export default nconf.get();
