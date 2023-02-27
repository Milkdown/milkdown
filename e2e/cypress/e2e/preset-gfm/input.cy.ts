/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

beforeEach(() => {
  cy.visit('/#/preset-gfm')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('input:', () => {
  describe('task list', () => {
    it('unchecked', () => {
      cy.get('.editor').type('- [ ] task list')
      cy.get('.editor').get('li')
        .should('have.attr', 'data-item-type', 'task')
        .should('have.attr', 'data-checked', 'false')
    })

    it('checked', () => {
      cy.get('.editor').type('- [x] task list')
      cy.get('.editor').get('li')
        .should('have.attr', 'data-item-type', 'task')
        .should('have.attr', 'data-checked', 'true')
    })
  })

  it('strike through', () => {
    cy.get('.editor').type('The lunatic is ~~on the grass~~')
    cy.get('.editor').get('del').should('have.text', 'on the grass')
  })

  it('auto link', () => {
    cy.get('.editor').type('Here is https://www.milkdown.dev')
    cy.get('.editor').get('a').should('have.text', 'https://www.milkdown.dev')
    cy.get('.editor').get('a').should('have.attr', 'href', 'https://www.milkdown.dev')
  })

  describe('table', () => {
    it('3x2', () => {
      cy.get('.editor').type('|3x2| ')
      cy.get('.editor').get('table').should('exist')
      cy.get('.editor').get('tr').should('have.length', 2)
      cy.get('.editor').get('th').should('have.length', 3)
      cy.get('.editor').get('td').should('have.length', 3)
    })

    it('4x5', () => {
      cy.get('.editor').type('|4x5| ')
      cy.get('.editor').get('table').should('exist')
      cy.get('.editor').get('tr').should('have.length', 5)
      cy.get('.editor').get('th').should('have.length', 4)
      cy.get('.editor').get('td').should('have.length', 16)
    })
  })
})
