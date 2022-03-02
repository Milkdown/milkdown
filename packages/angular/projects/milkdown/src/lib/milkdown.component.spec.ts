import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilkdownComponent } from './milkdown.component';

describe('MilkdownComponent', () => {
    let component: MilkdownComponent;
    let fixture: ComponentFixture<MilkdownComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MilkdownComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MilkdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
