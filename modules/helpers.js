/*jslint vars: true */
/*global define, $, brackets, window, console */

define(function (require, exports, module) {
  'use strict';
  
  var DocumentManager  = brackets.getModule('document/DocumentManager'),
      UseStrictStrings = require('modules/strings');
  
  function isLanguage(document, languages) {
    var language = document.getLanguage().getId();
    return languages.indexOf(language) !== -1;
  }
  
  function isStrict(document) {
    return /^\s*?["']use strict["']/m.test(document.getText());
  }
  
  function isNodeJS(document) {
    return /\/\*js[lh]int[^\*\/]+?node:\s?true/gm.test(document.getText());
  }
  
  function getPaddedString(numSpaces) {
    var paddedString = '';
    for (var i = 0; i < numSpaces; i++) {
      paddedString += ' ';
    }
    return paddedString;
  }
  
  function log(output) {
    console.log(UseStrictStrings.CONSOLE_PREFIX + output);
  }
    
  exports.isLanguage      = isLanguage;
  exports.isNodeJS        = isNodeJS;
  exports.isStrict        = isStrict;
  exports.getPaddedString = getPaddedString;
  exports.log             = log;
});