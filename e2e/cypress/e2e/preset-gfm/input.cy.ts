/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

beforeEach(() => {
  cy.visit('/#/preset-gfm')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('input:', () => {
  it('strike through', () => {
    cy.get('.editor').type('The lunatic is ~~on the grass~~')
    cy.get('.editor').get('del').should('have.text', 'on the grass')
  })

  it('auto link', () => {
    cy.get('.editor').type('Here is https://www.milkdown.dev')
    cy.get('.editor').get('a').should('have.text', 'https://www.milkdown.dev')
    cy.get('.editor').get('a').should('have.attr', 'href', 'https://www.milkdown.dev')
  })
})
