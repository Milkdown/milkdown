/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

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
      cy.window().then((win) => {
        cy.wrap(win.__getMarkdown__())
          .should('equal', 'The lunatic is on the grass\n')
      })
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
      cy.window().then((win) => {
        cy.wrap(win.__getMarkdown__())
          .should('equal', '> Blockquote\n>\n> Next line.\n')
      })
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
      cy.window().then((win) => {
        cy.wrap(win.__getMarkdown__())
          .should('equal', '*   list item 1\n*   list item 2\n\n    *   sub list item 1\n    *   sub list item 2\n*   list item 3\n')
      })
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
      cy.window().then((win) => {
        cy.wrap(win.__getMarkdown__())
          .should('equal', '1.  list item 1\n2.  list item 2\n\n    1.  sub list item 1\n    2.  sub list item 2\n3.  list item 3\n')
      })
    })

    it('hr', () => {
      cy.get('.editor').type('---')
      cy.get('hr').should('be.visible')
      cy.window().then((win) => {
        cy.wrap(win.__getMarkdown__())
          .should('equal', '***\n')
      })
    })

    it('code block', () => {
      cy.get('.editor').type('```markdown{enter}')
      cy.get('pre').should('have.attr', 'data-language', 'markdown')
      cy.get('.editor').type('# Hi markdown')
      cy.get('code').should('have.text', '# Hi markdown')
    })

    describe('image', () => {
      it('invalid image', () => {
        cy.get('.editor').type('![image](invalidUrl)')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', '![image](invalidUrl)\n')
        })
      })

      it('valid image', () => {
        cy.intercept('*.png', {
          delay: 1000,
          fixture: 'milkdown-mini.png',
        })
        cy.get('.editor').type('![image](/milkdown-mini.png)')
        cy.get('img').should('have.attr', 'src', '/milkdown-mini.png')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', '![image](/milkdown-mini.png)\n')
        })
      })
    })
  })

  describe('mark:', () => {
    describe('bold', () => {
      it('normal bold', () => {
        cy.get('.editor').type('The lunatic is __on the grass__')
        cy.get('.editor strong').should('have.text', 'on the grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is __on the grass__\n')
        })
      })

      it('not a bold', () => {
        cy.get('.editor').type('The lunatic is o__"n the grass__')
        cy.get('.editor').get('p').should('have.text', 'The lunatic is o__"n the grass__')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is o\\_\\_\"n the grass\\_\\_\n')
        })
      })

      it('is a bold', () => {
        cy.get('.editor').type('The lunatic is "__on the grass__"')
        cy.get('.editor').get('strong').should('have.text', 'on the grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is \"__on the grass__\"\n')
        })
      })

      it('a single word', () => {
        cy.get('.editor').type('The lunatic is **o**n the grass')
        cy.get('.editor').get('strong').should('have.text', 'o')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is **o**n the grass\n')
        })
      })
    })

    describe('italic', () => {
      it('normal italic', () => {
        cy.get('.editor').type('The lunatic is _on the grass_')
        cy.get('.editor').get('em').should('have.text', 'on the grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is _on the grass_\n')
        })
      })

      it('not an italic', () => {
        cy.get('.editor').type('The lunatic is o*"n the grass*')
        cy.get('.editor').get('p').should('have.text', 'The lunatic is o*"n the grass*')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is o\\*\"n the grass\\*\n')
        })
      })

      it('is an italic', () => {
        cy.get('.editor').type('The lunatic is "_on the grass_"')
        cy.get('.editor').get('em').should('have.text', 'on the grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is \"_on the grass_\"\n')
        })
      })

      it('a single word', () => {
        cy.get('.editor').type('The lunatic is *o*n the grass')
        cy.get('.editor').get('em').should('have.text', 'o')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is *o*n the grass\n')
        })
      })
    })

    describe('inline code', () => {
      it('normal inline code', () => {
        cy.get('.editor').type('The lunatic is `on the grass`')
        cy.get('.editor').get('code').should('have.text', 'on the grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is `on the grass`\n')
        })
      })

      it('inline code with * and _', () => {
        cy.get('.editor').type('The lunatic is `__`')
        cy.get('.editor').type('{leftArrow}').type('**on the grass**')
        cy.get('.editor').get('code').should('have.text', '_**on the grass**_')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic is `_**on the grass**_`\n')
        })
      })
    })

    it('link', () => {
      cy.get('.editor').type('The lunatic is [on the grass](url)')
      cy.get('.editor a').should('have.text', 'on the grass').and('have.attr', 'href', 'url')
      cy.window().then((win) => {
        cy.wrap(win.__getMarkdown__())
          .should('equal', 'The lunatic is [on the grass](url)\n')
      })
    })
  })
})
