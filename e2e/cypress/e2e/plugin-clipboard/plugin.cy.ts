/* Copyright 2021, Milkdown by Mirone. */

Cypress.config('baseUrl', `http://localhost:${Cypress.env('SERVER_PORT')}`)

beforeEach(() => {
  cy.visit('/plugin-clipboard/')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

it('paste inline markdown', () => {
  cy.get('.editor').type('The dark side of the ')

  cy.get('.editor').paste({ 'text/plain': '**moon**' })

  cy.get('.editor').get('strong').should('have.text', 'moon')

  cy.get('.editor').get('p').should('have.text', 'The dark side of the moon')
})

it('paste block markdown', () => {
  cy.get('.editor').paste({ 'text/plain': '* Concorde files in my room\n* Tears the house to shreds' })
  cy.get('.editor ul>li:first-child').should('have.text', 'Concorde files in my room')
  cy.get('.editor ul>li:last-child').should('have.text', 'Tears the house to shreds')
})

it('paste code from vscode', () => {
  cy.get('.editor').paste({ 'text/plain': 'const a = 1;', 'vscode-editor-data': JSON.stringify({ mode: 'javascript' }) })
  cy.get('.editor pre').should('have.attr', 'data-language', 'javascript')
  cy.get('.editor pre code').should('have.text', 'const a = 1;')
})

it('past html', () => {
  cy.get('.editor').paste({ 'text/html': '<h1>The Place Where He Inserted the <strong>Blade</strong></h1>' })
  cy.get('.editor h1').should('have.text', 'The Place Where He Inserted the Blade')
  cy.get('.editor strong').should('have.text', 'Blade')
  cy.window().then((win) => {
    cy.wrap(win.__getMarkdown__())
      .should('equal', '# The Place Where He Inserted the **Blade**\n')
  })
})
