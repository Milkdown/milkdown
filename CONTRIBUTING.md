# Development Workflow

> We use pnpm for development.
> Please make sure you have node.js, npm and pnpm installed on your machine.

After cloning Milkdown, run `pnpm install` to install dependencies. Then, you can run several commands:

-   `pnpm watch` watches all packages except gh-pages.
-   `pnpm lint` checks the code style.
-   `pnpm tsc` runs typescript type checks.
-   `pnpm preview` runs preview for gh-pages.
-   `pnpm integration` runs develop mode for gh-pages package.
-   `pnpm build:packs` runs build for all packages.
-   `pnpm build:integration` runs build for gh-pages package.

The easiest way to get started is to run `pnpm watch` in one command line and `pnpm integration` in another.
Then you can make some modify you want to see the change.

# Pre Check

Before you create a pull request, please check the following todo:

-   `pnpm lint` passed.
-   `pnpm tsc` passed.
-   `pnpm build:packs` passed.
-   `pnpm build:integration` passed.
-   `pnpm test` passed.
-   `pnpm preview` works as you expected.

# License

By contributing to Milkdown, you agree that your contributions will be licensed under its MIT license.
