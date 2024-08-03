beforeEach(() => {
  cy.visit('/preset-commonmark/')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('toggle strong', () => {
  it('toggle strong for paragraph', () => {
    cy.get('.milkdown').get('.editor')
    cy.window().then((win) => {
      cy.fixture('paragraph.md').then((md) => {
        win.__setMarkdown__(md)
      })
    })
    cy.get('.editor').type('{selectAll}')
    cy.window().then((win) => {
      win.commands.toggleStrong?.()
    })
    cy.get('.editor strong').should('have.text', 'The lunatic is on the grass')
  })

  it('toggle strong in a page', () => {
    cy.get('.editor').type('Concorde flies in my room')
    cy.get('.editor').type('{enter}')
    cy.get('.editor').type('Tears the house to shreds')

    cy.window().then((win) => {
      const document = win.document
      const el = document.querySelector('.editor p:first-child')
      if (!el)
        throw new Error('no paragraph')

      const range = document.createRange()
      range.selectNodeContents(el)
      document.getSelection()?.removeAllRanges()
      document.getSelection()?.addRange(range)

      win.requestAnimationFrame(() => {
        win.commands.toggleStrong?.()
      })
    })

    cy.get('.editor strong').should('have.text', 'Concorde flies in my room')
  })
})
