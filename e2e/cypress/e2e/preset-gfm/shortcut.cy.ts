/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

beforeEach(() => {
  cy.visit('/#/preset-gfm')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('shortcut:', () => {
  const isMac = Cypress.platform === 'darwin'

  it('strike through', () => {
    cy.get('.editor').type('The lunatic is on the grass')
    cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+a}`)
    cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+x}`)
    cy.get('del').should('have.text', 'The lunatic is on the grass')
    cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+x}`)
    cy.get('del').should('not.exist')
  })
})
