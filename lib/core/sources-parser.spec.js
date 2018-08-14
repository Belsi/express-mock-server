import { SourcesParser } from './sources-parser';
import assert from 'assert';

describe('source-parser', () => {
  it('should parse source', () => {
    // given
    const sources = [
      [
        {
          request: {
            method: 'GET',
            path: '/api/test'
          },
          response: {
            statusCode: 200,
            body: JSON.stringify({
              key: 'value'
            })
          }
        }
      ]
    ];

    // when
    const parser = new SourcesParser(sources);

    // then
    assert.equal(Object.keys(parser.map).length, 1);
    assert.equal(Object.keys(parser.map)[0], '/api/test');
  });
});
