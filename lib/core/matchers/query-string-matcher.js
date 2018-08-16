import MatchItem from './MatchItem';
import { REG_ALL } from '../../constants';
import MatchingResult, {
  MATCH_DEFAULT,
  MATCH_NO,
  MATCH_STRICT,
  MATCH_TYPE
} from './MatchingResult';

const TYPE_SPECIFIC_REGEX = 'SPECIFIC_REGEX';

/**
 *                  exist     dont      exist     dont
 *  req/master        0         1         0         1
 *  bundle/slave      0         0         1         1
 *  result =          strict    default   no        subset/no
 *
 *  @param {Object} masterQS          request
 *  @param {Array.<Object>} slaveQS   bundle
 */
export const getMatchingResultByQueryStrings = (masterQS, slaveQS) => {
  let isMasterExist = !!masterQS && JSON.stringify(masterQS) !== '{}';
  let isSlaveExist = !!slaveQS;
  // console.log('+++++++++++'.green);
  // console.log(masterQS);
  // console.log(slaveQS);
  // console.log('+++++++++++'.blue);
  if (!isMasterExist && !isSlaveExist) return MATCH_STRICT;
  if (!isMasterExist && isSlaveExist) return MATCH_NO;
  if (isMasterExist && !isSlaveExist) return MATCH_DEFAULT;
  let result = null;
  let countOfMatches = 0;
  let countOfMatchesUnspecific = 0;
  slaveQS.forEach(({ name, values, type }) => {
    if (!masterQS[name]) {
      result = MATCH_NO;
    } else {
      let isContained = values.indexOf(masterQS[name]) !== -1;

      let isSpecific = values.indexOf(REG_ALL) === -1;
      if (type === TYPE_SPECIFIC_REGEX) {
        isSpecific = true;
        if (!isContained) {
          values.forEach(value => {
            let regex = new RegExp(value);

            // console.log(name);
            // console.log(regex);
            // console.log(masterQS[name]);
            // console.log('regex.test(masterQS[name]) ' +regex.test(masterQS[name]));
            if (regex.test(masterQS[name])) {
              isSpecific = false;
            }
          });
        }
      }

      if (isSpecific && !isContained) {
        result = MATCH_NO;
      } else {
        if (!isSpecific) countOfMatchesUnspecific++;
        countOfMatches++;
      }
    }
  });

  if (result !== null) return result;

  let masterQSLength = Object.keys(masterQS).length;
  let slaveQSLength = slaveQS.length;

  if (slaveQSLength === countOfMatches && countOfMatches === masterQSLength)
    return MATCH_STRICT;
  return new MatchingResult(
    MATCH_TYPE.SUBSET,
    countOfMatches,
    countOfMatchesUnspecific
  );
};

export const getMatchesByQueryString = (req, definitions) => {
  let matches = [];
  definitions.forEach(record => {
    // console.log(req.query);
    // console.log(record.queryStringParameters);
    let result = getMatchingResultByQueryStrings(
      req.query,
      record.queryStringParameters
    );
    // console.log('result');
    // console.log(result);
    if (!result.isNo()) {
      matches.push(new MatchItem(record, result));
    }
  });
  return matches;
};
