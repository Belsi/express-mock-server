import express from 'express';
import { startNewRecording, stopRecording } from './api-recorder';

const router = express.Router({});

export const recordingApi = () => {
  router.post('/recording/start', (req, res) => {
    const uuid = startNewRecording();
    res.send({
      id: uuid
    });
  });

  router.post('/recording/:id/stop', (req, res) => {
    const recording = stopRecording(req.params.id);
    if (!recording) {
      res.status(404).send('The monitoring with given ID was not found.');
    }
    res.send(recording);
  });

  return router;
};
