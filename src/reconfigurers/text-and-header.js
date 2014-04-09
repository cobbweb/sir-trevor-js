(function(SirTrevor) {

  var TextAndHeader = SirTrevor.BlockReconfigurer.extend({

    WHITESPACE_AND_BR: new RegExp('^(?:\s*<br\s*/?>)*\s*$', 'gim'),

    /**
     * These constant are few use with Range.comparePoint
     * https://developer.mozilla.org/en-US/docs/Web/API/range.comparePoint
     */
    TEXT_BEFORE: -1,
    TEXT_AFTER: 1,


    _mergeTextBlocks: function(editor, firstBlock, secondBlock, blockPositionToInsert) {
      var textFromPreviousBlock = firstBlock.find('.st-text-block').html();
      var textFromNewlyCreatedTextBlock = secondBlock.find('.st-text-block').html();
      var textForNewBlock = textFromPreviousBlock + '<div><br></div>' + textFromNewlyCreatedTextBlock;
      this.addTextBlock(textForNewBlock, blockPositionToInsert, editor);
      editor.removeBlock(firstBlock.attr('id'));
      editor.removeBlock(secondBlock.attr('id'));
    },

    _mergeIfTextBlock: function(editor, blockToCheck, firstBlock, secondBlock, blockPosition) {
      if (this.isTextBlock(blockToCheck)) {
        this._mergeTextBlocks(editor, firstBlock, secondBlock, blockPosition);
      }
    },

    merge: function(range) {
      var block = this._getSelectedBlock(range);
      var blockInner = block.getElementsByClassName('st-text-block')[0];
      var editor = SirTrevor.getInstance(block.getAttribute('data-instance'));
      var blockPosition = editor.getBlockPosition(block);

      //create a text block from the contents of the exisiting header block
      this.addTextBlock(blockInner.innerText, blockPosition, editor);

      // remove the old header block
      editor.removeBlock(block.id);
      SirTrevor.EventBus.trigger("formatbar:hide", editor.formatBar);

      var totalNumberOfBlocks = editor.blocks.length;
      if (totalNumberOfBlocks === 1) {
        return;
      }
      var newlyCreatedTextBlock = this.getBlockFromPosition(editor, blockPosition);
      var previousBlock = this.getBlockFromPosition(editor, blockPosition - 1);
      var nextBlock = this.getBlockFromPosition(editor, blockPosition + 1);

      if (totalNumberOfBlocks === (blockPosition + 1)) {
        //merge into the block above
        this._mergeIfTextBlock(editor, previousBlock, previousBlock, newlyCreatedTextBlock, blockPosition);
        return;
      }

      if (blockPosition === 0) {
        // if block below is not a a heading then merge into it
        this._mergeIfTextBlock(editor, nextBlock, newlyCreatedTextBlock, nextBlock, blockPosition);
      } else {
        // merge top and bottom blocks
        this._mergeIfTextBlock(editor, nextBlock, newlyCreatedTextBlock, nextBlock, blockPosition);
        newlyCreatedTextBlock = this.getBlockFromPosition(editor, blockPosition);
        this._mergeIfTextBlock(editor, previousBlock, previousBlock, newlyCreatedTextBlock, blockPosition);
      }
    },

    split: function(range) {
      var block = this._getSelectedBlock(range);
      var blockInner = block.getElementsByClassName('st-text-block')[0];
      var editor = SirTrevor.getInstance(block.getAttribute('data-instance'));
      var position = editor.getBlockPosition(block) + 1;
      var paragraphsBeforeSelection = this.getParagraphsBeforeSelection(range, blockInner);
      var paragraphsAfterSelection = this.getParagraphsAfterSelection(range, blockInner);
      var newHeadings = this.getSelectedParagraphs(range, blockInner);
      SirTrevor.EventBus.trigger("formatbar:hide", editor.formatBar);

      // Remove the headings and paragraphs after from the current text block
      this.removeParagraphs([].concat(paragraphsAfterSelection, newHeadings));

      // Add a new heading block for each paragraph that was selected
      position = this.addHeadingBlocks(newHeadings, position, editor);

      // Move text after the selection into a new text block,
      // after the heading block(s) we just created
      var totalNumberOfBlocks = editor.blocks.length;
      var textAfter = this.convertParagraphsToText(paragraphsAfterSelection);
      if (textAfter || ((position) === totalNumberOfBlocks)) {
        this.addTextBlock(textAfter, position, editor);
      }

      // Delete current block if it's now empty
      if (this.isOnlyWhitespaceParagraphs(paragraphsBeforeSelection)) {
        editor.removeBlock(block.id);
      }
    }
  });

  /*
   Create our formatters and add a static reference to them
   */
  SirTrevor.TextAndHeader = new TextAndHeader();

}(SirTrevor));