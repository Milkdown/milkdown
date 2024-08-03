beforeEach(() => {
  cy.visit('/preset-commonmark/')
})

it('has editor', () => {
  cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true')
})

describe('input:', () => {
  const isMac = Cypress.platform === 'darwin'
  describe('system:', () => {
    it('enter', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type('{enter}')
      cy.get('.editor').type('The lunatic is in the hell')
      cy.get('p').should('have.length', 2)
    })

    it('hardbreak', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type('{shift+enter}')
      cy.get('.editor').type('The lunatic is in the hell')
      cy.get('hr').should('not.be.undefined').and('not.be.null')
      cy.get('p').should('have.length', 1)
    })

    it('delete', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type('{backspace}')
      cy.get('p').should('have.text', 'The lunatic is on the gras')
      cy.get('.editor').type('{backspace}')
      cy.get('p').should('have.text', 'The lunatic is on the gra')
    })

    it('select all', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type(isMac ? '{cmd+a}' : '{ctrl+a}')
      cy.get('.editor').type('Lunatic')
      cy.get('p').should('have.text', 'Lunatic')
    })
  })

  describe('node:', () => {
    it('heading', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+1}`)
      cy.get('h1').should('have.text', 'The lunatic is on the grass')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+2}`)
      cy.get('h2').should('have.text', 'The lunatic is on the grass')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+3}`)
      cy.get('h3').should('have.text', 'The lunatic is on the grass')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+0}`)
      cy.get('p').should('have.text', 'The lunatic is on the grass')
    })

    it('list', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+7}`)
      cy.get('.editor ol>li').should('have.text', 'The lunatic is on the grass')
      cy.get('.editor').type('{enter}')
      cy.get('.editor').type('The lunatic is in the hell')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+]}`)
      cy.get('.editor ol').should('have.length', 2)
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+[}`)
      cy.get('.editor ol').should('have.length', 1)

      cy.get('.editor').type('{enter}{backspace}')
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+8}`)
      cy.get('.editor ul>li').should('have.text', 'The lunatic is on the grass')
      cy.get('.editor').type('{enter}')
      cy.get('.editor').type('The lunatic is in the hell')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+]}`)
      cy.get('.editor ul').should('have.length', 2)
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+[}`)
      cy.get('.editor ul').should('have.length', 1)
      cy.window().then((win) => {
        cy.wrap(win.__getMarkdown__())
          .should('equal', '1. The lunatic is on the grass\n2. The lunatic is in the hell\n\n   * The lunatic is on the grass\n   * The lunatic is in the hell\n')
      })
    })

    it('code block', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+c}`)
      cy.get('pre > code').should('have.text', 'The lunatic is on the grass')
    })
  })

  describe('mark:', () => {
    describe('bold', () => {
      it('standard bold', () => {
        cy.get('.editor').type('The lunatic is on the grass')
        cy.get('.editor').type('{selectAll}')
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('strong').should('have.text', 'The lunatic is on the grass')
        cy.get('.editor').type('{selectAll}')
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('strong').should('not.exist')
      })

      it('end with space', () => {
        cy.get('.editor').type('The lunatic ')
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(`on the `)
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(' grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic **on the**  grass\n')
        })
      })

      it('end with spaces', () => {
        cy.get('.editor').type('The lunatic ')
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(`on the    `)
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(' grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic **on the**     grass\n')
        })
      })

      it('start with space', () => {
        cy.get('.editor').type('The lunatic ')
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(` is on the`)
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(' grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic  **is on the** grass\n')
        })
      })

      it('start with spaces', () => {
        cy.get('.editor').type('The lunatic ')
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(`    is on the`)
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(' grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic     **is on the** grass\n')
        })
      })

      it('start and end with spaces', () => {
        cy.get('.editor').type('The lunatic ')
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(`    is on the    `)
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`)
        cy.get('.editor').type(' grass')
        cy.window().then((win) => {
          cy.wrap(win.__getMarkdown__())
            .should('equal', 'The lunatic     **is on the**     grass\n')
        })
      })
    })

    it('italic', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type('{selectAll}')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+i}`)
      cy.get('em').should('have.text', 'The lunatic is on the grass')
      cy.get('.editor').type('{selectAll}')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+i}`)
      cy.get('em').should('not.exist')
    })

    it('inline code', () => {
      cy.get('.editor').type('The lunatic is on the grass')
      cy.get('.editor').type('{selectAll}')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+e}`)
      cy.get('code').should('have.text', 'The lunatic is on the grass')
      cy.get('.editor').type('{selectAll}')
      cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+e}`)
      cy.get('code').should('not.exist')
    })
  })
})
