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
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-incidencias',
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
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.css'
})
export class Incidencias implements OnInit {

  incidencias: any[] = [];
  cargando = true;
  usuario: any = null;
  mostrarFormulario = false;
  buscandoEmpleado = false;
  empleadoEncontrado: any = null;

  // Stats del dashboard de incidencias
  stats = {
    esteMes: 0,
    porResolver: 0,
    masIncidencias: ''
  };

  incidenciaForm: FormGroup;
  dniBusqueda: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.incidenciaForm = this.fb.group({
      dniEmpleado: ['', Validators.required],
      tipo: ['Tardanza', Validators.required],
      severidad: ['MODERADA', Validators.required],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    this.cargando = true;
    this.http.get<any[]>('https://tarea-soluciones-2.onrender.com/api/v1/incidencias').subscribe({
      next: (data) => {
        this.incidencias = data;
        this.calcularStats();
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  calcularStats(): void {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    this.stats.esteMes = this.incidencias.filter(i => {
      const fecha = new Date(i.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    }).length;

    this.stats.porResolver = this.incidencias.filter(
      i => i.severidad === 'GRAVE' || i.severidad === 'MODERADA'
    ).length;

    // Empleado con más incidencias
    const conteo: any = {};
    this.incidencias.forEach(i => {
      conteo[i.nombreCompleto] = (conteo[i.nombreCompleto] || 0) + 1;
    });
    const max = Object.entries(conteo).sort((a: any, b: any) => b[1] - a[1])[0];
    this.stats.masIncidencias = max ? `${max[0]} (${max[1]})` : '—';
  }

  buscarEmpleado(): void {
    if (!this.dniBusqueda) return;
    this.buscandoEmpleado = true;

    this.http.get<any>(`https://tarea-soluciones-2.onrender.com/api/v1/empleados/expediente/${this.dniBusqueda}`)
      .subscribe({
        next: (data) => {
          this.empleadoEncontrado = data;
          this.incidenciaForm.patchValue({ dniEmpleado: this.dniBusqueda });
          this.buscandoEmpleado = false;
        },
        error: () => {
          this.buscandoEmpleado = false;
          this.snackBar.open('Empleado no encontrado', 'Cerrar', { duration: 3000 });
        }
      });
  }

  registrarIncidencia(): void {
    if (this.incidenciaForm.invalid) return;

    this.http.post<any>('https://tarea-soluciones-2.onrender.com/api/v1/incidencias', this.incidenciaForm.value)
      .subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.empleadoEncontrado = null;
          this.dniBusqueda = '';
          this.incidenciaForm.reset({
            tipo: 'Tardanza',
            severidad: 'MODERADA',
            fecha: new Date().toISOString().split('T')[0]
          });
          this.cargarIncidencias();
          this.snackBar.open('Incidencia registrada', 'Cerrar', { duration: 2000 });
        },
        error: () => {
          this.snackBar.open('Error al registrar', 'Cerrar', { duration: 3000 });
        }
      });
  }

  getColorSeveridad(severidad: string): string {
    switch(severidad) {
      case 'GRAVE': return '#ef4444';
      case 'MODERADA': return '#f97316';
      case 'LEVE': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  getIniciales(nombre: string): string {
    if (!nombre) return 'E';
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  irAExpediente(dni: string): void {
    this.router.navigate(['/empleados/expediente', dni]);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}