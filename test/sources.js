import urls from './urls';
import responseKey, { responseKeyParam } from './responsekey';

const q1q2q3FilledQs = [
  { name: 'q1', values: ['.*'] },
  { name: 'q2', values: ['.*'] },
  { name: 'q3', values: ['.*'] }
];

const q1filledQs = [{ name: 'q1', values: ['1'] }];

const dynamicResponseQs = [{ name: 'q1', values: ['.*'] }];

const sources = [
  [
    // codes
    createSource('GET', urls.base, 200),
    createSource('GET', urls.error, 500),
    createSource('POST', urls.error, 500),
    createSource('GET', urls.notFound, 404),
    // query strings
    createSource('GET', urls.items, 200, responseKey.qsOptionalEmpty),
    createSource(
      'GET',
      urls.items,
      200,
      responseKey.qsOptionalQ1Q2Q3Filed,
      q1q2q3FilledQs
    ),
    createSource(
      'GET',
      urls.items,
      200,
      responseKey.qsOptionalQ1filled,
      q1filledQs
    ),
    // item
    createSource('GET', urls.item, 200, responseKey.urlParamBase),
    // createSource('GET', urls.itemHardId, 200, responseKey.urlParamHardId),

    // dynamic response

    createDynamicSource(
      'POST',
      urls.dynamicResponse,
      200,
      responseKey.dynamicResponse,
      dynamicResponseQs
    )
  ]
];

export default sources;

/**
 *
 */
function createDynamicSource(
  method,
  path,
  statusCode,
  key,
  queryStringParameters = null
) {
  let body = {};
  body[responseKeyParam] = key;

  return {
    request: {
      method: method,
      path: path,
      queryStringParameters: queryStringParameters,
      body: {
        type: 'JSON',
        value: JSON.stringify({
          bodyParam1: 'bodyValue1'
        }),
        matchType: 'ONLY_MATCHING_FIELDS'
      }
    },
    response: function(urlParams, qsParams, bodyParams) {
      body['requestParams'] = {
        qsParams,
        bodyParams,
        urlParams
      };
      return {
        statusCode: statusCode,
        body: JSON.stringify(body)
      };
    }
  };
}

/**
 *
 */
function createSource(
  method,
  path,
  statusCode,
  key,
  queryStringParameters = null
) {
  let body = {};
  body[responseKeyParam] = key;

  return {
    request: {
      method: method,
      path: path,
      queryStringParameters: queryStringParameters
    },
    response: {
      statusCode: statusCode,
      body: JSON.stringify(body)
    }
  };
}
