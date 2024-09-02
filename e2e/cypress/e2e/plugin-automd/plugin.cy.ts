Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'log').as('log')
})

beforeEach(() => {
  cy.visit('/plugin-automd/')
})

describe('keep mark symbol', () => {
  it('strong with _', () => {
    cy.get('.editor').type('The lunatic is __on the grass__')
    cy.get('.editor strong').should('have.text', 'on the grass')
    cy.isMarkdown('The lunatic is __on the grass__\n')
  })

  it('strong with *', () => {
    cy.get('.editor').type('The lunatic is **on the grass**')
    cy.get('.editor strong').should('have.text', 'on the grass')
    cy.isMarkdown('The lunatic is **on the grass**\n')
  })

  it('not a bold', () => {
    cy.get('.editor').type('The lunatic is o__"n the grass__')
    cy.get('.editor').get('p').should('have.text', 'The lunatic is o__"n the grass__')
    cy.isMarkdown('The lunatic is o\\_\\_"n the grass\\_\\_\n')
  })

  it('escape _', () => {
    cy.get('.editor').type('The lunatic is \\_\\_on the grass__')
    cy.get('.editor').get('em').should('not.exist')
    cy.get('.editor').should('contain.text', '_\u200B_on the grass__')
  })

  it('italic with _', () => {
    cy.get('.editor').type('The lunatic is "_on the grass_"')
    cy.get('.editor').get('em').should('have.text', 'on the grass')
    cy.isMarkdown('The lunatic is "_on the grass_"\n')
  })

  it('not an italic', () => {
    cy.get('.editor').type('The lunatic is o*"n the grass*')
    cy.get('.editor').get('p').should('have.text', 'The lunatic is o*"n the grass*')
    cy.isMarkdown('The lunatic is o\\*"n the grass\\*\n')
  })

  it('italic with *', () => {
    cy.get('.editor').type('The lunatic is "*on the grass*"')
    cy.get('.editor').get('em').should('have.text', 'on the grass')
    cy.isMarkdown('The lunatic is "*on the grass*"\n')
  })

  it('escape _ in italic', () => {
    cy.get('.editor').type('The lunatic is \\_on the grass_')
    cy.get('.editor').get('em').should('not.exist')
    cy.get('.editor').should('contain.text', '_on the grass_')
  })

  it('escape * in italic', () => {
    cy.get('.editor').type('The lunatic is \\*on the grass*')
    cy.get('.editor').get('em').should('not.exist')
    cy.get('.editor').should('contain.text', '*on the grass*')
  })

  it('escape _ in bold', () => {
    cy.get('.editor').type('The lunatic is \\_\\_on the grass__')
    cy.get('.editor').get('em').should('not.exist')
    cy.get('.editor').should('contain.text', '_\u200B_on the grass__')
  })

  it('escape * in bold', () => {
    cy.get('.editor').type('The lunatic is \\*\\*on the grass**')
    cy.get('.editor').get('em').should('not.exist')
    cy.get('.editor').should('contain.text', '*\u200B*on the grass**')
  })

  it('link', () => {
    cy.get('.editor').type('The lunatic is [on the grass](url)')
    cy.get('.editor a').should('have.text', 'on the grass').and('have.attr', 'href', 'url')
    cy.isMarkdown('The lunatic is [on the grass](url)\n')
  })

  it('inline code with * and _', () => {
    cy.get('.editor').type('The lunatic is `__`')
    cy.get('.editor').type('{leftArrow}').type('**on the grass**')
    cy.get('.editor').get('code').should('have.text', '_**on the grass**_')
    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__())
        .should('equal', 'The lunatic is `_**on the grass**_`\n')
    })
  })
})

describe('image', () => {
  it('invalid image', () => {
    cy.get('.editor').type('![image](invalidUrl)')
    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__())
        .should('equal', '![image](invalidUrl)\n')
    })
  })

  it('valid image', () => {
    cy.intercept('*.png', {
      delay: 1000,
      fixture: 'milkdown-mini.png',
    })
    cy.get('.editor').type('![image](/milkdown-mini.png)')
    cy.get('img').should('have.attr', 'src', '/milkdown-mini.png')
    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__())
        .should('equal', '![image](/milkdown-mini.png)\n')
    })
  })
})

it('auto link', () => {
  cy.get('.editor').type('Here is https://www.milkdown.dev')
  cy.get('.editor a').should('have.text', 'https://www.milkdown.dev')
  cy.get('.editor a').should('have.attr', 'href', 'https://www.milkdown.dev')
})

it('with plugin clipboard', () => {
  cy.get('.editor').type('*')
  cy.get('@log').should('have.callCount', 1).should('be.calledWith', '\\*\n')
  cy.get('.editor').type('A')
  cy.get('@log').should('have.callCount', 2).should('be.calledWith', '\\*A\n')
  cy.get('.editor').type('*')
  cy.get('@log').should('have.callCount', 4).should('be.calledWith', '*A*\n')
  cy.get('.editor').type(' _A_')
  cy.get('@log').should('be.calledWith', '*A* _A_\n')
})

describe('with inline math', () => {
  it('basic input', () => {
    cy.get('.editor').type('$E = MC^2$')

    cy.get('.editor').get('span[data-type="math_inline"]').should('have.attr', 'data-value', 'E = MC^2')
    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__())
        .should('equal', '$E = MC^2$\n')
    })
  })

  it('input with _', () => {
    cy.get('.editor').type('$F\'_3(dz-du)F\'_2$')
    cy.get('.editor').get('span[data-type="math_inline"]').should('have.attr', 'data-value', 'F\'_3(dz-du)F\'_2')
    cy.window().then((win) => {
      cy.wrap(win.__getMarkdown__())
        .should('equal', '$F\'_3(dz-du)F\'_2$\n')
    })
  })
})
