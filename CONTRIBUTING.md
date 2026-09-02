# Development Workflow

> We use [corepack with pnpm](https://pnpm.io/installation#using-corepack) for development.
> Please make sure you have node.js, npm installed and corepack enabled.

After cloning Milkdown, run `pnpm install` to install dependencies.

1. Run `pnpm build`.
2. Run `pnpm start` in one terminal to see storybook.

# Commands

You can run several commands:

- `pnpm clear` remove all build dist.
- `pnpm test:unit` runs unit test.
- `pnpm test:e2e` runs e2e test.
- `pnpm test:e2e:debug` runs e2e test with UI.
- `pnpm test:lint` checks the code style.
- `pnpm test:tsc` runs typescript type checks.
- `pnpm build` runs build for all packages.
- `pnpm commit` runs commit with git hooks.

# Comments

A comment must earn its place. Follow these rules:

- Write a comment only for what the code cannot show: a constraint, an invariant, a reason, an upstream or browser bug, a non-obvious order of operations.
- Do not narrate the next line. Do not restate a name that the code already carries.
- Do not record process history, for example "previously" or "per review feedback". Git history owns that. A regression test may state the bug it pins, in one sentence.
- Write one concrete action in a `TODO`. Add the issue number when one exists: `TODO(#2463)`.
- `///` is the public API reference. `builddocs` publishes it into `docs/api`. Keep every fact in it accurate.

Write every comment in plain English, in the style of [ASD-STE100](https://www.asd-ste100.org/):

- Give one idea to one sentence. Keep a sentence to 25 words or fewer.
- Use the active voice and the present tense. Use the imperative for an instruction.
- Do not use an em dash. Use a period, a colon, or a comma.
- Do not use the first person: "we", "our", "let's".
- Use a list when a sentence carries more than three items.
- Wrap at 80 columns, to match `printWidth` in `.oxfmtrc.json`.

# Pre Check

Before you create a pull request, please check the following todo:

- Pre commit hooks passed, please don't ignore it.
- `pnpm test` passed.

# License

By contributing to Milkdown, you agree that your contributions will be licensed under its MIT license.
