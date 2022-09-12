/* Copyright 2021, Milkdown by Mirone. */
/* eslint-disable promise/catch-or-return */

beforeEach(() => {
    cy.visit('/#/preset-commonmark');
});

it('has editor', () => {
    cy.get('.milkdown').get('.editor').should('have.attr', 'contenteditable', 'true');
});

describe('input:', () => {
    describe('node:', () => {
        it('paragraph', () => {
            cy.get('.editor').type('The lunatic is on the grass');
            cy.get('.editor').get('.paragraph').should('have.text', 'The lunatic is on the grass');
            cy.window().then((win) => {
                cy.wrap(win.__getMarkdown__()).snapshot();
                return;
            });
        });

        it('heading', () => {
            cy.get('.editor').type('# Heading1');
            cy.get('.editor').get('.h1').should('have.text', '#Heading1');

            cy.get('.editor').type('{enter}');

            cy.get('.editor').type('## Heading2');
            cy.get('.editor').get('.h2').should('have.text', '##Heading2');
            cy.window().then((win) => {
                cy.wrap(win.__getMarkdown__()).snapshot();
                return;
            });
        });

        it('blockquote', () => {
            cy.get('.editor').type('> Blockquote');
            cy.get('.blockquote').get('.paragraph').should('have.text', 'Blockquote');

            cy.get('.editor').type('{enter}Next line.');

            cy.get('.blockquote').get('.paragraph:last-child').should('have.text', 'Next line.');
            cy.window().then((win) => {
                cy.wrap(win.__getMarkdown__()).snapshot();
                return;
            });
        });

        it('bullet list', () => {
            cy.get('.editor').type('* list item 1');
            cy.get('.bullet-list>.list-item>.list-item_body').should('have.text', 'list item 1');

            cy.get('.editor').type('{enter}list item 2');
            cy.get('.bullet-list>.list-item:last-child>.list-item_body').should('have.text', 'list item 2');

            cy.get('.editor').type('{enter}{backspace}* sub list item 1');
            cy.get('.bullet-list .bullet-list>.list-item>.list-item_body').should('have.text', 'sub list item 1');

            cy.get('.editor').type('{enter}sub list item 2');
            cy.get('.bullet-list .bullet-list>.list-item:last-child>.list-item_body').should(
                'have.text',
                'sub list item 2',
            );

            cy.get('.editor').type('{enter}{enter}list item 3');
            cy.get('.bullet-list:first-child>.list-item:last-child>.list-item_body').should('have.text', 'list item 3');
            cy.window().then((win) => {
                cy.wrap(win.__getMarkdown__()).snapshot();
                return;
            });
        });

        it('ordered list', () => {
            cy.get('.editor').type('1. list item 1');
            cy.get('.ordered-list>.list-item>.list-item_body').should('have.text', 'list item 1');

            cy.get('.editor').type('{enter}list item 2');
            cy.get('.ordered-list>.list-item:last-child>.list-item_body').should('have.text', 'list item 2');

            cy.get('.editor').type('{enter}{backspace}1. sub list item 1');
            cy.get('.ordered-list .ordered-list>.list-item>.list-item_body').should('have.text', 'sub list item 1');

            cy.get('.editor').type('{enter}sub list item 2');
            cy.get('.ordered-list .ordered-list>.list-item:last-child>.list-item_body').should(
                'have.text',
                'sub list item 2',
            );
            cy.get('.editor').type('{enter}{enter}list item 3');
            cy.get('.ordered-list:first-child>.list-item:last-child>.list-item_body').should(
                'have.text',
                'list item 3',
            );
            cy.window().then((win) => {
                cy.wrap(win.__getMarkdown__()).snapshot();
                return;
            });
        });

        it('hr', () => {
            cy.get('.editor').type('---');
            cy.get('.hr').should('be.visible');
            cy.window().then((win) => {
                cy.wrap(win.__getMarkdown__()).snapshot();
                return;
            });
        });

        it('code block', () => {
            cy.get('.editor').type('```markdown{enter}');
            cy.get('.code-fence').should('have.attr', 'data-language', 'markdown');
            cy.get('.editor').type('# Hi markdown');
            cy.get('code > div').should('have.text', '# Hi markdown');
        });

        describe('image', () => {
            it('invalid image', () => {
                cy.get('.editor').type('![image](invalidUrl)');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });

            it('valid image', () => {
                cy.intercept('*.png', {
                    delay: 1000,
                    fixture: 'milkdown-mini.png',
                });
                cy.get('.editor').type('![image](/milkdown-mini.png)');
                cy.get('.image-container').within(() => {
                    cy.get('img').should('have.attr', 'src', '/milkdown-mini.png');
                });
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });
        });
    });

    describe('mark:', () => {
        describe('bold', () => {
            it('normal bold', () => {
                cy.get('.editor').type('The lunatic is **on the grass**');
                cy.get('.editor').get('.strong').should('have.text', 'on the grass');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });

            it('not a bold', () => {
                cy.get('.editor').type('The lunatic is o**"n the grass**');
                cy.get('.editor').get('.paragraph').should('have.text', 'The lunatic is o**"n the grass**');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });

            it('is a bold', () => {
                cy.get('.editor').type('The lunatic is "**on the grass**"');
                cy.get('.editor').get('.strong').should('have.text', 'on the grass');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });

            it('a single word', () => {
                cy.get('.editor').type('The lunatic is **o**n the grass');
                cy.get('.editor').get('.strong').should('have.text', 'o');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });
        });

        describe('italic', () => {
            it('normal italic', () => {
                cy.get('.editor').type('The lunatic is _on the grass_');
                cy.get('.editor').get('.em').should('have.text', 'on the grass');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });

            it('not an italic', () => {
                cy.get('.editor').type('The lunatic is o*"n the grass*');
                cy.get('.editor').get('.paragraph').should('have.text', 'The lunatic is o*"n the grass*');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });

            it('is an italic', () => {
                cy.get('.editor').type('The lunatic is "_on the grass_"');
                cy.get('.editor').get('.em').should('have.text', 'on the grass');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });

            it('a single word', () => {
                cy.get('.editor').type('The lunatic is _o_n the grass');
                cy.get('.editor').get('.em').should('have.text', 'o');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });
        });

        describe('inline code', () => {
            it('normal inline code', () => {
                cy.get('.editor').type('The lunatic is `on the grass`');
                cy.get('.editor').get('.code-inline').should('have.text', 'on the grass');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });

            it('inline code with * and _', () => {
                cy.get('.editor').type('The lunatic is `****`');
                cy.get('.editor').type('{leftArrow}').type('{leftArrow}').type('_on the grass_');
                cy.get('.editor').get('.code-inline').should('have.text', '**_on the grass_**');
                cy.window().then((win) => {
                    cy.wrap(win.__getMarkdown__()).snapshot();
                    return;
                });
            });
        });

        it('link', () => {
            cy.get('.editor').type('The lunatic is [on the grass](url)');
            cy.get('.editor').get('.link').should('have.text', 'on the grass').and('have.attr', 'href', 'url');
            cy.window().then((win) => {
                cy.wrap(win.__getMarkdown__()).snapshot();
                return;
            });
        });
    });
});
