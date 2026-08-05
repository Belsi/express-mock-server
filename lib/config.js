// Specifying an env delimiter allows us to override config when shipping to
// production server. 'foo__bar=2 npm start' will set config to '{foo: {bar: 2}}'
const ENV_DELIMITER = '__';

const expandEnv = (env) =>
  Object.keys(env).reduce((result, key) => {
    const path = key.split(ENV_DELIMITER);
    const leaf = path.pop();

    const parent = path.reduce((node, segment) => {
      if (typeof node[segment] !== 'object' || node[segment] === null) {
        node[segment] = {};
      }

      return node[segment];
    }, result);

    parent[leaf] = env[key];

    return result;
  }, {});

// Remember, never put secrets in default config.
// Use environment variables for production.
const defaults = {
  appName: 'node mock server',
  appVersion: 1,
  defaultLocale: 'en',
  isProduction: process.env.NODE_ENV === 'production',
  isLogEnabled: process.env.LOGGING === 'ON',
  locales: ['cs', 'en'],
  port: process.env.PORT || 8080,
};

// Environment variables take precedence over the defaults.
export default { ...defaults, ...expandEnv(process.env) };