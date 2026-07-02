import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sucursales',
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
    MatSnackBarModule
  ],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.css'
})
export class Sucursales implements OnInit {

  sucursales: any[] = [];
  cargando = true;
  usuario: any = null;

  // Modal crear
  mostrarModal = false;
  guardando = false;
  sucursalForm: FormGroup;

  // Modal eliminar
  mostrarConfirmarEliminar = false;
  sucursalAEliminar: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.sucursalForm = this.fb.group({
      nombre: ['', Validators.required],
      ubicacion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.cargando = true;
    this.http.get<any[]>('http://localhost:8080/api/v1/sucursales').subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  crearSucursal(): void {
    if (this.sucursalForm.invalid) return;
    this.guardando = true;

    const body = {
      nombre: this.sucursalForm.get('nombre')?.value,
      ubicacion: this.sucursalForm.get('ubicacion')?.value,
      encargadoId: null
    };

    this.http.post<any>('http://localhost:8080/api/v1/sucursales', body).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarModal = false;
        this.sucursalForm.reset();
        this.cargarSucursales();
        this.snackBar.open('Sucursal creada correctamente', 'Cerrar', { duration: 2000 });
      },
      error: () => {
        this.guardando = false;
        this.snackBar.open('Error al crear sucursal', 'Cerrar', { duration: 3000 });
      }
    });
  }

  confirmarEliminar(sucursal: any): void {
    this.sucursalAEliminar = sucursal;
    this.mostrarConfirmarEliminar = true;
  }

  eliminarSucursal(): void {
    if (!this.sucursalAEliminar) return;

    this.http.delete(`http://localhost:8080/api/v1/sucursales/${this.sucursalAEliminar.idSucursal}`)
      .subscribe({
        next: () => {
          this.mostrarConfirmarEliminar = false;
          this.sucursalAEliminar = null;
          this.cargarSucursales();
          this.snackBar.open('Sucursal eliminada', 'Cerrar', { duration: 2000 });
        },
        error: (err) => {
          this.mostrarConfirmarEliminar = false;
          this.snackBar.open(
            err.error?.mensaje || 'Error al eliminar sucursal',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
  }

  irAEmpleados(sucursalId: number): void {
    this.router.navigate(['/empleados'], { queryParams: { sucursalId } });
  }

  getIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}