---
'@milkdown/crepe': minor
---

Add `useAIProviderConfig`, `useAIInstructionTooltipAPI` and `defaultAIIcon` to `@milkdown/crepe/feature/ai`, so a host rendering its own toolbar can gate an AI button on a configured provider, open the instruction palette, and match the built-in icon. The helpers resolve their ctx slice by name (like `useCrepe`), so they keep working across the package's separately-bundled entries.
