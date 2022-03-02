import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Injector,
    Input,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { menu } from '@milkdown/plugin-menu';

@Component({
    selector: 'milkdown-editor',
    templateUrl: 'milkdown.component.html',
    styleUrls: ['./milkdown.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MilkdownComponent),
            multi: true,
        },
    ],
})
export class MilkdownComponent implements AfterViewInit, ControlValueAccessor {
    @ViewChild('editorRef') editorRef!: ElementRef<HTMLDivElement>;

    @Input('ngModel')
    public value: string = '';

    @Output('ngModelChange')
    public valueEmit = new EventEmitter<string>();

    constructor() {}
    writeValue(value: any): void {
        this.value = value;
        this.valueEmit.next(value);
    }
    onChange: (_: any) => void = () => {};
    onTouched: () => void = () => {};
    protected setProperty(key: string, value: any): void {
        throw new Error('Method not implemented.');
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        throw new Error('Method not implemented.');
    }

    ngAfterViewInit(): void {
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, this.editorRef.nativeElement);
                ctx.set(defaultValueCtx, this.value);
                ctx.get(listenerCtx).markdownUpdated((_, md) => {
                    this.value = md;
                    this.onChange(md);
                    this.valueEmit.next(md);
                });
            })
            .use(nord)
            .use(gfm)
            .use(listener)
            .use(menu())
            .create();
    }
}
