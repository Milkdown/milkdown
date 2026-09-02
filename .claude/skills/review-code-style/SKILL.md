---
name: review-code-style
description: Review all changed or newly added code in this repository for code style and quality issues. Check both staged and unstaged changes.
---

Review all changed or newly added code in this repository for code style and quality issues. Check both staged and unstaged changes.

## Rules

### Naming & Structure

- **Meaningful, consistent names**. Use the same name for the same concept everywhere. Make a variable name pronounceable and searchable.
- **Single Responsibility**. Give each module and function one reason to change.
- **Depend on abstractions**. Use DI tags and interfaces, not concrete implementations.

### Code Quality

- **No duplicated code**. Extract similar code that runs in the same calling context.
- **Avoid deep nesting**. Keep conditional nesting to three levels. Refactor with an early return or an extraction.
- **Short parameter lists**. More than three or four parameters asks for an options object.
- **Self-documenting code**. Express intent through a name or a structure before you write a comment.

### Comments

When a comment may exist:

- Write a comment only for what the code cannot show: a constraint, an invariant, a reason, an upstream or browser bug, a non-obvious order of operations.
- Do not narrate the next line. Do not restate a name that the code already carries.
- Do not record process history, for example "previously" or "per review feedback". Git history owns that. A regression test may state the bug it pins, in one sentence.
- Write one concrete action in a `TODO`. Add the issue number when one exists: `TODO(#2463)`.
- `///` is the public API reference. `builddocs` publishes it into `docs/api`. Keep every fact in it accurate.

How a comment reads (adapted from ASD-STE100, Simplified Technical English):

- Give one idea to one sentence. Keep a sentence to 25 words or fewer.
- Use the active voice and the present tense. Use the imperative for an instruction.
- Do not use an em dash. Use a period, a colon, or a comma.
- Do not use the first person: "we", "our", "let's".
- Use parentheses only for a reference or an example. Move a condition into its own sentence.
- Use a list when a sentence carries more than three items.
- Use one word for one meaning. Do not switch synonyms for the same concept.
- Wrap at 80 columns, to match `printWidth` in `.oxfmtrc.json`.
- Write in English only.

### Cleanup

- **No dead code**. Remove an unused variable, function, or import. Remove a commented-out code block.
- **Fix typos** in a name, a comment, and a string.

### SOLID Principles

- Single Responsibility: One responsibility to one actor
- Open/Closed: Open for extension, closed for modification
- Liskov Substitution: Subtypes must be substitutable
- Interface Segregation: No forced implementation of unused methods
- Dependency Inversion: Depend on abstractions, not concretions

### Design Patterns (GoF)

- Creational Patterns: Factory, Abstract Factory, Builder, Prototype, Singleton
- Structural Patterns: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy
- Behavioral Patterns: Observer, Strategy, Command, State, Template Method, Chain of Responsibility

## Output Format

For each issue found, output:

- **File**: path and line number
- **Rule**: which rule is violated
- **Problem**: what the code does wrong
- **Fix**: how to correct it

If no issues are found, confirm the code is clean.
