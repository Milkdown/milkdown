# @milkdown/plugin-diff

Diff review plugin for [milkdown](https://milkdown.dev/). Compares two documents and lets users accept or reject individual changes.

## Usage

```typescript
import { Editor } from '@milkdown/kit/core'
import { diff } from '@milkdown/kit/plugin/diff'
import { diffComponent } from '@milkdown/kit/component/diff'
import { commonmark } from '@milkdown/kit/preset/commonmark'

const editor = await Editor.make()
  .use(commonmark)
  .use(diff)
  .use(diffComponent)
  .create()
```

### With Crepe

```typescript
import { Crepe, CrepeFeature } from '@milkdown/crepe'

const crepe = new Crepe({
  root: '#editor',
  features: {
    [CrepeFeature.Diff]: true,
  },
})
await crepe.create()
```

## Starting a Diff Review

Pass the modified markdown to `startDiffReviewCmd`. The editor will show the differences and lock editing until the review is complete.

```typescript
import { callCommand } from '@milkdown/kit/utils'
import { startDiffReviewCmd } from '@milkdown/kit/plugin/diff'

editor.action(
  callCommand(startDiffReviewCmd.key, '# Updated content\n\nNew paragraph.')
)
```

## Accepting and Rejecting Changes

Users can click the Accept/Reject buttons on each change in the UI. You can also control this programmatically:

```typescript
import { callCommand } from '@milkdown/kit/utils'
import {
  acceptAllDiffsCmd,
  rejectAllDiffsCmd,
  clearDiffReviewCmd,
  acceptDiffChunkCmd,
  rejectDiffChunkCmd,
} from '@milkdown/kit/plugin/diff'

// Accept all remaining changes
editor.action(callCommand(acceptAllDiffsCmd.key))

// Reject all remaining changes
editor.action(callCommand(rejectAllDiffsCmd.key))

// Cancel the review without applying anything
editor.action(callCommand(clearDiffReviewCmd.key))

// Accept/reject a specific change by index
editor.action(callCommand(acceptDiffChunkCmd.key, 0))
editor.action(callCommand(rejectDiffChunkCmd.key, 0))
```

The diff automatically deactivates and unlocks the editor when all changes have been resolved.

## Plugin Configuration

```typescript
import { diffConfig } from '@milkdown/kit/plugin/diff'

Editor.make()
  .config((ctx) => {
    ctx.update(diffConfig.key, (prev) => ({
      ...prev,
      lockOnReview: false, // Allow editing during diff review (default: true)
    }))
  })
  .use(diff)
  .use(diffComponent)
  .create()
```

## Component Configuration

The diff component handles the visual rendering of changes. It can be configured through `diffComponentConfig`:

```typescript
import { diffComponentConfig } from '@milkdown/kit/component/diff'

Editor.make()
  .config((ctx) => {
    ctx.update(diffComponentConfig.key, (prev) => ({
      ...prev,
      classPrefix: 'my-diff', // CSS class prefix (default: 'milkdown-diff')
      acceptLabel: 'Apply', // Accept button text (default: 'Accept')
      rejectLabel: 'Discard', // Reject button text (default: 'Reject')
      customBlockTypes: [
        // Node types using custom node views
        'table',
        'image-block',
        'code_block',
      ],
    }))
  })
  .use(diff)
  .use(diffComponent)
  .create()
```

### Custom Block Types

ProseMirror's inline decorations cannot penetrate custom node views. The `customBlockTypes` option tells the diff component which node types need block-level replacement handling instead of inline decorations.

When using Crepe, this is pre-configured with `['table', 'image-block', 'code_block']`.

## Styling

The diff component uses CSS classes that you need to style. When using Crepe, styles are included in the theme CSS automatically.

For standalone usage, the main CSS classes are:

| Class                           | Description                                |
| ------------------------------- | ------------------------------------------ |
| `.milkdown-diff-removed`        | Inline deletion (strikethrough)            |
| `.milkdown-diff-removed-block`  | Block-level deletion (node overlay)        |
| `.milkdown-diff-added`          | Inline insertion                           |
| `.milkdown-diff-added-block`    | Block-level insertion widget               |
| `.milkdown-diff-controls`       | Inline Accept/Reject button container      |
| `.milkdown-diff-controls-block` | Block-level Accept/Reject button container |
| `.milkdown-diff-accept`         | Accept button                              |
| `.milkdown-diff-reject`         | Reject button                              |

## Plugin

@diff
@diffPlugin
@diffPluginKey
@diffConfig

## Commands

@startDiffReviewCmd
@acceptDiffChunkCmd
@rejectDiffChunkCmd
@acceptDiffRangeCmd
@rejectDiffRangeCmd
@acceptAllDiffsCmd
@rejectAllDiffsCmd
@clearDiffReviewCmd

## Utilities

@computeDocDiff
@getPendingChanges
@isChangeRejected

## Types

@DiffState
@DiffConfig
@DiffRange
@DiffAction
