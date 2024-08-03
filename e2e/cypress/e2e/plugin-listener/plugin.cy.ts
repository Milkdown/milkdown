Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'log').as('log')
})

beforeEach(() => {
  cy.visit('/plugin-listener/')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('on markdown updated', () => {
  it('normal', () => {
    cy.get('.editor').type('AAA')

    cy.get('@log').should('have.callCount', 3)
  })

  it('value and default value', () => {
    cy.get('.editor').type('A')

    cy.get('@log').should('have.been.calledOnceWith', 'testA\n', 'test\n')
  })
})
