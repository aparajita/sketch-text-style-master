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

'use strict'

export class NibUI {
  constructor(context, resourceBundleName, nibName, owner, outletsName) {
    const bundlePath = context.plugin.urlForResourceNamed(resourceBundleName).path()
    this._bundle = NSBundle.bundleWithPath(bundlePath)
    this.outlets = {}

    // Create a class name that doesn't exist yet. Note that we can't reuse the same
    // definition lest Sketch will throw an MOJavaScriptException when binding the UI,
    // probably due to JavaScript context / plugin lifecycle incompatibility.

    function randomId() {
      return (100000 * Math.random()).toFixed(0)
    }

    let className

    do {
      className = 'NibOwner' + randomId()
    }
    while (NSClassFromString(className) != null)

    const superclass = NSClassFromString('NSObject')
    this._cls = MOClassDescription.allocateDescriptionForClassWithName_superclass_(className, superclass)

    // Get the list of outlets and actions as defined in the nib.

    const connections = this._loadConnections(nibName)
    let outlets

    // If an owner was passed and it has an 'outlets' dict, register the views with that.

    if (owner) {
      const name = outletsName || 'outlets'
      outlets = owner[name]

      if (typeof outlets === 'undefined') {
        owner[name] = {}
        outlets = owner[name]
      }
    }
    else {
      outlets = this.outlets
    }

    // Create setter methods that will be called when connecting each outlet during nib loading.
    // The setter methods register the connected view.

    for (let i = 0; i < connections.outlets.length; i++) {
      const outlet = connections.outlets[i]
      const selector = `set${outlet.charAt(0).toUpperCase()}${outlet.substring(1)}:`

      this._cls.addInstanceMethodWithSelector_function(
        NSSelectorFromString(selector),
        view => { outlets[outlet] = view }
      )
    }

    // Hook up actions with the owner.

    if (owner) {
      for (let i = 0; i < connections.actions.length; i++) {
        const action = connections.actions[i]
        const func = owner[action.slice(0, -1)] // Trim ':' from end of action

        if (typeof func === 'function') {
          this._cls.addInstanceMethodWithSelector_function(
            NSSelectorFromString(action),
            notification => {
              // javascriptCore tends to die a horrible death if an uncaught exception occurs in an action method
              try {
                func.call(owner, notification)
              }
              catch (ex) {
                log(NSString.stringWithFormat('%@: %@\nStack:\n%@', ex.name, ex.message, ex.stack))
              }
            }
          )
        }
      }
    }

    this._cls.registerClass()
    this._nibOwner = NSClassFromString(className).alloc().init()

    const tloPointer = MOPointer.alloc().initWithValue(null)

    // Load the nib and look for the hard-wired names 'mainView' and 'window' in the top level objects

    if (this._bundle.loadNibNamed_owner_topLevelObjects(nibName, this._nibOwner, tloPointer)) {
      const topLevelObjects = tloPointer.value()

      for (let i = 0; i < topLevelObjects.count(); i++) {
        const obj = topLevelObjects[i]

        if (obj.className().isEqual('MainView')) {
          this.view = obj
          break
        }
        else if (obj.isKindOfClass(NSWindow)) {
          this.window = obj
          break
        }
      }
    }
    else {
      throw new Error('Could not load nib')
    }
  }

  _loadConnections(nibName) {
    const path = this._bundle.pathForResource_ofType(nibName, 'plist')
    const connections = {
      outlets: [],
      actions: []
    }

    if (path) {
      const plist = NSDictionary.dictionaryWithContentsOfFile(path)

      if (plist) {
        const connectionDict = plist['com.apple.ibtool.document.connections']
        const keys = Object.keys(connectionDict)

        for (let i = 0; i < keys.length; i++) {
          const connection = connectionDict[keys[i]]

          if (connection.type.isEqual('IBCocoaOutletConnection')) {
            if (!/initialFirstResponder|nextKeyView/.test(connection.label)) {
              connections.outlets.push(connection.label)
            }
          }
          else if (connection.type.isEqual('IBCocoaActionConnection')) {
            connections.actions.push(connection.label)
          }
        }
      }
    }

    return connections
  }

  /**
   * Release all resources. Should be called the nib is no longer being used.
   */
  unload() {
    this._bundle.unload()
  }
}
