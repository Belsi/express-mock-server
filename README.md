# express-mock-server
Mock server powered by Express.js

## Installation
```
npm i -D express-mock-server
```

## Example of source file
```javascript
module.exports = [
  {
    request: {
      'method': 'GET',
      'path': '/some-url'
    },
    response: {
      'statusCode': 200,
      'body': JSON.stringify({
        'param1': 'some text',
        'param2': 123123,
        'param3': false
      })
    }
  }
];
```

Response can be a function 
```javascript
response: function(urlParams, qsParams, bodyParams) {
  ...
```

## Basic use

```javascript
import { serverStart } from 'express-mock-server';

var sources = [
  require('./mock/source1.js'),
  require('./mock/source2.js'),
  ...
];

// this is default configuration
var opt_serverConfig = {
  port: 8080,
  controlApiUrl: '/api/v1'
};

/**
 *  Return strated Server instance
     function can be called are 
        start
        close
 *  @param {Array} sources
 *  @param {?Object} opt_serverConfig
 *  @return {Server}
 */
serverStart(sources [, opt_serverConfig])
  
```

## Advanced configuration
The following environment variables can be set
- `LOGGING`: If set to 'ON', enables request logging in the console.
- `PORT`: Optionally sets the default port to use when it is not explicitly passed to `serverStart(...)`.