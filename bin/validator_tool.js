'use strict';

let validator_tool = {};

validator_tool.checkInput = function(input, type, regex) {
  if (input) {
    if (type === 'string' && regex) {
      if (typeof(input) === 'string' && regex.test(input)) {
        return true;
      }
    }
    else if (type === 'number') {
      if (typeof(input) === 'number' || !(isNaN(input))) {
        return true;
      }
    }
  }
  return false;
}

module.exports = validator_tool;
