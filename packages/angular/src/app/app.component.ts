/* Copyright 2021, Milkdown by Mirone. */
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'milkdown-angular';

    public form = this.fb.group({
        content: ['', []],
    });

    constructor(private fb: FormBuilder) {}

    public handleClickSubmit(): void {
        // eslint-disable-next-line no-console
        console.log(this.form.value);
    }
}
