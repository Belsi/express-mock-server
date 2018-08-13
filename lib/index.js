import 'colors';
import config from './config';
import { App } from './app';

const { port } = config;
let serverInstance = null;

/**
 * Method to start server.
 *
 * @param sources
 * @param {Object} serverConfig
 * @param serverConfig.controlApiUrl    ['/api/v1']
 * @param serverConfig.port             [8080]
 */
function serverStart(sources, serverConfig = {}) {
  const app = new App(sources, serverConfig);
  const port = getServerPort(serverConfig);
  serverInstance = app.start(port, () => {
    console.log(`* Server port    ${port}`.yellow);
    console.log(`*************************`.yellow);
    console.log('Server START'.bgGreen.white);
  });
}

/**
 * Method to stop server.
 */
function serverStop() {
  if (serverInstance) {
    serverInstance.close();
  }
}

function getServerPort(serverConfig) {
  return serverConfig.port ? serverConfig.port : port;
}

module.exports = {
  serverStart,
  serverStop
};
