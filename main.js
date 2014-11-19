/*jslint vars: true */
/*global define, $, brackets, window, console */

define(function (require, exports, module) {
  
  var CommandManager       = brackets.getModule('command/CommandManager'),
      Commands             = brackets.getModule('command/Commands'),
      Menus                = brackets.getModule('command/Menus'),
      DocumentManager      = brackets.getModule('document/DocumentManager'),
      PreferencesManager   = brackets.getModule('preferences/PreferencesManager'),
      ExtensionUtils       = brackets.getModule( 'utils/ExtensionUtils' ),
      UseStrictStrings     = require('modules/strings'),
      UseStrictCommands    = require('modules/commands'),
      UseStrictPreferences = require('modules/preferences');

  var preferences = PreferencesManager.getExtensionPrefs('use-strict-js');
  
  setup();
  
  function setup() {
    $(DocumentManager).on('documentSaved', onDocumentSaved);
    
    CommandManager.register(
      UseStrictStrings.CMD_ENABLE_STRICT, 
      UseStrictCommands.ENABLE_STRICT, 
      processDocument
    );
    
    CommandManager.register(
      UseStrictStrings.CMD_ENABLE_STRICT_ON_SAVE, 
      UseStrictCommands.ENABLE_STRICT_ON_SAVE, 
      toggleStrict
    );
    
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(UseStrictCommands.ENABLE_STRICT, 'Ctrl-Shift-J');
    menu.addMenuItem(UseStrictCommands.ENABLE_STRICT_ON_SAVE);
    
    setupPreferences();
  }
  
  function setupPreferences() {
    var preference = UseStrictPreferences.ENABLE_STRICT_ON_SAVE;
    preferences.definePreference(preference.id, preference.type, preference.initial);
    preferences.save();
    
    preferences.on('change', function() {
      var enableStrictOnSave = preferences.get(preference.id);
      var menuItem = CommandManager.get(UseStrictCommands.ENABLE_STRICT_ON_SAVE);
      menuItem.setChecked(enableStrictOnSave);
    });
  }
 
  function toggleStrict() {
    var enableStrictOnSave = !preferences.get(UseStrictPreferences.ENABLE_STRICT_ON_SAVE.id);
    preferences.set(UseStrictPreferences.ENABLE_STRICT_ON_SAVE.id, enableStrictOnSave);
    preferences.save();
  }
  
  function onDocumentSaved() {
    var document = DocumentManager.getCurrentDocument();
    var enableStrictOnSave = preferences.get(UseStrictPreferences.ENABLE_STRICT_ON_SAVE.id);
    
    if (enableStrictOnSave && documentIsJSOrUntitled(document)) {
      processDocument(document);
    }
  }

  function documentIsJSOrUntitled(document) {
    if (document !== null) {
      var language = document.language.getId();
      return (language === 'javascript' || language === 'unknown');
    }
  }
  
  function processDocument(document) {
    document = document || DocumentManager.getCurrentDocument();
    
    var text = document.getText();
    
    // Is this file already strict?
    var isStrict = /^\s*?["']use strict["']/m.test(text);
    console.log(UseStrictStrings.CONSOLE_PREFIX + 'Is Strict: ' + isStrict);

    if (!isStrict) {
      // NodeJS files have the statement at the top of the file
      var isNodeJS = /\/\*js[lh]int.+?node:\s?true/m.test(text);
      console.log(UseStrictStrings.CONSOLE_PREFIX + 'Is Node.JS file: ' + isNodeJS);
      
      // Add the statement below any jslint/jshint/comments
      // The first line that isn't 
      var insertionLineIndex = 0;
      var lines = text.split('\n');
      lines.some(function (line, index) {
        if (line.search(/\/\*/) === -1) {
          insertionLineIndex = index;
          console.log(UseStrictStrings.CONSOLE_PREFIX + 'Insert at line: ' + insertionLineIndex);
          return true;
        }
      });
      
      document.replaceRange("\n'use strict';\n", { line: insertionLineIndex, ch: 0 });
      if (!document.isUntitled()) {
        CommandManager.execute(Commands.FILE_SAVE, { doc: document });
      }
    }
  }
});