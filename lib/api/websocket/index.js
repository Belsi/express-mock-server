import express from 'express';

const router = express.Router({});

export const websocketApi = wsServer => {
  router.post('/websocket/clients/message', (request, response) => {
    wsServer.clients.forEach(ws => {
      ws.send(JSON.stringify(request.body));
    });

    response.send({
      status: true
    });
  });

  router.post('/websocket/clients/disconnect', (request, response) => {
    wsServer.clients.forEach(ws => {
      ws.close();
    });

    response.send({
      status: true
    });
  });

  return router;
};
