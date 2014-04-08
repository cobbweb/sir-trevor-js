var BlockUtils = (function() {

  return {
    setSelection: function(editor, blockPosition, paragraphNumber) {
      var selection = window.getSelection();
      selection.removeAllRanges();
      var block = editor.blocks[blockPosition];
      var textBlock = block.getTextBlock()[0];
      var heading = textBlock;
      if (textBlock.children.length != 0) {
        heading = textBlock.children[paragraphNumber];
      }
      var range = document.createRange();
      range.setStart(heading, 0);
      range.setEnd(heading, 1);
      selection.addRange(range);
    },

    setMultiParagraphSelection: function(editor, blockPosition) {
      var selection = window.getSelection();
      selection.removeAllRanges();
      var block = editor.blocks[blockPosition];
      var paragraph1 = block.getTextBlock()[0].children[0];
      var paragraph2 = block.getTextBlock()[0].children[2];
      var range = document.createRange();
      range.setStart(paragraph1, 0);
      range.setEnd(paragraph2, 1);
      selection.addRange(range);
    },

    getBlockType: function(editor, blockPosition) {
      return editor.$wrapper.find('.st-block').eq(blockPosition).data().type;
    },

    getBlockTextFromPosition: function(editor, position) {
      return editor.$wrapper.find('.st-block').eq(position).find('.st-text-block')[0].innerText.trim();
    }
  }
}());
