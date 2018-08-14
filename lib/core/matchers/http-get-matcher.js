import { getMatchesByQueryString } from './query-string-matcher';

export const matchRecordGet = (req, definitions) => {
  let matches = getMatchesByQueryString(req, definitions);
  matches.sort((a, b) => {
    return b.result.compare(a.result);
  });
  // console.log('+++++++++++++++++');
  // myLog(matches);
  if (matches.length === 0) return null;
  return matches[0].record;
};
