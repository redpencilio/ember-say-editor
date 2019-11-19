import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * contenteditable component
 * This component wraps a contenteditable div and captures events for further handling
 *
 * clicks within the contenteditable trigger a selection calculation which is passed on the handleSelectionUpdate function
 * keypresses are passed on to the handleKey function
 * clipboard events (copy, paste, cut) are passed on the handleClipboard function
 * undo events is passed on to the handleUndo function
 * These functions should return a boolean, based on the boolean the originating eventdefault is prevented (false) or not (true)
 * @module ember-say-editor
 * @constructor
 * @extends Component
 */
export default class SayContenteditableComponent extends Component {
  handleSelectionUpdate;
  handleKeyEvent;
  handleClipboardEvent;

  @action
  emitKeyEvent(event) {
    if (this.isKeyboardShortcut(event)) {
      // do nothing, this is handled in its own event
      return false;
    }
    else {
      const eventWasHandled = this.passEventToHandler( { event }, this.handleKeyEvent);
      return eventWasHandled;
    }
  }

  @action
  setRootNode(element) {
    this.rootNode = element;
  }

  @action
  emitClipboardEvent(event) {
    const eventWasHandled = this.passEventToHandler( { event }, this.handleClipboardEvent);
    return eventWasHandled;
  }

  @action
  emitUndoEvent(event) {
    const eventWasHandled = this.passEventToHandler( { event }, this.handleUndoEvent);
    return eventWasHandled;
  }

  @action
  emitSelection() {
    let windowSelection = window.getSelection();
    if (windowSelection.rangeCount > 0) {
      let range = windowSelection.getRangeAt(0);
      let commonAncestor = range.commonAncestorContainer;
      if (this.rootNode && this.rootNode.contains(commonAncestor)) {
        if (typeof this.handleSelectionUpdate === 'function') {
          this.handleSelectionUpdate(range);
        }
      }
    }
  }

  passEventToHandler(data, handler) {
    if (typeof handler === 'function') {
      const eventWasHandled = handler(data);
      if (eventWasHandled) {
        data.event.preventDefault();
        return true;
      }
      else {
        return false;
      }
    }
    else {
      // event wans't handled
      return false;
    }
  }

  @action
  isKeyboardShortcut(event) {
    return (event.ctrlKey || event.metaKey ) && ["z","v","c","x"].includes(event.key);
  }
}
