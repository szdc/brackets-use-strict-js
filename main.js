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
      UseStrictPreferences = require('modules/preferences'),
      Helpers              = require('modules/helpers');

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
    
    if (enableStrictOnSave && Helpers.isLanguage(document, ['javascript', 'unknown'])) {
      processDocument(document);
    }
  }
  
  function processDocument(document) {
    document = document || DocumentManager.getCurrentDocument();
    
    var isStrict = Helpers.isStrict(document);
    Helpers.log('Is Strict: ' + isStrict);
    if (isStrict) {
      return;
    }
    
    var isNodeJS = Helpers.isNodeJS(document);
    Helpers.log('Is Node.JS file: ' + isNodeJS);
    
    var insertionLineIndex = 0,
        useStrictStatement = "'use strict';\n",
        iterator = isNodeJS ? nodeJSIterator : defaultIterator,
        lines = document.getText().split('\n');
    
    lines.some(iterator);
    
    Helpers.log('Inserting at line index: ' + insertionLineIndex);
    document.replaceRange(useStrictStatement, { line: insertionLineIndex, ch: 0 });
    if (!document.isUntitled()) {
      CommandManager.execute(Commands.FILE_SAVE, { doc: document });
    }
    
    function nodeJSIterator(line, index) {
      if (line.search(/\/\*/) === -1) {
        insertionLineIndex = index;
        return true;
      }
    }
    
    function defaultIterator(line, index) {
      if (line.search(/{$/) !== -1) {
        var spaceUnits = PreferencesManager.get('spaceUnits');
        useStrictStatement = Helpers.getPaddedString(spaceUnits) + useStrictStatement;
        insertionLineIndex = index + 1;
        return true;
      }
    }
  }
});