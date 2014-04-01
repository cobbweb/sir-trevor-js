describe('Formatters.Heading', function(){
  'use strict';

  var fixture = JSON.stringify({"data":[{"type":"text","data":{"text":"Bogan Ipsum\n\nAs cross as a mongrel my she'll be right his blood's worth bottling. As dry as a waggin' school where come a dob. She'll be right sickie when she'll be right good onya. \n\nBuilt like a whinge mate as busy as a tucker. Lets get some battler no worries as cross as a trackies. As cunning as a mozzie to shazza got us some tucker\\-bag. As busy as a doovalacky where gutful of brizzie.\n\nConvert Me, Please!\n\nHe hasn't got a feral mate she'll be right tinny. Come a digger no dramas trent from punchy bathers. We're going grundies where she'll be right fossicker. \n\nAs dry as a bradman heaps as busy as a brick sh\\*t house. He's got a massive smoko where as cunning as a veg out. He hasn't got a pokies also flat out like a barbie.\n\nShe'll be right sickie bloody shazza got us some slabs. Watch out for the trackies piece of piss shazza got us some true blue. Built like a cactus mate when he hasn't got a cab sav. Get a dog up ya postie flamin it'll be waggin' school. You little ripper grouse with grab us a hoon. As busy as a rack off also as dry as a reckon. She'll be right chokkie with come a beauty. Mad as a cubby house with get a dog up ya sook.\n\nHe's got a massive ciggies flamin as cross as a kelpie. Get a dog up ya brisvegas no worries come a galah. As cunning as a bodgy and as stands out like bounce. Flat out like a grundies how flat out like a roadie. As cunning as a barbie where as busy as a roo bar. \n\nAs busy as a ocker with as dry as a swagger. She'll be right wuss also gutful of ford. \n\nWe're going booze bus heaps as dry as a franger.\n"}}]});
  var Heading = SirTrevor.Formatters.Heading;

  beforeEach(function(){
    this.element = $('<textarea>').appendTo('body').wrap('<form/>').end();
    this.element.val(fixture).html(fixture);
    this.editor = new SirTrevor.Editor({ el: this.element });
  });

  afterEach(function() {
    this.editor.$form.remove();
    this.editor.destroy();
  });

  it('should have a heading formatter', function(){
    expect(Heading).toBeDefined();
  });

  describe('addHeadingBlocks', function(){
    beforeEach(function() {
      sinon.spy(this.editor, 'createBlock');

      this.paragraphs = [
        document.createElement('div'),
        document.createElement('div')
      ];

      this.paragraphs[0].innerHTML = 'This is a test heading';
      this.paragraphs[1].innerHTML = 'This is a test heading two';

      // Insert at 2nd index
      this.addAt = Heading.addHeadingBlocks(this.paragraphs, 2, this.editor);
    });

    afterEach(function(){
      this.editor.createBlock.restore();
    });

    it('should create a heading block for each paragraph', function(){
      expect(this.editor.createBlock).toHaveBeenCalled();
      expect(this.editor.createBlock).toHaveBeenCalledTwice();
      expect(this.editor.createBlock).toHaveBeenCalledWithMatch('Heading', { text: 'This is a test heading two' }, 3);
    });

    it('should return the last heading block index', function(){
      expect(this.addAt).toBe(4);
    });

    describe('addHeadingBlocks with non-text headings', function(){
      beforeEach(function(){
        this.editor.createBlock.reset();
        this.paragraphs = [
          document.createElement('div'),
          document.createElement('div'),
          document.createElement('div')
        ];

        this.paragraphs[0].innerHTML = 'This is a test heading';
        this.paragraphs[1].innerHTML = '<br>\n';
        this.paragraphs[2].innerHTML = 'This is a test heading two';

        this.addAt = Heading.addHeadingBlocks(this.paragraphs, 2, this.editor);
      });

      it('should only create headings for elements with text', function(){
        expect(this.editor.createBlock).toHaveBeenCalled();
        expect(this.editor.createBlock).toHaveBeenCalledTwice();
        expect(this.editor.createBlock).toHaveBeenCalledWithMatch('Heading', { text: 'This is a test heading two' }, 3);
      });
    });

    describe('onClick', function() {
      beforeEach(function(){
        var selection = window.getSelection();
        selection.removeAllRanges();
        this.block = this.editor.blocks[0];
        // last text paragraph
        this.heading = this.block.getTextBlock()[0].children[18];
        this.lastParagraph = this.block.getTextBlock()[0].children[19];
        var range = document.createRange();
        range.setStart(this.heading.firstChild, 12);
        range.setEnd(this.heading.firstChild, 37);
        selection.addRange(range);

        sinon.spy(Heading, 'removeParagraphs');
        sinon.spy(Heading, 'addHeadingBlocks');
        sinon.spy(Heading, 'convertParagraphsToText');
        Heading.onClick();
      });

      afterEach(function(){
        Heading.removeParagraphs.restore();
        Heading.addHeadingBlocks.restore();
        Heading.convertParagraphsToText.restore();
      });

      it('calls removeParagraphs', function(){
        console.dir(Heading.removeParagraphs);
        expect(Heading.removeParagraphs).toHaveBeenCalled();
        expect(Heading.removeParagraphs).toHaveBeenCalledWithMatch([
          this.lastParagraph,
          this.heading
        ]);
      });

      it('calls addHeadingBlocks', function(){
        expect(Heading.addHeadingBlocks).toHaveBeenCalled();
        expect(Heading.addHeadingBlocks).toHaveBeenCalledWithMatch([this.heading], 1, this.editor);
      });
    });
  });
});
