import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TetrisBoardComponent } from './tetris-board.component';

describe('TetrisBoardComponent', () => {
  let component: TetrisBoardComponent;
  let fixture: ComponentFixture<TetrisBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TetrisBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TetrisBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
