import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MilkdownComponent } from './milkdown.component';

@NgModule({
    declarations: [MilkdownComponent],
    imports: [CommonModule, FormsModule],
    exports: [MilkdownComponent],
})
export class MilkdownModule {}
