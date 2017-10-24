var that = this;
function run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
  Handler for 'Rename Text Styles' command.
*/



Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports['default'] = onRun;

var _utils = __webpack_require__(1);

var _sketchNibui = __webpack_require__(2);

var _MochaJSDelegate = __webpack_require__(3);

var _MochaJSDelegate2 = _interopRequireDefault(_MochaJSDelegate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PREVIEW_COLUMN_COUNT = 2;
var PREVIEW_CELL_SPACING = NSMakeSize(16, 2);
var PREVIEW_VISIBLE_ROWS = 27;

var SharedStyleRenamer = function () {
  function SharedStyleRenamer(context) {
    _classCallCheck(this, SharedStyleRenamer);

    this.context = context;
    this.sketch = context.api();
    this.document = context.document;
    this.styles = this.document.documentData().layerTextStyles();
    this.styleInfo = [];
    this.renamedStyles = [];
    this.renameCount = 0;
    this.find = '';
    this.replace = '';
    this.showOnlyMatchingStyles = false;
    this.cellFontRegular = NSFont.systemFontOfSize(NSFont.systemFontSize());
    this.cellFontBold = NSFont.boldSystemFontOfSize(NSFont.systemFontSize());
    this.outlets = {};
  }

  _createClass(SharedStyleRenamer, [{
    key: 'makeAlert',
    value: function () {
      function makeAlert() {
        var alert = NSAlert['new']();
        alert.setMessageText('Rename Text Styles');

        var icon = NSImage.alloc().initByReferencingFile(this.sketch.resourceNamed('icons/rename-styles@2x.png').path());
        alert.setIcon(icon);

        return alert;
      }

      return makeAlert;
    }()
  }, {
    key: 'loadNib',
    value: function () {
      function loadNib() {
        var _this = this;

        this.nib = new _sketchNibui.NibUI(this.context, 'UIBundle', 'RenameTextStyles', this);

        var delegate = new _MochaJSDelegate2['default']({
          'windowWillClose:': function () {
            function windowWillClose() {
              NSApp.stopModal();
            }

            return windowWillClose;
          }(),

          'controlTextDidChange:': function () {
            function controlTextDidChange(notification) {
              if (notification.object() === _this.outlets.findField) {
                _this.searchForMatchingStyles();
              } else if (notification.object() === _this.outlets.replaceField) {
                _this.updateReplacedNames();
              }
            }

            return controlTextDidChange;
          }()
        });

        var delegateInstance = delegate.getClassInstance();
        this.nib.window.setDelegate(delegateInstance);
        this.outlets.findField.setDelegate(delegateInstance);
        this.outlets.replaceField.setDelegate(delegateInstance);

        this.showOnlyMatchingStyles = this.outlets.showOnlyMatchingStylesCheckbox.intValue() === 1;
      }

      return loadNib;
    }()
  }, {
    key: 'toggleShowOnlyMatchingStyles',
    value: function () {
      function toggleShowOnlyMatchingStyles(sender) {
        this.showOnlyMatchingStyles = sender.intValue() === 1;

        if (!this.showOnlyMatchingStyles) {
          this.resetRenamedStyles();
        }

        this.searchForMatchingStyles();
      }

      return toggleShowOnlyMatchingStyles;
    }()
  }, {
    key: 'toggleFindOption',
    value: function () {
      function toggleFindOption() {
        this.searchForMatchingStyles();
      }

      return toggleFindOption;
    }()
  }, {
    key: 'toggleAutoscroll',
    value: function () {
      function toggleAutoscroll() {
        this.scrollToFirstRenamedStyle();
      }

      return toggleAutoscroll;
    }()
  }, {
    key: 'handleRename',
    value: function () {
      function handleRename() {
        this.renameStyles();
        NSApp.stopModal();
      }

      return handleRename;
    }()
  }, {
    key: 'handleApply',
    value: function () {
      function handleApply() {
        this.applyRename();
      }

      return handleApply;
    }()
  }, {
    key: 'handleCancel',
    value: function () {
      function handleCancel() {
        NSApp.stopModal();
      }

      return handleCancel;
    }()
  }, {
    key: 'applyRename',
    value: function () {
      function applyRename() {
        this.renameStyles();
        this.initStyleInfo();
        this.outlets.findField.setStringValue('');
        this.outlets.replaceField.setStringValue('');
        this.nib.window.makeFirstResponder(this.outlets.findField);
        this.searchForMatchingStyles();
      }

      return applyRename;
    }()
  }, {
    key: 'scrollToFirstRenamedStyle',
    value: function () {
      function scrollToFirstRenamedStyle() {
        if (this.outlets.autoscrollCheckbox.intValue() === 0) {
          return;
        }

        var insets = this.outlets.scrollView.contentInsets();
        var point = NSMakePoint(0, 0);

        if (this.renamedStyles.length > 0) {
          for (var i = 0; i < this.renamedStyles.length; i++) {
            var info = this.renamedStyles[i];

            if (info.newName.length > 0) {
              point = this.matrix.cellFrameAtRow_column(i, 0).origin;
              break;
            }
          }
        } else {
          point = this.matrix.cellFrameAtRow_column(0, 0).origin;
        }

        point.y -= insets.top - 1; // Not sure why - 1 is necessary, but it is
        this.matrix.scrollPoint(point);
        this.outlets.scrollView.reflectScrolledClipView(this.outlets.scrollView.contentView());
      }

      return scrollToFirstRenamedStyle;
    }()
  }, {
    key: 'searchForMatchingStyles',
    value: function () {
      function searchForMatchingStyles() {
        // We always want to replace all occurrences of the find string within
        // a style name, so we have to transform a plain search into a RegExp with
        // the 'g' flag, because a plain text replace only replaces the first occurrence.
        var flags = this.outlets.ignoreCaseCheckbox.intValue() === 1 ? 'gi' : 'g';
        var regex = this.outlets.regexCheckbox.intValue() === 1;
        var find = String(this.outlets.findField.stringValue());

        // RegExp constructor can fail, be sure to catch exceptions!
        try {
          if (regex) {
            this.find = new RegExp(find, flags);
          } else {
            this.find = new RegExp((0, _utils.regExpEscape)(find), flags);
          }

          this.outlets.findField.setTextColor(NSColor.textColor());
        } catch (ex) {
          this.outlets.findField.setTextColor(NSColor.redColor());
          find = '';
          this.find = new RegExp('', flags);
        }

        this.updateStylesToRename(find.length === 0);
        this.setMatrixData();
        this.scrollToFirstRenamedStyle();
      }

      return searchForMatchingStyles;
    }()
  }, {
    key: 'updateReplacedNames',
    value: function () {
      function updateReplacedNames() {
        this.replace = String(this.outlets.replaceField.stringValue());
        this.updateRenamedStyles();
        this.setMatrixData();
      }

      return updateReplacedNames;
    }()
  }, {
    key: 'initStyleInfo',
    value: function () {
      function initStyleInfo() {
        var styles = this.styles.objects();
        this.styleInfo = new Array(styles.length);

        for (var i = 0; i < styles.length; i++) {
          var style = styles[i];

          this.styleInfo[i] = {
            style: style,
            name: style.name()
          };
        }

        this.styleInfo.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        });

        this.renameCount = 0;
        this.resetRenamedStyles();
      }

      return initStyleInfo;
    }()
  }, {
    key: 'resetRenamedStyles',
    value: function () {
      function resetRenamedStyles() {
        this.renamedStyles = new Array(this.styleInfo.length);

        for (var i = 0; i < this.styleInfo.length; i++) {
          var info = this.styleInfo[i];
          this.renamedStyles[i] = {
            style: info.style,
            oldName: info.name,
            newName: ''
          };
        }
      }

      return resetRenamedStyles;
    }()
  }, {
    key: 'updateStylesToRename',
    value: function () {
      function updateStylesToRename(empty) {
        var renamedStyles = [];
        this.renameCount = 0;

        for (var i = 0; i < this.styleInfo.length; i++) {
          var info = this.styleInfo[i];
          var found = !empty && this.find.test(info.name);
          var newName = void 0;

          if (found) {
            newName = info.name.replace(this.find, this.replace);

            if (newName.length === 0) {
              newName = '<empty>';
            } else {
              this.renameCount++;
            }

            if (this.showOnlyMatchingStyles) {
              renamedStyles.push({
                style: info.style,
                oldName: info.name,
                newName: newName
              });
            } else {
              this.renamedStyles[i].newName = newName;
            }
          } else if (!this.showOnlyMatchingStyles) {
            this.renamedStyles[i].newName = '';
          }
        }

        if (this.showOnlyMatchingStyles) {
          this.renamedStyles = renamedStyles;
        }

        this.updateCountLabel();
      }

      return updateStylesToRename;
    }()
  }, {
    key: 'updateRenamedStyles',
    value: function () {
      function updateRenamedStyles() {
        this.renameCount = 0;

        for (var i = 0; i < this.renamedStyles.length; i++) {
          var info = this.renamedStyles[i];

          if (info.newName) {
            info.newName = info.oldName.replace(this.find, this.replace);

            if (info.newName.length === 0) {
              info.newName = '<empty>';
            } else {
              this.renameCount++;
            }
          }
        }

        this.updateCountLabel();
      }

      return updateRenamedStyles;
    }()
  }, {
    key: 'renameStyles',
    value: function () {
      function renameStyles() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.renamedStyles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var info = _step.value;

            if (info.newName.length > 0) {
              var copy = info.style.copy();
              copy.setName(info.newName);
              info.style.syncPropertiesFromObject(copy);
              this.styles.updateValueOfSharedObject_byCopyingInstance(info.style, copy.style());
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.document.reloadInspector();
      }

      return renameStyles;
    }()
  }, {
    key: 'alignLabelWithColumn',
    value: function () {
      function alignLabelWithColumn(label, column) {
        var insets = this.outlets.scrollView.contentInsets();
        var scrollViewOrigin = this.outlets.scrollView.frame().origin;
        var cellOrigin = this.matrix.cellFrameAtRow_column(0, column).origin;
        var labelOrigin = label.frame().origin;
        labelOrigin.x = scrollViewOrigin.x + insets.left + cellOrigin.x;
        label.setFrameOrigin(labelOrigin);
      }

      return alignLabelWithColumn;
    }()
  }, {
    key: 'setMatrixData',
    value: function () {
      function setMatrixData() {
        var maxWidth = 0;
        this.matrix.renewRows_columns(this.renamedStyles.length, PREVIEW_COLUMN_COUNT);
        this.matrix.sizeToCells();
        var cells = this.matrix.cells();

        for (var row = 0; row < this.renamedStyles.length; row++) {
          var info = this.renamedStyles[row];

          // After setting the cell's value, get its width so we can calculate
          // the maximum width we'll need for cells.
          var index = row * PREVIEW_COLUMN_COUNT;
          var cell = cells[index];
          cell.setFont(info.newName.length === 0 ? this.cellFontRegular : this.cellFontBold);
          cell.setStringValue(info.oldName);
          var size = cell.cellSize();
          maxWidth = Math.max(maxWidth, size.width);

          cell = cells[index + 1];
          cell.setFont(this.cellFontRegular);
          cell.setStringValue(info.newName);
          size = cell.cellSize();
          maxWidth = Math.max(maxWidth, size.width);
        }

        return NSMakeSize(maxWidth, cells[0].cellSize().height);
      }

      return setMatrixData;
    }()
  }, {
    key: 'initMatrix',
    value: function () {
      function initMatrix() {
        var BORDER_STYLE = NSBezelBorder;

        var scrollViewSize = this.outlets.scrollView.frame().size;
        var contentSize = NSScrollView.contentSizeForFrameSize_horizontalScrollerClass_verticalScrollerClass_borderType_controlSize_scrollerStyle(scrollViewSize, null, NSScroller, BORDER_STYLE, NSRegularControlSize, NSScrollerStyleOverlay);

        var insets = this.outlets.scrollView.contentInsets();
        contentSize.width -= insets.left + insets.right;
        contentSize.height -= insets.top + insets.bottom;

        // Start with a default size, we'll fix that later
        var cellSize = NSMakeSize(100, 16);
        var cellPrototype = NSCell.alloc().initTextCell('');
        this.matrix = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(NSMakeRect(0, 0, cellSize.width * PREVIEW_COLUMN_COUNT, cellSize.height * this.renamedStyles.length), NSListModeMatrix, cellPrototype, this.renamedStyles.length, PREVIEW_COLUMN_COUNT);

        cellSize = this.setMatrixData();

        // Add 25% to the cell width to allow for longer names when renaming
        cellSize.width *= 1.25;
        this.matrix.setCellSize(CGSizeMake(cellSize.width, cellSize.height));
        this.matrix.setIntercellSpacing(PREVIEW_CELL_SPACING);
        this.matrix.sizeToCells();

        this.outlets.scrollView.setDocumentView(this.matrix);

        this.alignLabelWithColumn(this.outlets.beforeLabel, 0);
        this.alignLabelWithColumn(this.outlets.afterLabel, 1);

        // Resize the window to fit the matrix
        var matrixHeight = cellSize.height * PREVIEW_VISIBLE_ROWS;
        matrixHeight += PREVIEW_CELL_SPACING.height * (PREVIEW_VISIBLE_ROWS - 1);
        var matrixSize = NSMakeSize(this.matrix.frame().size.width, matrixHeight);

        // Now adjust the containing view width and column labels to fit the matrix
        var frameSize = NSScrollView.frameSizeForContentSize_horizontalScrollerClass_verticalScrollerClass_borderType_controlSize_scrollerStyle(matrixSize, null, NSScroller, BORDER_STYLE, NSRegularControlSize, NSScrollerStyleOverlay);

        // Take content insets into account
        frameSize.width += insets.left + insets.right;
        frameSize.height += insets.top + insets.bottom;

        // Calculate the difference in the old size vs. new size, apply that to the view frame
        var sizeDiff = NSMakeSize(frameSize.width - scrollViewSize.width, frameSize.height - scrollViewSize.height);
        var windowFrame = this.nib.window.frame();
        windowFrame.size.width += sizeDiff.width;
        windowFrame.size.height += sizeDiff.height;
        this.nib.window.setFrame_display(windowFrame, true);
      }

      return initMatrix;
    }()
  }, {
    key: 'updateCountLabel',
    value: function () {
      function updateCountLabel() {
        var styleCount = this.styles.numberOfSharedStyles();
        var label = NSString.stringWithFormat('%@ of %@ styles will be renamed', this.renameCount, styleCount);

        this.outlets.countLabel.setStringValue(label);
        this.setReplaceEnabled(this.renameCount > 0);

        if (this.renameCount > 0) {
          // We need to do this trick to make the Rename button the default
          this.outlets.renameButton.setKeyEquivalent('');
          this.outlets.renameButton.setKeyEquivalent('\r');
        }
      }

      return updateCountLabel;
    }()
  }, {
    key: 'setReplaceEnabled',
    value: function () {
      function setReplaceEnabled(enabled) {
        this.outlets.renameButton.setEnabled(enabled);
        this.outlets.applyButton.setEnabled(enabled);
      }

      return setReplaceEnabled;
    }()
  }, {
    key: 'showFindDialog',
    value: function () {
      function showFindDialog() {
        // Get all of the style names to start with
        this.initStyleInfo();

        if (this.renamedStyles.length === 0) {
          var alert = this.makeAlert();
          alert.setInformativeText('This document has no shared text styles.');
          alert.runModal();
          return 0;
        }

        this.loadNib();
        this.initMatrix();
        this.updateCountLabel();

        return NSApp.runModalForWindow(this.nib.window);
      }

      return showFindDialog;
    }()
  }, {
    key: 'run',
    value: function () {
      function run() {
        var response = this.showFindDialog();

        if (response !== 0) {
          this.nib.unload();
          this.nib.window.orderOut(null);
        }
      }

      return run;
    }()
  }]);

  return SharedStyleRenamer;
}();

function onRun(context) {
  var renamer = new SharedStyleRenamer(context);
  renamer.run();
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.regExpEscape = regExpEscape;
/* eslint no-control-regex: 0 */

/**
  Utility functions
*/

function regExpEscape(s) {
  return String(s).replace(/([-()[\]{}+?*.$^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * Copyright 2015 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NibUI = exports.NibUI = function () {
  function NibUI(context, resourceBundleName, nibName, owner, outletsName) {
    var _this = this;

    _classCallCheck(this, NibUI);

    var bundlePath = context.plugin.urlForResourceNamed(resourceBundleName).path();
    this._bundle = NSBundle.bundleWithPath(bundlePath);
    this.outlets = {};

    // Create a class name that doesn't exist yet. Note that we can't reuse the same
    // definition lest Sketch will throw an MOJavaScriptException when binding the UI,
    // probably due to JavaScript context / plugin lifecycle incompatibility.

    function randomId() {
      return (100000 * Math.random()).toFixed(0);
    }

    var className = void 0;

    do {
      className = 'NibOwner' + randomId();
    } while (NSClassFromString(className) != null);

    var superclass = NSClassFromString('NSObject');
    this._cls = MOClassDescription.allocateDescriptionForClassWithName_superclass_(className, superclass);

    // Get the list of outlets and actions as defined in the nib.

    var connections = this._loadConnections(nibName);
    var outlets = void 0;

    // If an owner was passed and it has an 'outlets' dict, register the views with that.

    if (owner) {
      var name = outletsName || 'outlets';
      outlets = owner[name];

      if (typeof outlets === 'undefined') {
        owner[name] = {};
        outlets = owner[name];
      }
    } else {
      outlets = this.outlets;
    }

    // Create setter methods that will be called when connecting each outlet during nib loading.
    // The setter methods register the connected view.

    var _loop = function _loop(i) {
      var outlet = connections.outlets[i];
      var selector = 'set' + String(outlet.charAt(0).toUpperCase()) + String(outlet.substring(1)) + ':';

      _this._cls.addInstanceMethodWithSelector_function(NSSelectorFromString(selector), function (view) {
        outlets[outlet] = view;
      });
    };

    for (var i = 0; i < connections.outlets.length; i++) {
      _loop(i);
    }

    // Hook up actions with the owner.

    if (owner) {
      var _loop2 = function _loop2(i) {
        var action = connections.actions[i];
        var func = owner[action.slice(0, -1)]; // Trim ':' from end of action

        if (typeof func === 'function') {
          _this._cls.addInstanceMethodWithSelector_function(NSSelectorFromString(action), function (notification) {
            // javascriptCore tends to die a horrible death if an uncaught exception occurs in an action method
            try {
              func.call(owner, notification);
            } catch (ex) {
              log(NSString.stringWithFormat('%@: %@\nStack:\n%@', ex.name, ex.message, ex.stack));
            }
          });
        }
      };

      for (var i = 0; i < connections.actions.length; i++) {
        _loop2(i);
      }
    }

    this._cls.registerClass();
    this._nibOwner = NSClassFromString(className).alloc().init();

    var tloPointer = MOPointer.alloc().initWithValue(null);

    // Load the nib and look for the hard-wired names 'mainView' and 'window' in the top level objects

    if (this._bundle.loadNibNamed_owner_topLevelObjects(nibName, this._nibOwner, tloPointer)) {
      var topLevelObjects = tloPointer.value();

      for (var i = 0; i < topLevelObjects.count(); i++) {
        var obj = topLevelObjects[i];

        if (obj.className().isEqual('MainView')) {
          this.view = obj;
          break;
        } else if (obj.isKindOfClass(NSWindow)) {
          this.window = obj;
          break;
        }
      }
    } else {
      throw new Error('Could not load nib');
    }
  }

  _createClass(NibUI, [{
    key: '_loadConnections',
    value: function () {
      function _loadConnections(nibName) {
        var path = this._bundle.pathForResource_ofType(nibName, 'plist');
        var connections = {
          outlets: [],
          actions: []
        };

        if (path) {
          var plist = NSDictionary.dictionaryWithContentsOfFile(path);

          if (plist) {
            var connectionDict = plist['com.apple.ibtool.document.connections'];
            var keys = Object.keys(connectionDict);

            for (var i = 0; i < keys.length; i++) {
              var connection = connectionDict[keys[i]];

              if (connection.type.isEqual('IBCocoaOutletConnection')) {
                if (!/initialFirstResponder|nextKeyView/.test(connection.label)) {
                  connections.outlets.push(connection.label);
                }
              } else if (connection.type.isEqual('IBCocoaActionConnection')) {
                connections.actions.push(connection.label);
              }
            }
          }
        }

        return connections;
      }

      return _loadConnections;
    }()

    /**
     * Release all resources. Should be called the nib is no longer being used.
     */

  }, {
    key: 'unload',
    value: function () {
      function unload() {
        this._bundle.unload();
      }

      return unload;
    }()
  }]);

  return NibUI;
}();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MochaJSDelegate = function () {
  function MochaJSDelegate(selectorHandlerDict, superclass) {
    _classCallCheck(this, MochaJSDelegate);

    this.uniqueClassName = 'MochaJSDelegate_DynamicClass_' + NSUUID.UUID().UUIDString();
    this.delegateClassDesc = MOClassDescription.allocateDescriptionForClassWithName_superclass_(this.uniqueClassName, superclass || NSObject);
    this.delegateClassDesc.registerClass();
    this.handlers = {};

    if ((typeof selectorHandlerDict === 'undefined' ? 'undefined' : _typeof(selectorHandlerDict)) === 'object') {
      var selectors = Object.keys(selectorHandlerDict);

      for (var i = 0; i < selectors.length; i++) {
        var selectorString = selectors[i];
        this.setHandlerForSelector(selectorString, selectorHandlerDict[selectorString]);
      }
    }
  }

  _createClass(MochaJSDelegate, [{
    key: 'setHandlerForSelector',
    value: function () {
      function setHandlerForSelector(selectorString, func) {
        var handlerHasBeenSet = selectorString in this.handlers;
        this.handlers[selectorString] = func;

        /*
          For some reason, Mocha acts weird about arguments: https://github.com/logancollins/Mocha/issues/28
          We have to basically create a dynamic handler with a likewise dynamic number of predefined arguments.
        */
        if (!handlerHasBeenSet) {
          var args = [];
          var regex = /:/g;

          while (regex.exec(selectorString)) {
            args.push('arg' + args.length);
          }

          // JavascriptCore tends to die a horrible death if an uncaught exception occurs in an action method
          var body = '{\n        try {\n          return func.apply(this, arguments)\n        }\n        catch(ex) {\n          log(ex)\n        }\n      }';
          var code = NSString.stringWithFormat('(function (%@) %@)', args.join(', '), body);
          var dynamicFunction = eval(String(code));
          var selector = NSSelectorFromString(selectorString);
          this.delegateClassDesc.addInstanceMethodWithSelector_function_(selector, dynamicFunction);
        }
      }

      return setHandlerForSelector;
    }()
  }, {
    key: 'removeHandlerForSelector',
    value: function () {
      function removeHandlerForSelector(selectorString) {
        delete this.handlers[selectorString];
      }

      return removeHandlerForSelector;
    }()
  }, {
    key: 'getHandlerForSelector',
    value: function () {
      function getHandlerForSelector(selectorString) {
        return this.handlers[selectorString];
      }

      return getHandlerForSelector;
    }()
  }, {
    key: 'getAllHandlers',
    value: function () {
      function getAllHandlers() {
        return this.handlers;
      }

      return getAllHandlers;
    }()
  }, {
    key: 'getClass',
    value: function () {
      function getClass() {
        return NSClassFromString(this.uniqueClassName);
      }

      return getClass;
    }()
  }, {
    key: 'getClassInstance',
    value: function () {
      function getClassInstance() {
        return this.getClass()['new']();
      }

      return getClassInstance;
    }()
  }]);

  return MochaJSDelegate;
}();

exports['default'] = MochaJSDelegate;

/***/ })
/******/ ]);
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRun'] = run.bind(this, 'default')
