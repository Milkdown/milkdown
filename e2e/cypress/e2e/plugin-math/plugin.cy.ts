/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

beforeEach(() => {
  cy.visit('/#/plugin-math')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('math inline', () => {
  it('basic input', () => {
    cy.get('.editor').type('$ E = MC^2 $')

    cy.get('.editor').get('span[data-type="math_inline"]').should('have.attr', 'data-value', 'E = MC^2')
    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__())
        .should('equal', '$E = MC^2$\n')
    })
  })

  it('input single world', () => {
    cy.get('.editor').type('test $ a $')
    cy.get('.editor').get('span[data-type="math_inline"]').should('have.attr', 'data-value', 'a')
    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__())
        .should('equal', 'test $a$\n')
    })
  })

  it('input with _', () => {
    cy.get('.editor').type('$F\'_3(dz-du)F\'_2$')
    cy.get('.editor').get('span[data-type="math_inline"]').should('have.attr', 'data-value', 'F\'_3(dz-du)F\'_2')
    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__())
        .should('equal', '$F\'_3(dz-du)F\'_2$\n')
    })
  })
})
