---
name: review-code-style
description: Review all changed or newly added code in this repository for code style and quality issues. Check both staged and unstaged changes.
---

Review all changed or newly added code in this repository for code style and quality issues. Check both staged and unstaged changes. Skip issues already covered by `/review-effect` (Effect-TS specific anti-patterns).

## Rules

Apply all rules from the **"Code Style Rules"** section in `/CLAUDE.md`, plus the extended checklist below:

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
