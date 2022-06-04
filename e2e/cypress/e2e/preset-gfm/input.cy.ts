/* Copyright 2021, Milkdown by Mirone. */
/* eslint-disable promise/catch-or-return */

beforeEach(() => {
    cy.visit('/#/preset-gfm');
});

it('has editor', () => {
    cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true');
});

describe('input:', () => {
    it('task list', () => {
        cy.get('.editor').type('[ ] list item 1');
        cy.get('.bullet-list').within(() => cy.get('.task-list-item p').should('have.text', 'list item 1'));

        cy.get('.editor').type('{enter}list item 2');
        cy.get('.bullet-list').within(() => cy.get('.task-list-item:last-child p').should('have.text', 'list item 2'));

        cy.get('.editor').type('{enter}{backspace}[ ] sub list item 1');
        cy.get('.bullet-list').within(() =>
            cy.get('.bullet-list').within(() => cy.get('.task-list-item p').should('have.text', 'sub list item 1')),
        );

        cy.get('.editor').type('{enter}sub list item 2');
        cy.get('.bullet-list').within(() =>
            cy
                .get('.bullet-list')
                .within(() => cy.get('.task-list-item:last-child p').should('have.text', 'sub list item 2')),
        );

        cy.get('.editor').type('{enter}{enter}list item 3');
        cy.get('.bullet-list')
            .first()
            .within(() => cy.get('.task-list-item:last-of-type p:last').should('have.text', 'list item 3'));

        cy.window().then((win) => {
            cy.wrap(win.__getMarkdown__()).snapshot();
            return;
        });
    });

    it('strike through', () => {
        cy.get('.editor').type('The lunatic is ~~on the grass~~');
        cy.get('.editor').get('.strike-through').should('have.text', 'on the grass');
    });

    it('auto link', () => {
        cy.get('.editor').type('Here is https://www.milkdown.dev');
        cy.get('.editor').get('.link').should('have.text', 'https://www.milkdown.dev');
        cy.get('.editor').get('.link').should('have.attr', 'href', 'https://www.milkdown.dev');
    });
});
