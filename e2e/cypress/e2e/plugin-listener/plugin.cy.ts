/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'log').as('log')
})

beforeEach(() => {
  cy.visit('/#/plugin-listener')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('on markdown updated', () => {
  it('normal', () => {
    cy.get('.editor').type('AAA')

    cy.get('@log').should('have.callCount', 3)
  })

  it('inline sync', () => {
    cy.get('.editor').type('*')
    cy.get('@log').should('have.callCount', 1).should('be.calledWith', '\\*\n')
    cy.get('.editor').type('A')
    cy.get('@log').should('have.callCount', 2).should('be.calledWith', '\\*A\n')
    cy.get('.editor').type('*')
    cy.get('@log').should('have.callCount', 4).should('be.calledWith', '*A*\n')
    cy.get('.editor').type(' _A_')
    cy.get('@log').should('be.calledWith', '*A* _A_\n')
  })
})
