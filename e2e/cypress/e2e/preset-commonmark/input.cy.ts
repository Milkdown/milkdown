beforeEach(() => {
  cy.visit('/preset-commonmark/')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('input:', () => {
  describe('node:', () => {
    it('paragraph', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').get('p').should('have.text', 'The lunatic is on the grass')
      cy.isMarkdown('The lunatic is on the grass\n')
    })

    it('heading', () => {
      cy.get('.editor').type('# Heading1')
      cy.get('.editor').get('h1')
        .should('have.text', 'Heading1')
        .should('have.attr', 'id', 'heading1')

      cy.get('.editor').type('{enter}')

      cy.get('.editor').type('## Heading 2')
      cy.get('.editor').get('h2')
        .should('have.text', 'Heading 2')
        .should('have.attr', 'id', 'heading-2')
      cy.window().then((win) => {
        cy.wrap(win.__getMarkdown__())
          .should('equal', '# Heading1\n\n## Heading 2\n')
      })
    })

    it('blockquote', () => {
      cy.get('.editor').type('> Blockquote')
      cy.get('blockquote').get('p').should('have.text', 'Blockquote')

      cy.get('.editor').type('{enter}Next line.')

      cy.get('blockquote').get('p:last-child').should('have.text', 'Next line.')
      cy.isMarkdown('> Blockquote\n>\n> Next line.\n')
    })

    it('bullet list', () => {
      cy.get('.editor').type('* list item 1')
      cy.get('.editor ul>li').should('have.text', 'list item 1')

      cy.get('.editor').type('{enter}list item 2')
      cy.get('.editor ul>li:last-child').should('have.text', 'list item 2')

      cy.get('.editor').type('{enter}{backspace}* sub list item 1')
      cy.get('.editor ul ul>li').should('have.text', 'sub list item 1')

      cy.get('.editor').type('{enter}sub list item 2')
      cy.get('.editor ul ul>li:last-child').should(
        'have.text',
        'sub list item 2',
      )

      cy.get('.editor').type('{enter}{enter}list item 3')
      cy.get('.editor ul:first-child>li:last-child').should('have.text', 'list item 3')
      cy.isMarkdown('* list item 1\n* list item 2\n\n  * sub list item 1\n  * sub list item 2\n* list item 3\n')
    })

    it('ordered list', () => {
      cy.get('.editor').type('1. list item 1')
      cy.get('.editor ol>li').should('have.text', 'list item 1')

      cy.get('.editor').type('{enter}list item 2')
      cy.get('.editor ol>li:last-child').should('have.text', 'list item 2')

      cy.get('.editor').type('{enter}{backspace}1. sub list item 1')
      cy.get('.editor ol ol>li').should('have.text', 'sub list item 1')

      cy.get('.editor').type('{enter}sub list item 2')
      cy.get('.editor ol ol>li:last-child').should(
        'have.text',
        'sub list item 2',
      )
      cy.get('.editor').type('{enter}{enter}list item 3')
      cy.get('.editor ol:first-child>li:last-child').should(
        'have.text',
        'list item 3',
      )
      cy.isMarkdown('1. list item 1\n2. list item 2\n\n   1. sub list item 1\n   2. sub list item 2\n3. list item 3\n')
    })

    it('hr', () => {
      cy.get('.editor').type('---')
      cy.get('hr').should('be.visible')
      cy.isMarkdown('***\n')
    })

    it('code block', () => {
      cy.get('.editor').type('```markdown{enter}')
      cy.get('pre').should('have.attr', 'data-language', 'markdown')
      cy.get('.editor').type('# Hi markdown')
      cy.get('code').should('have.text', '# Hi markdown')
    })
  })

  describe('mark:', () => {
    describe('bold', () => {
      it('normal bold with _', () => {
        cy.get('.editor').type('The lunatic is __on the grass__')
        cy.get('.editor strong').should('have.text', 'on the grass')
        cy.isMarkdown('The lunatic is __on the grass__\n')
      })

      it('normal bold with *', () => {
        cy.get('.editor').type('The lunatic is **on the grass**')
        cy.get('.editor strong').should('have.text', 'on the grass')
        cy.isMarkdown('The lunatic is **on the grass**\n')
      })

      it('a single word', () => {
        cy.get('.editor').type('The lunatic is **o**n the grass')
        cy.get('.editor').get('strong').should('have.text', 'o')
        cy.isMarkdown('The lunatic is **o**n the grass\n')
      })
    })

    describe('italic', () => {
      it('normal italic with _', () => {
        cy.get('.editor').type('The lunatic is _on the grass_')
        cy.get('.editor').get('em').should('have.text', 'on the grass')
        cy.isMarkdown('The lunatic is _on the grass_\n')
      })

      it('normal italic with *', () => {
        cy.get('.editor').type('The lunatic is *on the grass*')
        cy.get('.editor').get('em').should('have.text', 'on the grass')
        cy.isMarkdown('The lunatic is *on the grass*\n')
      })

      it('a single word', () => {
        cy.get('.editor').type('The lunatic is *o*n the grass')
        cy.get('.editor').get('em').should('have.text', 'o')
        cy.isMarkdown('The lunatic is *o*n the grass\n')
      })
    })

    describe('inline code', () => {
      it('normal inline code', () => {
        cy.get('.editor').type('The lunatic is `on the grass`')
        cy.get('.editor').get('code').should('have.text', 'on the grass')
        cy.isMarkdown('The lunatic is `on the grass`\n')
      })
    })

    it('undo input rule when press backspace', () => {
      cy.get('.editor').type('The lunatic is *on the grass*')
      cy.get('.editor').get('em').should('have.text', 'on the grass')
      cy.get('.editor').type('{backspace}')
      cy.isMarkdown('The lunatic is \\*on the grass\\*\n')
    })
  })
})
