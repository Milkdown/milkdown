# Development Workflow

> We use pnpm for development.
> Please make sure you have node.js, npm and pnpm installed on your machine.

After cloning Milkdown, run `pnpm install` to install dependencies.

1. Run `pnpm build:cache`.
2. Run `pnpm start:e2e` in one terminal to see test website.

After that,
you may want to play with any packages,
You can watch them through `pnpm --filter=@milkdown/xxx start`.

For example, `pnpm --filter=@milkdown/core start`.

# Commands

You can run several commands:

-   `pnpm watch` watches all packages except website.
-   `pnpm clear` remove all build dist.
-   `pnpm test:unit` runs unit test.
-   `pnpm test:e2e` runs e2e test.
-   `pnpm test:lint` checks the code style.
-   `pnpm test:tsc` runs typescript type checks.
-   `pnpm test` runs all possible test.
-   `pnpm build:packs` runs build for all packages.
-   `pnpm build:cache` runs build for all packages with cache powered by nx.
-   `pnpm commit` runs commit with git hooks.

# Pre Check

Before you create a pull request, please check the following todo:

-   Pre commit hooks passed, please don't ignore it.
-   `pnpm test` passed.

# License

By contributing to Milkdown, you agree that your contributions will be licensed under its MIT license.
