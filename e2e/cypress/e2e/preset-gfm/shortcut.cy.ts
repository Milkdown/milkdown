beforeEach(() => {
  cy.visit('/preset-gfm/')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('shortcut:', () => {
  const isMac = Cypress.platform === 'darwin'

  it('strike through', () => {
    cy.get('.editor').type('The lunatic is on the grass')
    cy.get('.editor').type('{selectAll}')
    cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+x}`)
    cy.get('del').should('have.text', 'The lunatic is on the grass')
    cy.get('.editor').type('{selectAll}')
    cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+x}`)
    cy.get('del').should('not.exist')
  })
})
