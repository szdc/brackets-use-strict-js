/*jslint node: true */
/*global define, $, brackets, window, console */

'use strict';

define(function (require, exports, module) {

  var CommandManager     = brackets.getModule('command/CommandManager'),
      Commands           = brackets.getModule('command/Commands'),
      DocumentManager    = brackets.getModule('document/DocumentManager'),
      Menus              = brackets.getModule('command/Menus'),
      PreferencesManager = brackets.getModule('preferences/PreferencesManager');

  var CMD_ENABLE_STRICT         = 'enableStrict',
      CMD_ENABLE_STRICT_ON_SAVE = 'enableStrictOnSave',
      PREF_ENABLE_STRICT_ON_SAVE = 'enableStrictOnSave',
      CONSOLE_PREFIX = '[use-strict-js]: ';

  var preferences = PreferencesManager.getExtensionPrefs('use-strict');
  preferences.definePreference(PREF_ENABLE_STRICT_ON_SAVE, 'boolean', true);
  preferences.save();
  preferences.on('change', function() {
    var enableStrictOnSave = preferences.get(PREF_ENABLE_STRICT_ON_SAVE)
    var menuItem = CommandManager.get(CMD_ENABLE_STRICT_ON_SAVE);
    menuItem.setChecked(enableStrictOnSave);
  });

  function toggleStrict() {
    var enableStrictOnSave = !preferences.get(PREF_ENABLE_STRICT_ON_SAVE);
    preferences.set(PREF_ENABLE_STRICT_ON_SAVE, enableStrictOnSave);
    preferences.save();
  }

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

  function processDocument() {
    var document = DocumentManager.getCurrentDocument();
    if (document !== null) {
      if (document.language.getId() === 'javascript') {
        processJSDocument(document);
      }
    }
  }

  function onDocumentSaved() {
    var enableStrictOnSave = preferences.get(PREF_ENABLE_STRICT_ON_SAVE);
    if (enableStrictOnSave) {
      processDocument();
    }
  }

  $(DocumentManager).on('documentSaved', onDocumentSaved);

  CommandManager.register('Enable Strict Mode', CMD_ENABLE_STRICT, processDocument);
  CommandManager.register('Enable Strict Mode On Save', CMD_ENABLE_STRICT_ON_SAVE, toggleStrict);

  var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
  menu.addMenuDivider();
  menu.addMenuItem(CMD_ENABLE_STRICT);
  menu.addMenuItem(CMD_ENABLE_STRICT_ON_SAVE);
});