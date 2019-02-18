import uuidv1 from 'uuid/v1';

const recordingStore = {};
let isRecordingActive = false;

const isNotRecordingApiPath = (apiUrl, path) => {
  return path.indexOf(`${apiUrl}/recording/`) === -1;
};

export const startNewRecording = () => {
  const uuid = uuidv1();
  recordingStore[uuid] = [];
  isRecordingActive = true;
  return uuid;
};

export const stopRecording = uuid => {
  const recording = recordingStore[uuid];
  delete recordingStore[uuid];
  isRecordingActive = Object.keys(recordingStore).length > 0;
  return recording;
};

export const apiRecorder = apiUrl => {
  return (req, res, next) => {
    if (isRecordingActive && isNotRecordingApiPath(apiUrl, req.path)) {
      const originalSend = res.send;
      res.send = function(body) {
        originalSend.call(this, body);

        Object.keys(recordingStore).forEach(recordUuid => {
          recordingStore[recordUuid].push({
            url: req.baseUrl,
            path: req.path,
            method: req.method,
            params: req.params,
            query: req.query,
            body: req.body,
            responseBody: !body ? {} : JSON.parse(body)
          });
        });
      };
    }

    next();
  };
};
