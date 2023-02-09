# @milkdown/plugin-diagram

Add support for diagrams through [mermaid](https://mermaid-js.github.io/mermaid/#/).

## Usage

```typescript
import { Editor } from '@milkdown/core';

import { diagram } from '@milkdown/plugin-diagram';

Editor.make()
  .use(diagram)
  .create();
```

@diagram

## Plugins

@mermaidConfigCtx
@diagramSchema
@insertDiagramInputRules
@insertDiagramCommand

@remarkDiagramPlugin
