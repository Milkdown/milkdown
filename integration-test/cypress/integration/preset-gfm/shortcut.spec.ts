/* Copyright 2021, Milkdown by Mirone. */
/* eslint-disable promise/catch-or-return */

beforeEach(() => {
    cy.visit('/#/preset-gfm');
});

it('has editor', () => {
    cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true');
});

describe('shortcut:', () => {
    const isMac = Cypress.platform === 'darwin';
    it('task list', () => {
        cy.get('.editor').type('The lunatic is on the grass');
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+9}`);
        cy.get('.bullet-list').within(() =>
            cy.get('.task-list-item p').should('have.text', 'The lunatic is on the grass'),
        );
    });

    it('strike through', () => {
        cy.get('.editor').type('The lunatic is on the grass');
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+a}`);
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+x}`);
        cy.get('.strike-through').should('have.text', 'The lunatic is on the grass');
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+x}`);
        cy.get('.strike-through').should('not.exist');
        cy.get('.editor').type('{backspace}');
        cy.get('.editor').type('The lunatic is ');
        cy.get('.editor').type(`{${isMac ? 'cmd' : 'ctrl'}+alt+x}`);
        cy.get('.editor').type('on the grass');
        cy.get('.strike-through').should('have.text', 'on the grass');
    });
});
