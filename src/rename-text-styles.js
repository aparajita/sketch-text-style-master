/*
  Handler for 'Rename Text Styles' command.
*/

'use strict'

import { regExpEscape } from './lib/utils'
import { NibUI } from './lib/sketch-nibui'
import MochaJSDelegate from './lib/MochaJSDelegate'


const PREVIEW_COLUMN_COUNT = 2
const PREVIEW_CELL_SPACING = NSMakeSize(16, 2)
const PREVIEW_VISIBLE_ROWS = 27


class SharedStyleRenamer {
  constructor(context) {
    this.context = context
    this.sketch = context.api()
    this.document = context.document
    this.styles = this.document.documentData().layerTextStyles()
    this.styleInfo = []
    this.renamedStyles = []
    this.renameCount = 0
    this.find = ''
    this.replace = ''
    this.showOnlyMatchingStyles = false
    this.cellFontRegular = NSFont.systemFontOfSize(NSFont.systemFontSize())
    this.cellFontBold = NSFont.boldSystemFontOfSize(NSFont.systemFontSize())
    this.outlets = {}
  }

  makeAlert() {
    const alert = NSAlert.new()
    alert.setMessageText('Rename Text Styles')

    const icon = NSImage.alloc().initByReferencingFile(this.sketch.resourceNamed('icons/rename-styles@2x.png').path())
    alert.setIcon(icon)

    return alert
  }

  loadNib() {
    this.nib = new NibUI(this.context, 'UIBundle', 'RenameTextStyles', this)

    const delegate = new MochaJSDelegate({
      'windowWillClose:': () => {
        NSApp.stopModal()
      },

      'controlTextDidChange:': notification => {
        if (notification.object() === this.outlets.findField) {
          this.searchForMatchingStyles()
        }
        else if (notification.object() === this.outlets.replaceField) {
          this.updateReplacedNames()
        }
      }
    })

    const delegateInstance = delegate.getClassInstance()
    this.nib.window.setDelegate(delegateInstance)
    this.outlets.findField.setDelegate(delegateInstance)
    this.outlets.replaceField.setDelegate(delegateInstance)

    this.showOnlyMatchingStyles = this.outlets.showOnlyMatchingStylesCheckbox.intValue() === 1
  }

  toggleShowOnlyMatchingStyles(sender) {
    this.showOnlyMatchingStyles = sender.intValue() === 1

    if (!this.showOnlyMatchingStyles) {
      this.resetRenamedStyles()
    }

    this.searchForMatchingStyles()
  }

  toggleFindOption() {
    this.searchForMatchingStyles()
  }

  toggleAutoscroll() {
    this.scrollToFirstRenamedStyle()
  }

  handleRename() {
    this.renameStyles()
    NSApp.stopModal()
  }

  handleApply() {
    this.applyRename()
  }

  handleCancel() {
    NSApp.stopModal()
  }

  applyRename() {
    this.renameStyles()
    this.initStyleInfo()
    this.outlets.findField.setStringValue('')
    this.outlets.replaceField.setStringValue('')
    this.nib.window.makeFirstResponder(this.outlets.findField)
    this.searchForMatchingStyles()
  }

  scrollToFirstRenamedStyle() {
    if (this.outlets.autoscrollCheckbox.intValue() === 0) {
      return
    }

    const insets = this.outlets.scrollView.contentInsets()
    let point = NSMakePoint(0, 0)

    if (this.renamedStyles.length > 0) {
      for (let i = 0; i < this.renamedStyles.length; i++) {
        const info = this.renamedStyles[i]

        if (info.newName.length > 0) {
          point = this.matrix.cellFrameAtRow_column(i, 0).origin
          break
        }
      }
    }
    else {
      point = this.matrix.cellFrameAtRow_column(0, 0).origin
    }

    point.y -= insets.top - 1 // Not sure why - 1 is necessary, but it is
    this.matrix.scrollPoint(point)
    this.outlets.scrollView.reflectScrolledClipView(this.outlets.scrollView.contentView())
  }

  searchForMatchingStyles() {
    // We always want to replace all occurrences of the find string within
    // a style name, so we have to transform a plain search into a RegExp with
    // the 'g' flag, because a plain text replace only replaces the first occurrence.
    const flags = this.outlets.ignoreCaseCheckbox.intValue() === 1 ? 'gi' : 'g'
    const regex = this.outlets.regexCheckbox.intValue() === 1
    let find = String(this.outlets.findField.stringValue())

    // RegExp constructor can fail, be sure to catch exceptions!
    try {
      if (regex) {
        this.find = new RegExp(find, flags)
      }
      else {
        this.find = new RegExp(regExpEscape(find), flags)
      }

      this.outlets.findField.setTextColor(NSColor.textColor())
    }
    catch (ex) {
      this.outlets.findField.setTextColor(NSColor.redColor())
      find = ''
      this.find = new RegExp('', flags)
    }

    this.updateStylesToRename(find.length === 0)
    this.setMatrixData()
    this.scrollToFirstRenamedStyle()
  }

  updateReplacedNames() {
    this.replace = String(this.outlets.replaceField.stringValue())
    this.updateRenamedStyles()
    this.setMatrixData()
  }

  initStyleInfo() {
    const styles = this.styles.objects()
    this.styleInfo = new Array(styles.length)

    for (let i = 0; i < styles.length; i++) {
      const style = styles[i]

      this.styleInfo[i] = {
        style,
        name: style.name()
      }
    }

    this.styleInfo.sort((a, b) => {
      if (a.name < b.name) {
        return -1
      }

      if (a.name > b.name) {
        return 1
      }

      return 0
    })

    this.renameCount = 0
    this.resetRenamedStyles()
  }

  resetRenamedStyles() {
    this.renamedStyles = new Array(this.styleInfo.length)

    for (let i = 0; i < this.styleInfo.length; i++) {
      const info = this.styleInfo[i]
      this.renamedStyles[i] = {
        style: info.style,
        oldName: info.name,
        newName: ''
      }
    }
  }

  updateStylesToRename(empty) {
    const renamedStyles = []
    this.renameCount = 0

    for (let i = 0; i < this.styleInfo.length; i++) {
      const info = this.styleInfo[i]
      const found = !empty && this.find.test(info.name)
      let newName

      if (found) {
        newName = info.name.replace(this.find, this.replace)

        if (newName.length === 0) {
          newName = '<empty>'
        }
        else {
          this.renameCount++
        }

        if (this.showOnlyMatchingStyles) {
          renamedStyles.push({
            style: info.style,
            oldName: info.name,
            newName
          })
        }
        else {
          this.renamedStyles[i].newName = newName
        }
      }
      else if (!this.showOnlyMatchingStyles) {
        this.renamedStyles[i].newName = ''
      }
    }

    if (this.showOnlyMatchingStyles) {
      this.renamedStyles = renamedStyles
    }

    this.updateCountLabel()
  }

  updateRenamedStyles() {
    this.renameCount = 0

    for (let i = 0; i < this.renamedStyles.length; i++) {
      const info = this.renamedStyles[i]

      if (info.newName) {
        info.newName = info.oldName.replace(this.find, this.replace)

        if (info.newName.length === 0) {
          info.newName = '<empty>'
        }
        else {
          this.renameCount++
        }
      }
    }

    this.updateCountLabel()
  }

  renameStyles() {
    for (let info of this.renamedStyles) {
      if (info.newName.length > 0) {
        const copy = info.style.copy()
        copy.setName(info.newName)
        info.style.syncPropertiesFromObject(copy)
        this.styles.updateValueOfSharedObject_byCopyingInstance(info.style, copy.style())
      }
    }

    this.document.reloadInspector()
  }

  alignLabelWithColumn(label, column) {
    const insets = this.outlets.scrollView.contentInsets()
    const scrollViewOrigin = this.outlets.scrollView.frame().origin
    let cellOrigin = this.matrix.cellFrameAtRow_column(0, column).origin
    const labelOrigin = label.frame().origin
    labelOrigin.x = scrollViewOrigin.x + insets.left + cellOrigin.x
    label.setFrameOrigin(labelOrigin)
  }

  setMatrixData() {
    let maxWidth = 0
    this.matrix.renewRows_columns(this.renamedStyles.length, PREVIEW_COLUMN_COUNT)
    this.matrix.sizeToCells()
    const cells = this.matrix.cells()

    for (let row = 0; row < this.renamedStyles.length; row++) {
      const info = this.renamedStyles[row]

      // After setting the cell's value, get its width so we can calculate
      // the maximum width we'll need for cells.
      const index = row * PREVIEW_COLUMN_COUNT
      let cell = cells[index]
      cell.setFont(info.newName.length === 0 ? this.cellFontRegular : this.cellFontBold)
      cell.setStringValue(info.oldName)
      let size = cell.cellSize()
      maxWidth = Math.max(maxWidth, size.width)

      cell = cells[index + 1]
      cell.setFont(this.cellFontRegular)
      cell.setStringValue(info.newName)
      size = cell.cellSize()
      maxWidth = Math.max(maxWidth, size.width)
    }

    return NSMakeSize(maxWidth, cells[0].cellSize().height)
  }

  initMatrix() {
    const BORDER_STYLE = NSBezelBorder

    const scrollViewSize = this.outlets.scrollView.frame().size
    const contentSize = NSScrollView.contentSizeForFrameSize_horizontalScrollerClass_verticalScrollerClass_borderType_controlSize_scrollerStyle(
      scrollViewSize,
      null,
      NSScroller,
      BORDER_STYLE,
      NSRegularControlSize,
      NSScrollerStyleOverlay
    )

    const insets = this.outlets.scrollView.contentInsets()
    contentSize.width -= insets.left + insets.right
    contentSize.height -= insets.top + insets.bottom

    // Start with a default size, we'll fix that later
    let cellSize = NSMakeSize(100, 16)
    const cellPrototype = NSCell.alloc().initTextCell('')
    this.matrix = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(
      NSMakeRect(0, 0, cellSize.width * PREVIEW_COLUMN_COUNT, cellSize.height * this.renamedStyles.length),
      NSListModeMatrix,
      cellPrototype,
      this.renamedStyles.length,
      PREVIEW_COLUMN_COUNT
    )

    cellSize = this.setMatrixData()

    // Add 25% to the cell width to allow for longer names when renaming
    cellSize.width *= 1.25
    this.matrix.setCellSize(CGSizeMake(cellSize.width, cellSize.height));
    this.matrix.setIntercellSpacing(PREVIEW_CELL_SPACING)
    this.matrix.sizeToCells()

    this.outlets.scrollView.setDocumentView(this.matrix)

    this.alignLabelWithColumn(this.outlets.beforeLabel, 0)
    this.alignLabelWithColumn(this.outlets.afterLabel, 1)

    // Resize the window to fit the matrix
    let matrixHeight = cellSize.height * PREVIEW_VISIBLE_ROWS
    matrixHeight += PREVIEW_CELL_SPACING.height * (PREVIEW_VISIBLE_ROWS - 1)
    const matrixSize = NSMakeSize(this.matrix.frame().size.width, matrixHeight)

    // Now adjust the containing view width and column labels to fit the matrix
    const frameSize = NSScrollView.frameSizeForContentSize_horizontalScrollerClass_verticalScrollerClass_borderType_controlSize_scrollerStyle(
      matrixSize,
      null,
      NSScroller,
      BORDER_STYLE,
      NSRegularControlSize,
      NSScrollerStyleOverlay
    )

    // Take content insets into account
    frameSize.width += insets.left + insets.right
    frameSize.height += insets.top + insets.bottom

    // Calculate the difference in the old size vs. new size, apply that to the view frame
    const sizeDiff = NSMakeSize(frameSize.width - scrollViewSize.width, frameSize.height - scrollViewSize.height)
    const windowFrame = this.nib.window.frame()
    windowFrame.size.width += sizeDiff.width
    windowFrame.size.height += sizeDiff.height
    this.nib.window.setFrame_display(windowFrame, true)
  }

  updateCountLabel() {
    const styleCount = this.styles.numberOfSharedStyles()
    const label = NSString.stringWithFormat('%@ of %@ styles will be renamed', this.renameCount, styleCount)

    this.outlets.countLabel.setStringValue(label)
    this.setReplaceEnabled(this.renameCount > 0)

    if (this.renameCount > 0) {
      // We need to do this trick to make the Rename button the default
      this.outlets.renameButton.setKeyEquivalent('')
      this.outlets.renameButton.setKeyEquivalent('\r')
    }
  }

  setReplaceEnabled(enabled) {
    this.outlets.renameButton.setEnabled(enabled)
    this.outlets.applyButton.setEnabled(enabled)
  }

  showFindDialog() {
    // Get all of the style names to start with
    this.initStyleInfo()

    if (this.renamedStyles.length === 0) {
      const alert = this.makeAlert()
      alert.setInformativeText('This document has no shared text styles.')
      alert.runModal()
      return 0
    }

    this.loadNib()
    this.initMatrix()
    this.updateCountLabel()

    return NSApp.runModalForWindow(this.nib.window)
  }

  run() {
    const response = this.showFindDialog()

    if (response !== 0) {
      this.nib.unload()
      this.nib.window.orderOut(null)
    }
  }
}

export default function onRun(context) {
  const renamer = new SharedStyleRenamer(context)
  renamer.run()
}
