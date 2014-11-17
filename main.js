'use strict';

/*global define, $, brackets, window, console */

define(function (require, exports, module) {
  //'use strict';

  var CONSOLE_PREFIX = '[use-strict-js]: ';

  var CommandManager  = brackets.getModule('command/CommandManager'),
      Commands        = brackets.getModule('command/Commands'),
      DocumentManager = brackets.getModule('document/DocumentManager');

  function processJSDocument(document) {
    var text = document.getText();
    var isStrict = /^\s*?["']use strict["']/m.test(text);
    console.log(CONSOLE_PREFIX + 'Is Strict: ' + isStrict);
    if (!isStrict) {
      document.replaceRange("'use strict';\n\n", { line: 0, ch: 0 });
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