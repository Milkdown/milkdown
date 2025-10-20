# yswang 添加支持 Mermaid 图表库特性

这个作为 Crepe 内置特性添加, 涉及改动如下:

1. 源码: `crepe/src/feature/mermaid/`
   
2. `crepe/src/feature/index.ts` 文件增加如下配置项:
  ```
  // yswang
  import type { MermaidFeatureConfig } from './mermaid'

  export enum CrepeFeature {
    ...
    // yswang
    Mermaid = 'mermaid',
  }

  export interface CrepeFeatureConfig {
    ...
    // yswang
    [CrepeFeature.Mermaid]?: MermaidFeatureConfig
  }

  export const defaultFeatures: Record<CrepeFeature, boolean> = {
    ...
    // yswang
    [CrepeFeature.Mermaid]: true,
  }

  export async function loadFeature(feature: CrepeFeature, editor: Editor, config?: never) {
    switch (feature) {
      ...
      // yswang
      case CrepeFeature.Mermaid: {
        const { defineFeature } = await import('./mermaid')
        return defineFeature(editor, config)
      }
    }
  }

  ````

3. `slash-menu` 菜单高级中添加 `Mermaid` 菜单项, 涉及改动文件:
   
  `crepe/src/feature/block-edit/index.ts`:
  ```
  interface BlockEditConfig {
    ...
    // yswang
    slashMenuGraphIcon: Icon
    slashMenuGraphLabel: string
  }
  ```

  `crepe/src/feature/block-edit/menu/config.ts`:
  ```
  import {
    ...
    graphIcon,
  } from '../../../icons'

  export function getGroups(filter?: string, config?: BlockEditFeatureConfig, ctx?: Ctx) {
    ...
    // yswang
    const isMermaidEnabled = flags?.includes(CrepeFeature.Mermaid)

    // yswang
    if (isMermaidEnabled) {
      advancedGroup.addItem('mermaid', {
        label: config?.slashMenuGraphLabel ?? 'Mermaid',
        icon: config?.slashMenuGraphIcon?.() ?? graphIcon,
        onRun: (ctx) => {
          const view = ctx.get(editorViewCtx)
          const { dispatch, state } = view

          const command = clearContentAndAddBlockType(codeBlockSchema.type(ctx), {
            language: 'mermaid',
          })
          command(state, dispatch)
        },
      })
    }
  }
  ```

  添加 `crepe/src/icons/graph.ts` 图标文件:
  ```
  export const graphIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="currentColor" d="M15 19v-1h-2q-.825 0-1.412-.587T11 16V8H9v1q0 .825-.587 1.413T7 11H4q-.825 0-1.412-.587T2 9V5q0-.825.588-1.412T4 3h3q.825 0 1.413.588T9 5v1h6V5q0-.825.588-1.412T17 3h3q.825 0 1.413.588T22 5v4q0 .825-.587 1.413T20 11h-3q-.825 0-1.412-.587T15 9V8h-2v8h2v-1q0-.825.588-1.412T17 13h3q.825 0 1.413.588T22 15v4q0 .825-.587 1.413T20 21h-3q-.825 0-1.412-.587T15 19M4 5v4zm13 10v4zm0-10v4zm0 4h3V5h-3zm0 10h3v-4h-3zM4 9h3V5H4z"/></svg>
  `
  ```

  `crepe/src/icons/index.ts`:
  ```
  // yswang
  export * from './graph'
  ```

  