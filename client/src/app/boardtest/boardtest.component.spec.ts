import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardtestComponent } from './boardtest.component';

describe('BoardtestComponent', () => {
  let component: BoardtestComponent;
  let fixture: ComponentFixture<BoardtestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardtestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardtestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
