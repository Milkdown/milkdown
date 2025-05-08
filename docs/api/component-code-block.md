# Code Block Component

The `codeBlock` component renders a code block with a [Codemirror](https://codemirror.net/) editor.

The component provides following features:

- [x] Language picker
- [x] Syntax highlighting
- [x] Line numbers
- [x] Code auto-completion and folding
- [x] Code search and replace

> The component itself doesn't provide any styling.
>
> You need to write your own CSS to style it.

# Usage

```typescript
import { defaultKeymap } from "@codemirror/commands";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { html } from "@milkdown/kit/component";
import {
  codeBlockComponent,
  codeBlockConfig,
} from "@milkdown/kit/component/code-block";
import { defaultValueCtx, Editor } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { basicSetup } from "codemirror";

await Editor.make()
  .config((ctx) => {
    ctx.update(codeBlockConfig.key, (defaultConfig) => ({
      ...defaultConfig,
      languages,
      extensions: [basicSetup, oneDark, keymap.of(defaultKeymap)],
      renderLanguage: (language, selected) => {
        return html`<span class="leading">${selected ? check : null}</span
          >${language}`;
      },
    }));
  })
  .use(commonmark)
  .use(codeBlockComponent)
  .create();
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-code-block"}

---

# Configuration

You can configure the component by updating the `codeBlockConfig` ctx in `editor.config`.

The possible configurations are:

### `languages`

Codemirror language data list. You can either import the language data from `@codemirror/language-data` or provide your own language data.

```typescript
// Option 1: Import language data from @codemirror/language-data
// Option 2: Provide your own language data
import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

const myLanguages = [
  LanguageDescription.of({
    name: "JavaScript",
    alias: ["ecmascript", "js", "node"],
    extensions: ["js", "mjs", "cjs"],
    load() {
      return import("@codemirror/lang-javascript").then((m) => m.javascript());
    },
  }),
  LanguageDescription.of({
    name: "CSS",
    extensions: ["css", "pcss"],
    load() {
      return import("@codemirror/lang-css").then((m) => m.css());
    },
  }),
];

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  languages: myLanguages,
}));
```

### `extensions`

Codemirror extensions list.
There are a lot of extensions available in the Codemirror ecosystem.
You can use the `basicSetup` extension to enable basic features like line numbers, syntax highlighting, theme, etc.

```typescript
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";
import { basicSetup } from "codemirror";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  extensions: [
    keymap.of(defaultKeymap.concat(indentWithTab)),
    basicSetup,
    theme,
  ],
}));
```

### `renderLanguage`

A function to render the language list item in the language picker.

```typescript
import { html } from "@milkdown/kit/component";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  renderLanguage: (language, selected) => {
    return html`
      <div class="language-list-item">
        <span class="leading">${selected ? check : null}</span>
        ${language}
      </div>
    `;
  },
}));
```

### `expandIcon`

The icon to expand the language picker list.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { html } from "@milkdown/kit/component";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  expandIcon: () => html`<span>🔽</span>`,
}));
```

### `searchIcon`

The icon representing the search ability.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { html } from "@milkdown/kit/component";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  searchIcon: () => html`<span>🔍</span>`,
}));
```

### `clearnSearchIcon`

The icon displayed on the button to clear the search input.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { html } from "@milkdown/kit/component";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  clearnSearchIcon: () => html`<span>❌</span>`,
}));
```

### `searchPlaceholder`

The placeholder text for the search input.

The value should be a string.

```typescript
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  searchPlaceholder: "Find a language...",
}));
```

### `noResultText`

The text displayed when no language matches the search input.

The value should be a string.

```typescript
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  noResultText: "No language found",
}));
```

### `renderPreview`

A function to render the preview of the code block.

The value can be a function that return:

- A string
- A DOM element
- `null` to hide the preview

```typescript
import { html } from "@milkdown/kit/component";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  renderPreview: (language, content) => {
    if (language === "latex" && content.length > 0) {
      return renderLatexToDOM(content);
    }
    return null;
  },
}));
```

### `previewToggleButton`

The text shown in the button to toggle the preview only mode.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { html } from "@milkdown/kit/component";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  previewToggleButton: (previewOnlyMode) => {
    if (previewOnlyMode) {
      return "Show code";
    }
    return "Hide code";
  },
}));
```

### `previewLabel`

The label shown in the preview mode.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { html } from "@milkdown/kit/component";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  previewLabel: () => {
    return "Preview";
  },
}));
```
