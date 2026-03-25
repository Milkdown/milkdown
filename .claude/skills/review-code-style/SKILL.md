---
name: review-code-style
description: Review all changed or newly added code in this repository for code style and quality issues. Check both staged and unstaged changes.
---

Review all changed or newly added code in this repository for code style and quality issues. Check both staged and unstaged changes.

## Rules

### Naming & Structure

- **Meaningful, consistent names** — same concept = same name throughout. Variable names should be pronounceable and searchable.
- **Single Responsibility** — each module/function has one reason to change.
- **Depend on abstractions** — use DI tags and interfaces, not concrete implementations directly.

### Code Quality

- **No duplicated code** — similar code in multiple locations with the same calling context should be extracted.
- **Avoid deep nesting** — max 3 levels of conditional nesting. Refactor with early returns or extraction.
- **Short parameter lists** — more than 3-4 parameters suggests the need for an options object or restructuring.
- **Self-documenting code** — comment only what the code cannot express through naming and structure. Remove comments that repeat what the code already says.

### Cleanup

- **No dead code** — remove unused variables, functions, imports, and commented-out code blocks.
- **Fix typos** — in variable names, comments, and strings.

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
