/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

beforeEach(() => {
  cy.visit('/#/preset-commonmark')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

it('get telemetry', () => {
  cy.get('.editor')
  cy.window().then((win) => {
    cy.wrap(win.__inspect__()).should('have.length.above', 1)
  })
})
