import { getMatchesByQueryString } from './query-string-matcher';

/**
 * TODO refaktor jako v getu do MatchItem
 */
export const matchRecordPost = (req, bundle) => {
  let matches = getMatchesByQueryString(req, bundle);
  matches.sort((a, b) => {
    return b.result.compare(a.result);
  });

  let requestBody = req.body;

  // console.log('***********');
  // console.log(requestBody);
  // console.log('=========== matches count: '+matches.length);
  // myLog(matches);
  // console.log('..................');

  let searchedRecord = null;
  let searchedRecordDefault = null;
  let searchedRecordRegex = null;
  matches.forEach(({ record }) => {
    let { body } = record;
    if (!!body) {
      if (!!body.type && !!body.value) {
        switch (body.type) {
          case 'REGEX': {
            let value = body.value;

            var re = new RegExp(value, 'g');
            var str = JSON.stringify(requestBody);
            var result = str.match(re);
            // console.log('+++++++++++++');
            // console.log(str);
            // console.log(value);
            // console.log(result);

            let isMatched = !!result;
            if (isMatched && !searchedRecordRegex) {
              searchedRecordRegex = record;
            }
            // console.log('REGEX '+!!result);
            break;
          }
          case 'JSON': {
            // match only filled
            if (body.matchType && body.matchType === 'ONLY_MATCHING_FIELDS') {
              let recordBodyValue = JSON.parse(body.value);

              // let requestBodyKeysLength = Object.keys(requestBody).length;
              // let recordBodyKeysLength = Object.keys(recordBodyValue).length;
              // if(requestBodyKeysLength === recordBodyKeysLength){
              let isMatched = true;
              Object.keys(recordBodyValue).forEach(key => {
                let value = recordBodyValue[key];
                if (
                  JSON.stringify(value) !== JSON.stringify(requestBody[key])
                ) {
                  isMatched = false;
                }
              });
              if (isMatched && !searchedRecord) {
                searchedRecord = record;
              }
              // console.log('TEST FOR MATCH = '+isMatched);
              // }else{
              // console.log('NO MATCH');
              // }
              break; // break only if type is ONLY_MATCHING_FIELDS
            }
          }
          case 'STRING':
          default: {
            // exact match
            // console.log('******');
            // console.log(body.value);
            // console.log('------------');
            // console.log(JSON.stringify(requestBody));
            // console.log('=============');
            // console.log(body.value === JSON.stringify(requestBody));

            let isMatched = body.value === JSON.stringify(requestBody);
            if (isMatched && !searchedRecord) {
              searchedRecord = record;
            }
            // console.log('EXACT DEFAULT '+isMatched);
          }
        }
      } else {
        let isMatched = body === JSON.stringify(requestBody);
        if (isMatched && !searchedRecord) {
          searchedRecord = record;
        }
        // console.log('EXACT');
        // exact match
      }
    } else {
      let isRequestBodyEmpty =
        !requestBody || JSON.stringify(requestBody) === '{}';
      // console.log('ELSE');
      // console.log('isRequestBodyEmpty '+isRequestBodyEmpty);
      // console.log(requestBody);
      if (isRequestBodyEmpty && !searchedRecord) {
        searchedRecord = record;
      } else if (!searchedRecordDefault) {
        searchedRecordDefault = record;
      }
    }

    // myLog(record);
  });

  if (!searchedRecord) {
    searchedRecord = searchedRecordRegex;
  }
  if (!searchedRecord) {
    searchedRecord = searchedRecordDefault;
  }

  // console.log('POST RESULT'.yellow);
  // console.log(JSON.stringify(searchedRecord, null, "  "));
  return searchedRecord;
};
