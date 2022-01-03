/* Copyright 2021, Milkdown by Mirone. */
/* eslint-disable promise/catch-or-return, promise/no-nesting */

beforeEach(() => {
    cy.visit('/#/preset-commonmark');
});

it('has editor', () => {
    cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true');
});

describe('transform:', () => {
    it('paragraph', () => {
        cy.get('.editor');
        cy.window().then((win) => {
            cy.fixture('paragraph.md').then((md) => {
                win.__setMarkdown__(md);
                return;
            });
            return;
        });

        cy.get('p').should('have.text', 'The lunatic is on the grass');

        cy.window().then((win) => {
            cy.wrap(win.__getMarkdown__()).snapshot();
            return;
        });
    });

    it('heading', () => {
        cy.get('.editor');
        cy.window().then((win) => {
            cy.fixture('heading.md').then((md) => {
                win.__setMarkdown__(md);
                return;
            });
            return;
        });

        cy.get('h1').should('have.text', 'The lunatic is on the grass');
    });

    it('blockquote', () => {
        cy.get('.editor');
        cy.window().then((win) => {
            cy.fixture('blockquote.md').then((md) => {
                win.__setMarkdown__(md);
                return;
            });
            return;
        });

        cy.get('.blockquote').within(() => {
            cy.get('p').should('have.length', 2);
            cy.get('.hardbreak').should('exist');
        });
    });

    it('list', () => {
        cy.get('.editor');
        cy.window().then((win) => {
            cy.fixture('list.md').then((md) => {
                win.__setMarkdown__(md);
                return;
            });
            return;
        });

        cy.get('.editor > .bullet-list').should('have.length', 2);
        cy.get('.editor > .bullet-list')
            .first()
            .within(() => {
                cy.get('.list-item').should('have.length', 4);
                cy.get('.bullet-list > .list-item').should('have.length', 2);
                cy.get('.bullet-list > .list-item:first-child').should(
                    'have.text',
                    'Remembering games and daisy chains and laughs',
                );
            });

        cy.get('.editor > .ordered-list').should('have.length', 1);
        cy.get('.editor > .ordered-list').within(() => {
            cy.get('.list-item').should('have.length', 4);
            cy.get('.ordered-list > .list-item').should('have.length', 2);
            cy.get('.ordered-list > .list-item:first-child').should(
                'have.text',
                'The paper holds their folded faces to the floor',
            );
        });

        cy.get('.editor > .bullet-list')
            .last()
            .within(() => {
                cy.get('.list-item').should('have.length', 8);
                cy.get('.bullet-list').should('have.length', 1);
                cy.get('.ordered-list').should('have.length', 2);
            });
    });

    it('hr', () => {
        cy.get('.editor');
        cy.window().then((win) => {
            cy.fixture('hr.md').then((md) => {
                win.__setMarkdown__(md);
                return;
            });
            return;
        });

        cy.get('.hr').should('be.visible');
    });

    it('code block', () => {
        cy.get('.editor');
        cy.window().then((win) => {
            cy.fixture('code-block.md').then((md) => {
                win.__setMarkdown__(md);
                return;
            });
            return;
        });

        cy.get('.code-fence').should('have.length', 2);
        cy.get('.code-fence:first-child').should('have.attr', 'data-language', 'null');
        cy.get('.code-fence:last-child').should('have.attr', 'data-language', 'javascript');
    });

    it('mark', () => {
        cy.get('.editor');
        cy.window().then((win) => {
            cy.fixture('cm-mark.md').then((md) => {
                win.__setMarkdown__(md);
                return;
            });
            return;
        });

        cy.get('.strong').first().should('have.text', 'The lunatic is on the grass');
        cy.get('.em').first().should('have.text', 'The lunatic is on the grass');
        cy.get('.code-inline').first().should('have.text', 'The lunatic is on the grass');
        cy.get('.link').first().should('have.text', 'The lunatic is on the grass');
        cy.get('.link').first().should('have.attr', 'href', 'link');

        cy.get('.paragraph')
            .eq(4)
            .within(() => {
                cy.get('.strong').should('have.text', 'The lunatic is on the grass');
                cy.get('.em').should('have.text', 'The lunatic is on the grass');
            });

        cy.get('.paragraph')
            .eq(5)
            .within(() => {
                cy.get('.strong').should('have.text', 'The lunatic is on the grass');
                cy.get('.em').should('have.text', 'The lunatic is on the grass');
                cy.get('.code-inline').should('have.text', 'The lunatic is on the grass');
            });

        cy.get('.paragraph')
            .last()
            .within(() => {
                cy.get('.strong').should('have.text', 'The lunatic is on the grass');
                cy.get('.em').should('have.text', 'The lunatic is on the grass');
                cy.get('.link').should('have.text', 'The lunatic is on the grass');
            });

        cy.window().then((win) => {
            cy.wrap(win.__getMarkdown__()).snapshot();
            return;
        });
    });
});
