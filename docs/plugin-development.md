# Crepe Plugin Development Guide

This guide shows how to create custom plugins for the Crepe editor to extend both the toolbar and slash menu functionality. The examples below are based on the working implementations in `./dev` directory.

## Quick Start

### Vanilla JavaScript / TypeScript

```typescript
import { CrepeBuilder } from '@milkdown/crepe/builder'
import { toolbar, blockEdit } from '@milkdown/crepe'

const builder = new CrepeBuilder({ root: '#editor' })

// Add custom toolbar items
builder.addFeature(toolbar, {
  customItems: [
    {
      key: 'highlight',
      icon: '🎨',
      tooltip: 'Highlight text',
      onClick: (ctx) => {
        // Your custom logic
      },
      isActive: (ctx, selection) => false,
      isDisabled: (ctx, selection) => selection.empty,
    },
  ],
})

// Add custom slash menu items
builder.addFeature(blockEdit, {
  buildMenu: (builder) => {
    builder.addGroup('custom', 'My Plugins').addItem('widget', {
      label: 'Custom Widget',
      icon: '⭐',
      onRun: (ctx) => {
        // Your custom logic
      },
    })
  },
})

const editor = builder.create()
```

### React Integration

```tsx
import React from 'react'
import { Crepe, toolbar, blockEdit } from '@milkdown/crepe'
import {
  Milkdown,
  MilkdownProvider,
  useEditor,
} from '@milkdown/integrations/react'

const CrepeEditor = () => {
  useEditor((root) => {
    const crepe = new Crepe({ root })
    crepe
      .addFeature(toolbar, {
        customItems: [
          /* your toolbar items */
        ],
      })
      .addFeature(blockEdit, {
        buildMenu: (builder) => {
          // your menu customization
        },
      })
    return crepe
  })
  return <Milkdown />
}

export const App = () => (
  <MilkdownProvider>
    <CrepeEditor />
  </MilkdownProvider>
)
```

## Plugin Utilities

Crepe provides helpful utility functions to simplify common plugin patterns. These utilities reduce boilerplate code and ensure consistent behavior across plugins.

### ToolbarItemPresets

The `ToolbarItemPresets` utility provides common toolbar item configurations:

```typescript
import { ToolbarItemPresets } from '@milkdown/crepe'

// Item that requires text selection (automatically disabled when selection is empty)
const selectionItem = ToolbarItemPresets.requiresSelection({
  key: 'my-item',
  icon: '🎨',
  tooltip: 'My Action',
  onClick: (ctx) => {
    /* your logic */
  },
  isActive: (ctx, selection) => false, // optional
})

// Item that is always enabled
const alwaysEnabledItem = ToolbarItemPresets.alwaysEnabled({
  key: 'my-item',
  icon: '🔧',
  tooltip: 'Always Available',
  onClick: (ctx) => {
    /* your logic */
  },
  isActive: (ctx, selection) => false, // optional
})
```

### SlashMenuItemPresets

The `SlashMenuItemPresets` utility provides common slash menu item patterns:

```typescript
import { SlashMenuItemPresets } from '@milkdown/crepe'

// Simple text insertion
const textItem = SlashMenuItemPresets.textInsertion({
  key: 'signature',
  label: 'Insert Signature',
  icon: '✍️',
  text: 'Best regards,\nJohn Doe',
})

// Block replacement (requires NodeType)
const blockItem = SlashMenuItemPresets.blockReplacement({
  key: 'callout',
  label: 'Callout Block',
  icon: '📢',
  nodeType: myNodeType, // Your ProseMirror NodeType
  attrs: { type: 'info' }, // optional attributes
})
```

These utilities handle common patterns like:

- Automatic disabling when selection is empty (`requiresSelection`)
- Text insertion at cursor position (`textInsertion`)
- Block type replacement (`blockReplacement`)
- Consistent state management
