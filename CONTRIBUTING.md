# Development Workflow

> We use pnpm for development.
> Please make sure you have node.js, npm and pnpm installed on your machine.

After cloning Milkdown, run `pnpm install` to install dependencies.

To get started:

> If you're using vscode, things are much easier.
> You can just press `F5`.

1. Run `pnpm build:cache`.
2. Run `pnpm doc` in one terminal to see doc site.

After that,
you may want to play with any packages,
You can watch them through `pnpm --filter=@milkdown/xxx start`.

For example, `pnpm --filter=@milkdown/core start`.

# Commands

You can run several commands:

-   `pnpm watch` watches all packages except gh-pages.
-   `pnpm clear` remove all build dist.
-   `pnpm test:unit` runs unit test.
-   `pnpm test:it` runs integration test.
-   `pnpm test:lint` checks the code style.
-   `pnpm test:tsc` runs typescript type checks.
-   `pnpm test` runs all possible test.
-   `pnpm doc` runs develop mode for gh-pages package.
-   `pnpm build:packs` runs build for all packages.
-   `pnpm build:cache` runs build for all packages with cache powered by nx.
-   `pnpm build:doc` runs build for gh-pages package.
-   `pnpm commit` runs commit with git hooks.

# Pre Check

Before you create a pull request, please check the following todo:

-   Pre commit hooks passed, please don't ignore it.
-   `pnpm test` passed.
-   `pnpm build:packs` passed.
-   `pnpm build:doc` passed.
-   `pnpm doc:preview` works as you expected.

# License

By contributing to Milkdown, you agree that your contributions will be licensed under its MIT license.
