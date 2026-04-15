# @milkdown/plugin-streaming

Streaming input plugin for [milkdown](https://milkdown.dev/). Streams markdown content token by token into the editor with progressive rendering, useful for AI-generated content.

## Usage

```typescript
import { Editor } from '@milkdown/kit/core'
import { streaming } from '@milkdown/kit/plugin/streaming'
import { commonmark } from '@milkdown/kit/preset/commonmark'

const editor = await Editor.make().use(commonmark).use(streaming).create()
```

### With Crepe

```typescript
import { Crepe } from '@milkdown/crepe'

const crepe = new Crepe({
  root: '#editor',
  features: {
    [Crepe.Feature.AI]: true, // Loads both streaming and diff plugins
  },
})
await crepe.create()
```

## Streaming Content

Use the commands to control the streaming lifecycle:

```typescript
import { commandsCtx } from '@milkdown/kit/core'
import {
  startStreamingCmd,
  pushChunkCmd,
  endStreamingCmd,
  abortStreamingCmd,
} from '@milkdown/kit/plugin/streaming'

// Start streaming (replace mode — replaces entire document)
editor.action((ctx) => {
  ctx.get(commandsCtx).call(startStreamingCmd.key)
})

// Push tokens as they arrive
for await (const chunk of aiStream) {
  editor.action((ctx) => {
    ctx.get(commandsCtx).call(pushChunkCmd.key, chunk)
  })
}

// End streaming
editor.action((ctx) => {
  ctx.get(commandsCtx).call(endStreamingCmd.key)
})
```

## Insert at Cursor

Instead of replacing the entire document, you can insert streamed content at the current cursor position:

```typescript
editor.action((ctx) => {
  ctx.get(commandsCtx).call(startStreamingCmd.key, { insertAt: 'cursor' })
})
```

You can also pass a specific position number:

```typescript
editor.action((ctx) => {
  ctx.get(commandsCtx).call(startStreamingCmd.key, { insertAt: 42 })
})
```

### Insert Behavior by Context

The insert strategy depends on where the cursor is when streaming starts:

| Cursor Position                  | Behavior                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Empty paragraph                  | Replaces the empty paragraph with streamed blocks                                  |
| Paragraph / heading / blockquote | First line merges into current block, remaining lines inserted as new blocks after |
| List item                        | Same as above — first line merges, rest inserted after the list                    |
| Code block                       | All content inserted as plain text, newlines preserved                             |
| Table cell                       | All content inserted as plain text, newlines collapsed to spaces                   |
| Between blocks (depth 0)         | Full markdown parse, inserted as block nodes                                       |

## Replace Selection

You can replace the current text selection with streamed content:

```typescript
editor.action((ctx) => {
  ctx.get(commandsCtx).call(startStreamingCmd.key, { insertAt: 'selection' })
})
```

When the selection is non-empty, the selected range is replaced by the streamed content as it arrives. When the selection is collapsed (empty), this behaves identically to `insertAt: 'cursor'`.

The insert strategy is resolved based on the position at `selection.from`. For example, if the selection starts inside a paragraph, the `split-block` strategy is used; if it starts inside a code block, plain-text insertion is used.

After streaming ends, aborting with `keep: false` restores the original document including the selected text. Diff review mode also works correctly — the diff shows the original selection being replaced.

## Diff Review After Streaming

When the diff plugin is also loaded (e.g. via `Crepe.Feature.AI` in Crepe, or by manually calling `editor.use(diff)` on a standalone editor), you can hand off to diff review mode after streaming ends:

```typescript
// End streaming and enter diff review
editor.action((ctx) => {
  ctx.get(commandsCtx).call(endStreamingCmd.key, { diffReview: true })
})
```

This restores the original document and shows the streamed content as a diff that users can accept or reject. See [@milkdown/plugin-diff](./plugin-diff.md) for diff review commands.

You can also enable diff review by default in the config:

```typescript
import { streamingConfig } from '@milkdown/kit/plugin/streaming'

editor.config((ctx) => {
  ctx.update(streamingConfig.key, (prev) => ({
    ...prev,
    diffReviewOnEnd: true,
  }))
})
```

## Aborting

```typescript
// Abort and restore original document
editor.action((ctx) => {
  ctx.get(commandsCtx).call(abortStreamingCmd.key, { keep: false })
})

// Abort but keep partial content
editor.action((ctx) => {
  ctx.get(commandsCtx).call(abortStreamingCmd.key, { keep: true })
})
```

## Plugin Configuration

```typescript
import { streamingConfig } from '@milkdown/kit/plugin/streaming'

editor.config((ctx) => {
  ctx.update(streamingConfig.key, (prev) => ({
    ...prev,
    throttleMs: 100, // Flush interval in ms (default: 100)
    scrollFollow: true, // Auto-scroll to follow content (default: true)
    diffReviewOnEnd: false, // Enter diff review on end (default: false)
  }))
})
```

## Custom Insert Strategy

You can customize how content is inserted at different cursor positions by providing an `insertStrategy` resolver:

```typescript
import {
  defaultInsertStrategy,
  streamingConfig,
} from '@milkdown/kit/plugin/streaming'

editor.config((ctx) => {
  ctx.update(streamingConfig.key, (prev) => ({
    ...prev,
    insertStrategy: (resolved) => {
      // Custom: treat blockquote as plain text
      for (let d = resolved.depth; d > 0; d--) {
        if (resolved.node(d).type.name === 'blockquote')
          return { type: 'plain-text', preserveNewlines: false }
      }
      // Fall back to default for everything else
      return defaultInsertStrategy(resolved)
    },
  }))
})
```

### Strategy Types

| Type                                                 | Description                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `{ type: 'plain-text', preserveNewlines?: boolean }` | Insert as plain text. Use `preserveNewlines: true` for code blocks.                      |
| `{ type: 'split-block' }`                            | First line merges as text into current block, remaining lines parsed as markdown blocks. |
| `{ type: 'block' }`                                  | Parse entire buffer as markdown and insert as top-level blocks.                          |

## Plugin

@streaming
@streamingPlugin
@streamingPluginKey
@streamingConfig

## Commands

@startStreamingCmd
@pushChunkCmd
@endStreamingCmd
@abortStreamingCmd

## Utilities

@defaultInsertStrategy
@applyStreamingAction

## Types

@StreamingState
@StreamingConfig
@StartStreamingOptions
@EndStreamingOptions
@AbortStreamingOptions
@InsertStrategy
@InsertStrategyResolver
@StreamingAction
