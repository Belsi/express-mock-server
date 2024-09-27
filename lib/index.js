import 'colors';
import config from './config';
import { App } from './app';
import ws from 'ws';

const { port } = config;
let server,
  wsServer = null;

/**
 * Method to start server.
 *
 * @param sources
 * @param {Object} serverConfig
 * @param serverConfig.controlApiUrl    ['/api/v1']
 * @param serverConfig.port             [8080]
 * @param serverConfig.webSocketEnabled false
 */
export function serverStart(sources, serverConfig = {}, customMiddlewareFn) {
  const app = new App(sources, serverConfig, customMiddlewareFn);
  const port = getServerPort(serverConfig);
  server = app.start(port, () => {
    console.log(`* Server port    ${port}`.yellow);
    console.log(`*************************`.yellow);
    console.log('Server START'.bgGreen.white);
  });

  if (serverConfig.webSocketEnabled) {
    wsServer = startWebSocket(server);
    app.initWebSocketApi(wsServer);
  }

  return server;
}

/**
 * Method to stop server.
 */
export function serverStop() {
  if (server) {
    server.close();
  }
  if (wsServer) {
    wsServer.close();
  }
}

function startWebSocket(server) {
  const wsServer = new ws.Server({ noServer: true });
  wsServer.on('connection', (socket) => {
    console.log('WebSocket client connected');
    socket.on('message', (message) => {
      console.log('WebSocket client message received');
      console.log(message);
    });
    socket.on('close', () => console.log('WebSocket client disconnected'));
  });

  server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
      wsServer.emit('connection', socket, request);
    });
  });

  return wsServer;
}

function getServerPort(serverConfig) {
  return serverConfig.port ? serverConfig.port : port;
}
