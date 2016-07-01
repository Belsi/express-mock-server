'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MATCH_TYPE = exports.MATCH_TYPE = {
  STRICT: 'strict',
  SUBSET: 'subset', //  some QS match
  DEFAULT: 'default', //  request have QS but bundle doesnt
  NO: 'no'
};

/**
 *
 */

var MatchingResult = function () {
  function MatchingResult(type) {
    var countOfMatches = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var countOfMatchesUnspecific = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, MatchingResult);

    this.type = type;
    this.count = countOfMatches;
    this.countUnspecific = countOfMatchesUnspecific;
  }

  _createClass(MatchingResult, [{
    key: 'isDefault',
    value: function isDefault() {
      return this.type === MATCH_TYPE.DEFAULT;
    }
  }, {
    key: 'isStrict',
    value: function isStrict() {
      return this.type === MATCH_TYPE.STRICT;
    }
  }, {
    key: 'isNo',
    value: function isNo() {
      return this.type === MATCH_TYPE.NO;
    }
  }, {
    key: 'isSubset',
    value: function isSubset() {
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

  }, {
    key: 'compare',
    value: function compare(other) {
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

  }, {
    key: 'print',
    value: function print() {
      var toPrint = 'MatchingResult type: ' + this.type;
      if (this.count !== null) {
        toPrint += ', counts: ' + this.count;
      }
      if (this.countUnspecific !== null) {
        toPrint += ', countUnspecific: ' + this.countUnspecific;
      }
      console.log(colors.bgBlue.white(toPrint));
    }
  }]);

  return MatchingResult;
}();

var MATCH_NO = exports.MATCH_NO = new MatchingResult(MATCH_TYPE.NO);
var MATCH_STRICT = exports.MATCH_STRICT = new MatchingResult(MATCH_TYPE.STRICT);
var MATCH_DEFAULT = exports.MATCH_DEFAULT = new MatchingResult(MATCH_TYPE.DEFAULT);

exports.default = MatchingResult;