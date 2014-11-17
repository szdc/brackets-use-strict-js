/*jslint node: true */
/*global define, $, brackets, window, console */

'use strict';

define(function (require, exports, module) {
  var CONSOLE_PREFIX = '[use-strict-js]: ';

  var CommandManager  = brackets.getModule('command/CommandManager'),
      Commands        = brackets.getModule('command/Commands'),
      DocumentManager = brackets.getModule('document/DocumentManager');

  function processJSDocument(document) {
    var text = document.getText();
    
    // Is this file already strict?
    var isStrict = /^\s*?["']use strict["']/m.test(text);
    console.log(CONSOLE_PREFIX + 'Is Strict: ' + isStrict);

    if (!isStrict) {
      // NodeJS files have the statement at the top of the file
      var isNodeJS = /\/\*js[lh]int.+?node:\s?true/m.test(text);
      console.log(CONSOLE_PREFIX + 'Is Node.JS file: ' + isNodeJS);
      
      // Add the statement below any jslint/jshint/comments
      // The first line that isn't 
      var insertionLineIndex = 0;
      var lines = text.split('\n');
      lines.some(function (line, index) {
        if (line.search(/\/\*/) === -1) {
          insertionLineIndex = index;
          console.log(CONSOLE_PREFIX + 'Insert at line: ' + insertionLineIndex);
          return true;
        }
      });
      
      document.replaceRange("\n'use strict';\n", { line: insertionLineIndex, ch: 0 });
      CommandManager.execute(Commands.FILE_SAVE, { doc: document });
    }
  }

  function onDocumentSaved() {
    var document = DocumentManager.getCurrentDocument();
    if (document !== null) {
      if (document.language.getId() === 'javascript') {
        processJSDocument(document);
      }
    }
  }

  $(DocumentManager).on("documentSaved", onDocumentSaved);
});