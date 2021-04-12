# Development Workflow

> We use yarn@2 for development.
> Please make sure you have node.js, npm and yarn installed on your machine.

After cloning Milkdown, run `yarn` to install dependencies. Then, you can run several commands:

-   `yarn watch` watches all packages except gh-pages.
-   `yarn lint` checks the code style.
-   `yarn tsc` runs typescript type checks.
-   `yarn build` runs build for all packages.
-   `yarn preview` runs preview for gh-pages.
-   `yarn integration` runs develop mode for gh-pages package.
-   `yarn workspace @milkdown/<package-name> run <command>` run command for a particular package.

The easiest way to get started is to run `yarn watch` in one command line and `yarn integration` in another.
Then you can make some modify you want to see the change.

# Pre Check

Before you create a pull request, please check the following todo:

-   `yarn lint` passed.
-   `yarn tsc` passed.
-   `yarn build` passed.
-   `yarn preview` works as you expected.

# License

By contributing to Milkdown, you agree that your contributions will be licensed under its MIT license.
