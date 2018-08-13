export const MATCH_TYPE = {
  STRICT: 'strict',
  SUBSET: 'subset', //  some QS match
  DEFAULT: 'default', //  request have QS but bundle doesnt
  NO: 'no'
};

/**
 *
 */
class MatchingResult {
  constructor(type, countOfMatches = null, countOfMatchesUnspecific = null) {
    this.type = type;
    this.count = countOfMatches;
    this.countUnspecific = countOfMatchesUnspecific;
  }

  isDefault() {
    return this.type === MATCH_TYPE.DEFAULT;
  }
  isStrict() {
    return this.type === MATCH_TYPE.STRICT;
  }
  isNo() {
    return this.type === MATCH_TYPE.NO;
  }
  isSubset() {
    return this.type === MATCH_TYPE.SUBSET;
  }

  /**
   *            STRICT SUBSET DEFAULT NO
   *  STRICT      0      1      1      1
   *  SUBSET      -1     c      1      1
   *  DEFAULT     -1     -1     0      1
   *  NO          -1     -1     -1     0
   *  @param {MatchingResult} other
   *  @return {number}
   */
  compare(other) {
    if (other.type === this.type) {
      if (this.isSubset()) {
        if (this.count === other.count) {
          return this.countUnspecific - other.countUnspecific;
        } else {
          return this.count - other.count;
        }
      } else {
        return 0;
      }
    } else {
      if (this.isStrict()) return 1;
      if (other.isStrict()) return -1;
      if (this.isNo()) return -1;
      if (other.isNo()) return 1;
      if (this.isSubset() && other.isDefault()) return 1;
      if (this.isDefault() && other.isSubset()) return -1;
    }
  }

  /**
   *  Just develop tool
   */
  print() {
    let toPrint = 'MatchingResult type: ' + this.type;
    if (this.count !== null) {
      toPrint += ', counts: ' + this.count;
    }
    if (this.countUnspecific !== null) {
      toPrint += ', countUnspecific: ' + this.countUnspecific;
    }
    console.log(toPrint.bgBlue.white);
  }
}

export const MATCH_NO = new MatchingResult(MATCH_TYPE.NO);
export const MATCH_STRICT = new MatchingResult(MATCH_TYPE.STRICT);
export const MATCH_DEFAULT = new MatchingResult(MATCH_TYPE.DEFAULT);

export default MatchingResult;
