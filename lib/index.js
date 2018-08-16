import 'colors';
import config from './config';
import { App } from './app';

const { port } = config;
let server = null;

/**
 * Method to start server.
 *
 * @param sources
 * @param {Object} serverConfig
 * @param serverConfig.controlApiUrl    ['/api/v1']
 * @param serverConfig.port             [8080]
 */
export function serverStart(sources, serverConfig = {}) {
  const app = new App(sources, serverConfig);
  const port = getServerPort(serverConfig);
  server = app.start(port, () => {
    console.log(`* Server port    ${port}`.yellow);
    console.log(`*************************`.yellow);
    console.log('Server START'.bgGreen.white);
  });
  return server;
}

/**
 * Method to stop server.
 */
export function serverStop() {
  if (server) {
    server.close();
  }
}

function getServerPort(serverConfig) {
  return serverConfig.port ? serverConfig.port : port;
}
