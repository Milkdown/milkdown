# Angular

我们不提供开箱即用的 Angular 支持，但你可以在 Angular 中轻松使用原生 JavaScript 版本。

## 依赖安装

```bash
# install with npm
npm install @milkdown/core @milkdown/preset-commonmark @milkdown/theme-nord
```

## 创建一个组件

创建一个组件十分简单。

```html
<!-- editor.component.html -->
<div #editorRef></div>
```

```typescript
// editor.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

@Component({
    templateUrl: './editor.component.html',
})
export class AppComponent {
    @ViewChild('editorRef') editorRef: ElementRef;

    defaultValue = '# Milkdown x Angular';

    ngAfterViewInit() {
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, this.editorRef.nativeElement);
                ctx.set(defaultValueCtx, this.defaultValue);
            })
            .use(nord)
            .use(commonmark)
            .create();
    }
}
```

### 在线示例

!CodeSandBox{milkdown-angular-setup-wowuy?fontsize=14&hidenavigation=1&theme=dark&view=preview}
