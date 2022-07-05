/* Copyright 2021, Milkdown by Mirone. */
/* eslint-disable promise/catch-or-return */

beforeEach(() => {
    cy.visit('/#/preset-commonmark');
});

it('has editor', () => {
    cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true');
});

describe('input:', () => {
    const isMac = Cypress.platform === 'darwin';
    describe('system:', () => {
        it('enter', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type('{enter}');
            cy.get('.editor').type('The lunatic is in the hell');
            cy.get('.paragraph').should('have.length', 2);
        });

        it('hardbreak', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type('{shift+enter}');
            cy.get('.editor').type('The lunatic is in the hell');
            cy.get('.hardbreak').should('not.be.undefined').and('not.be.null');
            cy.get('.paragraph').should('have.length', 1);
        });

        it('delete', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type('{backspace}');
            cy.get('.paragraph').should('have.text', 'The lunatic is on the gras');
            cy.get('.editor').type('{backspace}');
            cy.get('.paragraph').should('have.text', 'The lunatic is on the gra');
        });

        it('select all', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type(isMac ? '{cmd+a}' : '{ctrl+a}');
            cy.get('.editor').type('Lunatic');
            cy.get('.paragraph').should('have.text', 'Lunatic');
        });

        // Copy and Paste cannot work in cypress due to: https://github.com/cypress-io/cypress/issues/2752
        it.skip('copy and paste', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type('{ctrl+a}');
            cy.get('.editor').type('{ctrl+c}');
            cy.get('.paragraph').should('have.text', 'The lunatic is on the grass');
            cy.get('.editor').type('{rightarrow}');
            cy.get('.editor').type('.');
            cy.get('.editor').type('{enter}QAQ');
            cy.get('.editor').type('{ctrl+v}');
            cy.get('.paragraph').should('have.length', 2);
            cy.get('.paragraph:first-of-type').should('have.text', 'The lunatic is on the grass.');
        });
    });

    describe('node:', () => {
        it('heading', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+1}`);
            cy.get('h1').should('have.text', '#The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+2}`);
            cy.get('h2').should('have.text', '##The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+3}`);
            cy.get('h3').should('have.text', '###The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+0}`);
            cy.get('p').should('have.text', 'The lunatic is on the grass');
        });

        it('list', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+7}`);
            cy.get('.ordered-list').within(() =>
                cy.get('.list-item').should('have.text', 'The lunatic is on the grass'),
            );
            cy.get('.editor').type('{enter}');
            cy.get('.editor').type('The lunatic is in the hell');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+]}`);
            cy.get('.ordered-list').should('have.length', 2);
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+[}`);
            cy.get('.ordered-list').should('have.length', 1);

            cy.get('.editor').type('{enter}{backspace}');
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+8}`);
            cy.get('.bullet-list').within(() =>
                cy.get('.list-item').should('have.text', 'The lunatic is on the grass'),
            );
            cy.get('.editor').type('{enter}');
            cy.get('.editor').type('The lunatic is in the hell');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+]}`);
            cy.get('.bullet-list').should('have.length', 2);
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+[}`);
            cy.get('.bullet-list').should('have.length', 1);
            cy.window().then((win) => {
                cy.wrap(win.__getMarkdown__()).snapshot();
                return;
            });
        });

        it('code block', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+c}`);
            cy.get('.code-fence code > div').should('have.text', 'The lunatic is on the grass');
        });
    });

    describe('mark:', () => {
        it('bold', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+a}`);
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`);
            cy.get('.strong').should('have.text', 'The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`);
            cy.get('.strong').should('not.exist');
            cy.get('.editor').type('{backspace}');
            cy.get('.editor').type('The lunatic is ');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+b}`);
            cy.get('.editor').type('on the grass');
            cy.get('.strong').should('have.text', 'on the grass');
        });

        it('italic', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+a}`);
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+i}`);
            cy.get('.em').should('have.text', 'The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+i}`);
            cy.get('.em').should('not.exist');
            cy.get('.editor').type('{backspace}');
            cy.get('.editor').type('The lunatic is ');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+i}`);
            cy.get('.editor').type('on the grass');
            cy.get('.em').should('have.text', 'on the grass');
        });

        it('inline code', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+a}`);
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+e}`);
            cy.get('.code-inline').should('have.text', 'The lunatic is on the grass');
            cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+e}`);
            cy.get('.code-inline').should('not.exist');
        });
    });
});
