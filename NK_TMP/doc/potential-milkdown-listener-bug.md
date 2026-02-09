# Bug: `@milkdown/plugin-listener` Creates New Debounce Per Transaction

## Package
- **Name**: `@milkdown/plugin-listener`
- **Version**: `7.18.0`
- **Repository**: https://github.com/Milkdown/milkdown
- **Source path**: `packages/plugins/plugin-listener/src/index.ts`

## Summary

The `markdownUpdated` listener fires **once per keystroke** during rapid typing instead of being
debounced to fire once after typing stops. The root cause is that the ProseMirror plugin's
`state.apply` creates a **new** `lodash-es/debounce` function on every invocation, so successive
keystroke handlers never cancel each other.

## The Bug (Source Code)

In `src/index.ts`, lines 208-231 (the ProseMirror plugin's `state.apply`):

```typescript
apply: (tr) => {
  // ... selection handling ...

  if (!(tr.docChanged || tr.storedMarksSet) || tr.getMeta('addToHistory') === false)
    return

  //  BUG: a NEW debounce function is created on EVERY apply call
  const handler = debounce(() => {
    const { doc } = tr
    if (listeners.updated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
      listeners.updated.forEach((fn) => { fn(ctx, doc, prevDoc!) })
    }
    if (listeners.markdownUpdated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
      const markdown = serializer(doc)
      listeners.markdownUpdated.forEach((fn) => { fn(ctx, markdown, prevMarkdown!) })
      prevMarkdown = markdown
    }
    prevDoc = doc
  }, 200)

  return handler()   // schedules a NEW independent 200ms timer
},
```

### Why This Is Wrong

`lodash-es/debounce` returns a **new function wrapper** each call. Debouncing only works when
the **same wrapper** is called repeatedly — the wrapper cancels its previous timer on each call.
Here, each `apply` call creates a brand-new wrapper, so:

| Keystroke | Time  | What happens                                       |
|-----------|-------|----------------------------------------------------|
| `a`       | t=0   | Creates `handler_0`, schedules timer at t+200      |
| `b`       | t=50  | Creates `handler_1`, schedules **another** timer at t+250 |
| `c`       | t=100 | Creates `handler_2`, schedules **another** timer at t+300 |
| —         | t=200 | `handler_0` fires → serializes doc from keystroke `a` |
| —         | t=250 | `handler_1` fires → serializes doc from keystroke `b` |
| —         | t=300 | `handler_2` fires → serializes doc from keystroke `c` |

**Expected behavior**: A single debounced call fires at t=300 (200ms after the last keystroke),
serializing the final document state containing `abc`.

**Actual behavior**: Three independent calls fire in sequence. Each captures the `tr` from its
respective `apply`, so each serializes a **different intermediate document snapshot**.

### Consequences

1. **Performance**: Serialization (markdown rendering of the full document) runs N times instead
   of once per burst of typing. On large documents this is wasteful.

2. **Stale emissions break controlled-component patterns**: When the listener is used in a
   React controlled component (the documented Milkdown+React pattern), the parent receives
   multiple `onUpdate` calls with progressively newer content. If the parent feeds content back
   as a prop (controlled component), echo detection must handle N in-flight values instead of 1.
   With async round-trips (e.g., VSCode webview message-passing, server sync), earlier echoes
   arrive after later emissions have overwritten tracking state, causing the editor to replace its
   own document with stale content and **resetting the cursor to the end**.

3. **`prevDoc` / `prevMarkdown` updated multiple times**: The closure variables `prevDoc` and
   `prevMarkdown` are updated by each handler in sequence. Because handlers fire in creation order,
   `prevDoc` ends up correct (set to the latest doc). But intermediate handlers perform redundant
   `prevDoc.eq(doc)` checks against an already-stale `prevDoc` value.

## Correct Fix

Hoist the debounced function **outside** `apply` so a single wrapper is reused across calls:

```typescript
// BEFORE (buggy): inside apply
state: {
  init: (_, instance) => { ... },
  apply: (tr) => {
    // ... selection ...
    const handler = debounce(() => { ... }, 200)  // NEW function every time
    return handler()
  },
}

// AFTER (fixed): single debounced function, apply updates captured tr
state: {
  init: (_, instance) => { ... },
  apply: (() => {
    let latestTr: Transaction | null = null
    const debouncedHandler = debounce(() => {
      if (!latestTr) return
      const { doc } = latestTr
      if (listeners.updated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
        listeners.updated.forEach((fn) => { fn(ctx, doc, prevDoc!) })
      }
      if (listeners.markdownUpdated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
        const markdown = serializer(doc)
        listeners.markdownUpdated.forEach((fn) => { fn(ctx, markdown, prevMarkdown!) })
        prevMarkdown = markdown
      }
      prevDoc = doc
      latestTr = null
    }, 200)

    return (tr: Transaction) => {
      // ... selection handling ...
      if (!(tr.docChanged || tr.storedMarksSet) || tr.getMeta('addToHistory') === false)
        return
      latestTr = tr
      debouncedHandler()
    }
  })(),
}
```

With this fix, each `apply` call **reuses** `debouncedHandler`. The wrapper cancels its previous
timer, so only one handler fires 200ms after the last keystroke, serializing the latest document.

## Reproduction Plan (Standalone — No External Dependencies)

A fresh agent can reproduce this with just Milkdown + React. Steps below.

### 1. Create a Minimal Project

```bash
npm create vite@latest milkdown-debounce-bug -- --template react-ts
cd milkdown-debounce-bug
npm install @milkdown/core@^7.18.0 \
            @milkdown/preset-commonmark@^7.18.0 \
            @milkdown/plugin-listener@^7.18.0 \
            @milkdown/react@^7.18.0 \
            @milkdown/theme-nord@^7.18.0 \
            @prosemirror-adapter/react@^0.5.1
npm install -D @playwright/test
npx playwright install chromium
```

### 2. Create the Reproduction Component

Replace `src/App.tsx` with:

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor, rootCtx, defaultValueCtx, editorViewCtx, parserCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { Slice } from '@milkdown/prose/model';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import '@milkdown/theme-nord/style.css';

/**
 * Controlled Milkdown editor that logs every markdownUpdated callback.
 * This demonstrates the bug: during rapid typing, you'll see multiple
 * callbacks fire instead of one debounced callback.
 */
function EditorCore({ markdown, onEdit }: { markdown: string; onEdit: (md: string) => void }) {
  const isProgrammatic = useRef(false);
  const lastEmitted = useRef<string | null>(null);
  const onEditRef = useRef(onEdit);
  const callCountRef = useRef(0);
  const [loading, getEditor] = useInstance();

  useEffect(() => { onEditRef.current = onEdit; }, [onEdit]);

  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, markdown);

        const mgr = ctx.get(listenerCtx);
        mgr.markdownUpdated((_ctx, md, prevMd) => {
          if (isProgrammatic.current) return;
          if (md !== prevMd) {
            callCountRef.current++;
            // Log each call — during rapid typing you'll see MANY of these
            console.log(
              `[markdownUpdated #${callCountRef.current}] ` +
              `length=[${md.length}] snippet=[${md.slice(0, 60).replace(/\n/g, '\\n')}...]`
            );
            lastEmitted.current = md;
            onEditRef.current(md);
          }
        });
      })
      .config(nord)
      .use(commonmark)
      .use(listener)
  , []);

  // Apply incoming markdown (echo detection with single ref — demonstrates the weakness)
  useEffect(() => {
    if (loading) return;
    const editor = getEditor();
    if (!editor) return;
    if (markdown === lastEmitted.current) return; // echo

    queueMicrotask(() => {
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const parser = ctx.get(parserCtx);
        const newDoc = parser(markdown);
        if (!newDoc) return;
        if (view.state.doc.eq(newDoc)) return;

        isProgrammatic.current = true;
        try {
          const { state } = view;
          view.dispatch(
            state.tr.replace(0, state.doc.content.size, new Slice(newDoc.content, 0, 0))
          );
        } finally {
          isProgrammatic.current = false;
        }
      });
    });
  }, [markdown, loading, getEditor]);

  return <Milkdown />;
}

/**
 * Simulates a controlled component with async round-trip delay.
 * The delay simulates real-world latency (e.g., VSCode webview messaging).
 */
export default function App() {
  const [md, setMd] = useState('# Test\n\nType rapidly here.');
  const DELAY_MS = 100; // Simulate async round-trip

  const handleEdit = useCallback((newMd: string) => {
    // Simulate async round-trip: delay before feeding content back
    setTimeout(() => setMd(newMd), DELAY_MS);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Milkdown Debounce Bug Reproduction</h2>
      <p>Open DevTools console. Type rapidly in the editor below.</p>
      <p>
        <strong>Expected:</strong> One <code>[markdownUpdated]</code> log per typing pause (200ms debounce).<br/>
        <strong>Actual:</strong> One log per keystroke, all firing 200ms after their respective key.
      </p>
      <ProsemirrorAdapterProvider>
        <MilkdownProvider>
          <EditorCore markdown={md} onEdit={handleEdit} />
        </MilkdownProvider>
      </ProsemirrorAdapterProvider>
    </div>
  );
}
```

### 3. Run and Observe

```bash
npm run dev
```

1. Open browser DevTools console
2. Click into the editor paragraph
3. Type `abcdefghij` rapidly
4. Watch the console — you'll see ~10 `[markdownUpdated]` lines instead of 1

### 4. Automated Playwright Test

Create `tests/debounce-bug.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('markdownUpdated fires once per keystroke instead of once per debounce window', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.milkdown');

  // Collect console logs
  const logs: string[] = [];
  page.on('console', (msg) => {
    if (msg.text().includes('[markdownUpdated')) {
      logs.push(msg.text());
    }
  });

  // Focus editor
  const editor = page.locator('.milkdown [role="textbox"][contenteditable="true"]').first();
  await editor.click();
  await page.keyboard.press('End');

  // Type 10 characters at 30ms intervals (all within the 200ms debounce window)
  await page.keyboard.type('abcdefghij', { delay: 30 });

  // Wait for all debounced handlers to fire (200ms after last keystroke + buffer)
  await page.waitForTimeout(500);

  // BUG: we expect 1 debounced callback, but get ~10 (one per keystroke)
  console.log(`Callback count: ${logs.length}`);
  console.log('Logs:', logs);

  // This assertion demonstrates the bug.
  // With correct debouncing: logs.length should be 1 (or at most 2-3 for timing variance).
  // With the bug: logs.length will be ~10 (one per keystroke).
  //
  // To PROVE the bug exists, assert the broken behavior:
  expect(logs.length).toBeGreaterThan(3); // BUG: fires way too many times

  // To test the FIX, flip this assertion:
  // expect(logs.length).toBeLessThanOrEqual(3); // FIXED: properly debounced
});
```

Run with:
```bash
npx playwright test tests/debounce-bug.spec.ts
```

### 5. Verify the Fix

To verify the fix works, patch `node_modules/@milkdown/plugin-listener/lib/index.js`:

Replace lines 116-143 (the `apply` method) with:

```javascript
apply: (() => {
  let latestTr = null;
  const debouncedHandler = debounce(() => {
    if (!latestTr) return;
    const { doc } = latestTr;
    if (listeners.updated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
      listeners.updated.forEach((fn) => {
        fn(ctx, doc, prevDoc);
      });
    }
    if (listeners.markdownUpdated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
      const markdown = serializer(doc);
      listeners.markdownUpdated.forEach((fn) => {
        fn(ctx, markdown, prevMarkdown);
      });
      prevMarkdown = markdown;
    }
    prevDoc = doc;
    latestTr = null;
  }, 200);
  return (tr) => {
    const currentSelection = tr.selection;
    if (!prevSelection && currentSelection || prevSelection && !currentSelection.eq(prevSelection)) {
      listeners.selectionUpdated.forEach((fn) => {
        fn(ctx, currentSelection, prevSelection);
      });
      prevSelection = currentSelection;
    }
    if (!(tr.docChanged || tr.storedMarksSet) || tr.getMeta("addToHistory") === false)
      return;
    latestTr = tr;
    debouncedHandler();
  };
})()
```

After patching, re-run the Playwright test. The callback count should drop from ~10 to 1-2.

## Already Reproduced in Our Codebase

We reproduced this bug in our DevBootstrapApp (a Vite+React dev harness for the editor)
**without** needing VSCode. The DevBootstrapApp has a `?delay=<ms>` URL param that adds a
`setTimeout` to the `onUserEdit → setMarkdown` path, simulating any async round-trip.

With `?delay=100`:
- The cursor-reset bug triggers reliably during rapid typing
- Our Set-based echo detection workaround prevents it

This confirms the trigger condition is **any latency in the feedback loop**, not something
VSCode-specific. A bare `setTimeout(..., 100)` in a React controlled component is sufficient.

## Impact on Consumers

The bug affects **any** Milkdown consumer using a controlled-component pattern (feed editor
output back as input) when the round-trip has latency. This includes:

- Extension host IPC (VSCode webview ↔ extension host)
- Server sync (collaborative editing, auto-save round-trips)
- Message queues, web workers, or any async state management
- Even a simple `setTimeout` in a React `setState` callback

Synchronous React `setState` round-trips mask the issue because React batching keeps echo
detection in sync — but this is a fragile coincidence, not a guarantee.

### Severity

The debounce being broken also means **serialization runs N times per burst** instead of once.
On large documents with complex schemas (tables, transclusions, mermaid diagrams), this is
a meaningful performance waste even when the cursor-reset symptom doesn't manifest.
