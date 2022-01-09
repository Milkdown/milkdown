# Development Workflow

> We use pnpm for development.
> Please make sure you have node.js, npm and pnpm installed on your machine.

After cloning Milkdown, run `pnpm install` to install dependencies. Then, you can run several commands:

-   `pnpm watch` watches all packages except gh-pages.
-   `pnpm clear` remove all build dist.
-   `pnpm test:unit` runs unit test.
-   `pnpm test:it` runs integration test.
-   `pnpm test:lint` checks the code style.
-   `pnpm test:tsc` runs typescript type checks.
-   `pnpm test` runs all possible test.
-   `pnpm doc` runs develop mode for gh-pages package.
-   `pnpm build:packs` runs build for all packages.
-   `pnpm build:doc` runs build for gh-pages package.
-   `pnpm commit` runs commit with git hooks.

The easiest way to get started is to run `pnpm watch` in one command line and `pnpm doc` in another.
Then you can make some modify you want to see the change.

# Pre Check

Before you create a pull request, please check the following todo:

-   Pre commit hooks passed, please don't ignore it.
-   `pnpm test` passed.
-   `pnpm build:packs` passed.
-   `pnpm build:doc` passed.
-   `pnpm doc:preview` works as you expected.

# License

By contributing to Milkdown, you agree that your contributions will be licensed under its MIT license.
