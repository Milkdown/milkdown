/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

beforeEach(() => {
  cy.visit('/#/preset-commonmark')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('transform:', () => {
  it('paragraph', () => {
    cy.get('.editor')
    cy.window().then((win) => {
      cy.fixture('paragraph.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })

    cy.get('p').should('have.text', 'The lunatic is on the grass')

    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__()).snapshot()
    })
  })

  it('heading', () => {
    cy.get('.editor')
    cy.window().then((win) => {
      cy.fixture('heading.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })

    cy.get('h1').should('have.text', 'The lunatic is on the grass')
  })

  it('blockquote', () => {
    cy.get('.editor')
    cy.window().then((win) => {
      cy.fixture('blockquote.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })

    cy.get('blockquote p').should('have.length', 2)
    cy.get('blockquote br').should('exist')
  })

  it('list', () => {
    cy.get('.editor')
    cy.window().then((win) => {
      cy.fixture('list.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })

    cy.get('.editor>ul').should('have.length', 2)
    cy.get('.editor>ul:first-child li').should('have.length', 4)
    cy.get('.editor>ul:first-child>li').should('have.length', 2)
    cy.get('.editor>ul:first-child ul>li:first-child').should(
      'have.text',
      'Remembering games and daisy chains and laughs',
    )

    cy.get('.editor>ol').should('have.length', 1)
    cy.get('.editor>ol li').should('have.length', 4)
    cy.get('.editor>ol>li').should('have.length', 2)
    cy.get('.editor>ol ol>li:first-child').should(
      'have.text',
      'The paper holds their folded faces to the floor',
    )

    cy.get('.editor>ul:last-child li').should('have.length', 8)
    cy.get('.editor>ul:last-child ul').should('have.length', 1)
    cy.get('.editor>ul:last-child ol').should('have.length', 2)
  })

  it('hr', () => {
    cy.get('.editor')
    cy.window().then((win) => {
      cy.fixture('hr.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })

    cy.get('hr').should('be.visible')
  })

  it('code block', () => {
    cy.get('.editor')
    cy.window().then((win) => {
      cy.fixture('code-block.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })

    cy.get('pre').should('have.length', 2)
    cy.get('pre:first-child').should('not.have.attr', 'data-language')
    cy.get('pre:last-child').should('have.attr', 'data-language', 'javascript')
  })

  it('html', () => {
    cy.get('.editor')
    cy.window().then((win) => {
      cy.fixture('html.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })

    cy.get('span[data-type="html"]').should('have.length', 3)
    cy.get('span[data-type="html"]').first().should('have.text', '<h1>Heading</h1>')
    cy.get('span[data-type="html"]').eq(1).should('have.text', '<strong>')
    cy.get('span[data-type="html"]').last().should('have.text', '</strong>')
  })

  it('mark', () => {
    cy.get('.editor')
    cy.window().then((win) => {
      cy.fixture('cm-mark.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })

    cy.get('strong').first().should('have.text', 'The lunatic is on the grass')
    cy.get('em').first().should('have.text', 'The lunatic is on the grass')
    cy.get('code').first().should('have.text', 'The lunatic is on the grass')
    cy.get('a').first().should('have.text', 'The lunatic is on the grass')
    cy.get('a').first().should('have.attr', 'href', 'link')

    cy.get('p')
      .eq(4)
      .within(() => {
        cy.get('strong').should('have.text', 'The lunatic is on the grass')
        cy.get('em').should('have.text', 'The lunatic is on the grass')
      })

    cy.get('p')
      .eq(5)
      .within(() => {
        cy.get('strong').should('have.text', 'The lunatic is on the grass')
        cy.get('em').should('have.text', 'The lunatic is on the grass')
        cy.get('code').should('have.text', 'The lunatic is on the grass')
      })

    cy.get('p')
      .last()
      .within(() => {
        cy.get('strong').should('have.text', 'The lunatic is on the grass')
        cy.get('em').should('have.text', 'The lunatic is on the grass')
        cy.get('a').should('have.text', 'The lunatic is on the grass')
      })

    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__()).snapshot()
    })
  })
})
