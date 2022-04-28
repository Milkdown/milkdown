# Angular

We don't provide Angular support out of box, but you can use the vanilla version with it easily.

## Install the Dependencies

```bash
# install with npm
npm install @milkdown/core @milkdown/prose @milkdown/preset-commonmark @milkdown/theme-nord
```

## Create a Component

Create a component is pretty easy.

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

### Online Demo

!CodeSandBox{milkdown-angular-setup-wowuy?fontsize=14&hidenavigation=1&theme=dark&view=preview}
