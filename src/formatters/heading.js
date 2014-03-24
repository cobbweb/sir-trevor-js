(function(SirTrevor, document) {
  'use strict';

  var Heading = SirTrevor.Formatter.extend({

    title: 'heading',
    keyCode: 49,
    text: 'H',

    WHITESPACE_AND_BR: new RegExp('^(?:\s*<br\s*/?>)*\s*$', 'gim'),

    /**
     * These constant are few use with Range.comparePoint
     * https://developer.mozilla.org/en-US/docs/Web/API/range.comparePoint
     */
    TEXT_BEFORE: -1,
    TEXT_AFTER: 1,

    onClick: function() {
      var selection = document.getSelection();

      if (selection.type !== 'Range' || !selection.rangeCount > 0) {
        return null; // no ranges
      }

      var range = selection.getRangeAt(0);
      var block = this._getSelectedBlock(range);
      var blockInner = block.getElementsByClassName('st-text-block')[0];
      var editor = SirTrevor.getInstance(block.getAttribute('data-instance'));
      var position = editor.getBlockPosition(block) + 1;

      var paragraphsBeforeSelection = this.getParagraphsBeforeSelection(range, blockInner);
      var paragraphsAfterSelection = this.getParagraphsAfterSelection(range, blockInner);
      var newHeadings = this.getSelectedParagraphs(range, blockInner);

      // Remove the headings and paragraps after from the current text block
      this.removeParagraphs([].concat(paragraphsAfterSelection, newHeadings));

      // Add a new heading block for each paragraph that was selected
      position = this.addHeadingBlocks(newHeadings, position, editor);

      // Move text after the selection into a new text block,
      // after the heading block(s) we just created
      var textAfter = this.convertParagraphsToText(paragraphsAfterSelection);
      this.addTextBlock(textAfter, position, editor);

      // Delete current block if it's now empty
      if (this.isOnlyWhitespaceParagraphs(paragraphsBeforeSelection)) {
        editor.removeBlock(block.id);
      }
    },

    removeParagraphs: function(paragraphs, blockInner) {
      _.each(paragraphs, function(p) {
        p.parentNode.removeChild(p);
      });
    },

    addHeadingBlocks: function(paragraphs, addAt, editor) {
      _.each(paragraphs, function(heading) {
        // Ignore whitespace and <br> "paragraphs"
        if (heading.innerHTML.match(this.WHITESPACE_AND_BR) === null) {
          editor.createBlock('Heading', { text: heading.innerHTML }, addAt);
        }
        addAt += 1; // incremement index to account for each heading block
      }, this);

      return addAt;
    },

    /**
     * Convert an array of block elements into a
     * markdown-like string
     */
    convertParagraphsToText: function(paragraphs) {
      return _.chain(paragraphs)
        .filter(function(p) {
          return p.innerHTML.match(this.WHITESPACE_AND_BR) === null;
        }, this)
        .map(function(p) {
          return p.innerHTML;
        })
        .value() // get filtered array
        .join('\n\n'); // to string;
    },

    isOnlyWhitespaceParagraphs: function(paragraphs) {
      return _.every(paragraphs, function(p) {
        return p.innerHTML.match(this.WHITESPACE_AND_BR) === null;
      }, this);
    },

    addTextBlock: function(text, addAt, editor) {
      editor.createBlock('Text', { text: text }, addAt);
    },

    /**
     * Examines the current selection and retrieves any
     * wholly or partially selected paragraphs
     */
    getSelectedParagraphs: function(range, blockInner) {
      var startContainer = this._getRangeContainerElement(range.startContainer);
      var endContainer = this._getRangeContainerElement(range.endContainer);

      if (startContainer === endContainer) {
        return [startContainer];
      }

      var paragraphs = [startContainer];

      var otherParagraphs = _.filter(blockInner.children, function(el) {
        return range.comparePoint(el, 0) === 0;
      });

      paragraphs = paragraphs.concat(otherParagraphs, endContainer);

      return _.unique(paragraphs);
    },

    /**
     * Return all the paragraphs that are after
     * the selection the text block
     */
    getParagraphsAfterSelection: function(range, blockInner) {
      return this._getParagraphsRelativeToRange(range, this.TEXT_AFTER, blockInner);
    },

    /**
     * Return all the paragraphs that are before
     * the selection the text block
     */
    getParagraphsBeforeSelection: function(range, blockInner) {
      return this._getParagraphsRelativeToRange(range, this.TEXT_BEFORE, blockInner);
    },

    /**
     * Position integer:
     *  1 - After
     * -1 - Before
     *
     * See here: https://developer.mozilla.org/en-US/docs/Web/API/range.comparePoint
     */
    _getParagraphsRelativeToRange: function(range, position, blockInner) {
      var text = Array.prototype.filter.call(blockInner.children, function(child) {
        return range.comparePoint(child, 0) === position;
      }.bind(this));

      return text;
    },

    /**
     * Sometimes range containers will be text fragments
     * or HTML elements
     */
    _getRangeContainerElement: function(container) {
      if (container.nodeName === '#text') {
        return container.parentNode;
      }

      return container;
    },

    _getSelectedBlock: function(range) {
      var block = this._getRangeContainerElement(range.startContainer);
      while (!block.classList.contains('st-block')) {
        block = block.parentNode;
      }
      return block;
    }

  });

  SirTrevor.Formatters.Heading = new Heading();

}(SirTrevor, document));
