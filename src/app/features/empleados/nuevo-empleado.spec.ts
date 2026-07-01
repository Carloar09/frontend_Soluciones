import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoEmpleado } from './nuevo-empleado';

describe('NuevoEmpleado', () => {
  let component: NuevoEmpleado;
  let fixture: ComponentFixture<NuevoEmpleado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoEmpleado],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevoEmpleado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
