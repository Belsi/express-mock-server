import urls from './urls';
import responseKey, { responseKeyParam } from './responsekey';

function createSource(method, path, statusCode, body = {}, queryStringParameters = null){
  return {
    request: {
      'method': method,
      'path': path,
      'queryStringParameters': queryStringParameters
    },
    response: {
      'statusCode': statusCode,
      'body': JSON.stringify(body)
    }
  };
}

const qsOptionalQs = [
  {'name': 'q1', 'values': ['.*']},
  {'name': 'q2', 'values': ['.*']},
  {'name': 'q3', 'values': ['.*']}
];
let qsOptionalQ1Q2Q3Filed = {}
qsOptionalQ1Q2Q3Filed[responseKeyParam] = responseKey.qsOptionalQ1Q2Q3Filed;



let qsOptionalEmpty = {}
qsOptionalEmpty[responseKeyParam] = responseKey.qsOptionalEmpty;



const q1filledQs = [
  {'name': 'q1', 'values': ['1']}
];
let q1filled = {}
q1filled[responseKeyParam] = responseKey.qsOptionalQ1filled;



const baseBody = {
  "data": 21
};

const sources = [
  [
    // codes
    createSource('GET', urls.base, 200, baseBody),
    createSource('GET', urls.error, 500),
    createSource('GET', urls.notFound, 404),
    // query strings
    createSource('GET', urls.items, 200, qsOptionalEmpty),
    createSource('GET', urls.items, 200, qsOptionalQ1Q2Q3Filed, qsOptionalQs),
    createSource('GET', urls.items, 200, q1filled, q1filledQs),
  ]
];

export default sources;