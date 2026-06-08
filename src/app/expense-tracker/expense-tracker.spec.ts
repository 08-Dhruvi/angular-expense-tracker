import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTracker } from './expense-tracker';

describe('ExpenseTracker', () => {
  let component: ExpenseTracker;
  let fixture: ComponentFixture<ExpenseTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseTracker],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
