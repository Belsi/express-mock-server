import urls from './urls';
import responseKey, { responseKeyParam } from './responsekey';
import path from 'path';

const q1q2q3FilledQs = [
  { name: 'q1', values: ['.*'] },
  { name: 'q2', values: ['.*'] },
  { name: 'q3', values: ['.*'] },
];

const q1filledQs = [{ name: 'q1', values: ['1'] }];

const dynamicResponseQs = [{ name: 'q1', values: ['.*'] }];

const sources = [
  [
    // codes
    createSource({ method: 'GET', path: urls.base, statusCode: 200 }),
    createSource({ method: 'GET', path: urls.error, statusCode: 500 }),
    createSource({ method: 'POST', path: urls.error, statusCode: 500 }),
    createSource({ method: 'GET', path: urls.notFound, statusCode: 404 }),
    // query strings
    createSource({
      method: 'GET',
      path: urls.items,
      statusCode: 200,
      key: responseKey.qsOptionalEmpty,
    }),
    createSource({
      method: 'GET',
      path: urls.items,
      statusCode: 200,
      key: responseKey.qsOptionalQ1Q2Q3Filed,
      queryStringParameters: q1q2q3FilledQs,
    }),
    createSource({
      method: 'GET',
      path: urls.items,
      statusCode: 200,
      key: responseKey.qsOptionalQ1filled,
      queryStringParameters: q1filledQs,
    }),
    // item
    createSource({
      method: 'GET',
      path: urls.item,
      statusCode: 200,
      key: responseKey.urlParamBase,
    }),
    createSource({
      method: 'GET',
      path: urls.itemHardId,
      statusCode: 200,
      key: responseKey.urlParamHardId,
    }),
    createSource({
      method: 'GET',
      path: urls.items,
      statusCode: 200,
      key: responseKey.qsMultiQ1,
      queryStringParameters: [{ name: 'q1', values: ['1', '2', '3'] }],
    }),

    // dynamic response

    createDynamicSource({
      method: 'POST',
      path: urls.dynamicResponse,
      statusCode: 200,
      key: responseKey.dynamicResponse,
      queryStringParameters: dynamicResponseQs,
    }),

    // response with file
    {
      request: {
        method: 'GET',
        path: urls.itemsLogo,
      },
      response: {
        statusCode: 200,
        file: {
          type: 'image/jpg',
          path: path.join(__dirname, 'image.jpg'),
        },
      },
    },

    {
      request: {
        method: 'POST',
        path: '/docs/upload',
        useFullRequestInResponse: true,
      },
      response: () => {
        return {
          statusCode: 200,
        };
      },
    },
  ],
];

export default sources;

/**
 *
 */
function createDynamicSource({
  method,
  path,
  statusCode,
  key,
  queryStringParameters = null,
}) {
  let body = {};
  body[responseKeyParam] = key;

  return {
    request: {
      method,
      path,
      queryStringParameters,
      body: {
        type: 'JSON',
        value: JSON.stringify({
          bodyParam1: 'bodyValue1',
        }),
        matchType: 'ONLY_MATCHING_FIELDS',
      },
    },
    response: function (urlParams, qsParams, bodyParams) {
      body['requestParams'] = {
        qsParams,
        bodyParams,
        urlParams,
      };
      return {
        statusCode,
        body: JSON.stringify(body),
      };
    },
  };
}

/**
 *
 */
export function createSource({
  method,
  path,
  statusCode,
  delay,
  key,
  formDataKey = null,
  queryStringParameters = null,
}) {
  let body = {};
  body[responseKeyParam] = key;

  return {
    request: {
      method,
      path,
      formDataKey,
      queryStringParameters,
    },
    response: {
      delay,
      statusCode,
      body: JSON.stringify(body),
    },
  };
}
