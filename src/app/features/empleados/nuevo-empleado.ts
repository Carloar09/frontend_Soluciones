import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nuevo-empleado',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './nuevo-empleado.html',
  styleUrl: './nuevo-empleado.css'
})
export class NuevoEmpleado implements OnInit {

  usuario: any = null;
  sucursales: any[] = [];
  cargando = false;

  empleadoForm: FormGroup;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.empleadoForm = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: [''],
      email: ['', Validators.email],
      direccion: [''],
      contactoEmergencia: [''],
      estado: ['ACTIVO'],
      sucursalId: ['', Validators.required],
      area: ['', Validators.required],
      cargo: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      fechaVencimiento: ['']
    });
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.http.get<any[]>('https://tarea-soluciones-2.onrender.com/api/v1/sucursales').subscribe({
      next: (data) => this.sucursales = data,
      error: () => {}
    });
  }

  guardar(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.http.post<any>('https://tarea-soluciones-2.onrender.com/api/v1/empleados', this.empleadoForm.value)
      .subscribe({
        next: (data) => {
          this.snackBar.open('Empleado registrado correctamente', 'Cerrar', { duration: 2000 });
          this.router.navigate(['/empleados/expediente', data.dni]);
        },
        error: (err) => {
          this.cargando = false;
          this.snackBar.open(
            err.error?.mensaje || 'Error al registrar empleado',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
  }

  getIniciales(nombre: string): string {
    if (!nombre) return 'U';
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}