/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

beforeEach(() => {
  cy.visit('/multi-editor/')
})

it('has editor', () => {
  cy.get('.milkdown:first-child .editor').should('have.attr', 'contenteditable', 'true')
  cy.get('.milkdown:last-child .editor').should('have.attr', 'contenteditable', 'true')
  cy.get('.milkdown').should('have.length', 2)
})

it('insert table', () => {
  cy.get('.milkdown').should('have.length', 2)
  cy.window().then((win) => {
    win.commands.addTable?.()
    win.commands.addTable2?.()
  })
  cy.get('.milkdown:first-child .editor table').should('exist')
  cy.get('.milkdown:last-child .editor table').should('exist')
  cy.get('table').should('have.length', 2)
})
