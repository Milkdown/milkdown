beforeEach(() => {
  cy.visit('/preset-commonmark/')
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
