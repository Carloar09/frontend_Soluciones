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
  selector: 'app-salidas',
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
  templateUrl: './salidas.html',
  styleUrl: './salidas.css'
})
export class Salidas implements OnInit {

  salidas: any[] = [];
  cargando = true;
  usuario: any = null;

  // Wizard de 2 pasos
  mostrarFormulario = false;
  paso = 1;
  dniBusqueda = '';
  buscandoEmpleado = false;
  empleadoEncontrado: any = null;

  salidaForm: FormGroup;

  // Checklist pendientes
  pendientes = {
    cartaRecibida: false,
    devolucionMateriales: false,
    liquidacionFirmada: false
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.salidaForm = this.fb.group({
      dniEmpleado: ['', Validators.required],
      tipoSalida: ['RENUNCIA_VOLUNTARIA', Validators.required],
      fechaSalida: [new Date().toISOString().split('T')[0], Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarSalidas();
  }

  cargarSalidas(): void {
    this.cargando = true;
    this.http.get<any[]>('https://tarea-soluciones-2.onrender.com/api/v1/salidas').subscribe({
      next: (data) => {
        this.salidas = data;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  buscarEmpleado(): void {
    if (!this.dniBusqueda) return;
    this.buscandoEmpleado = true;

    this.http.get<any>(`https://tarea-soluciones-2.onrender.com/api/v1/empleados/expediente/${this.dniBusqueda}`)
      .subscribe({
        next: (data) => {
          this.empleadoEncontrado = data;
          this.salidaForm.patchValue({ dniEmpleado: this.dniBusqueda });
          this.buscandoEmpleado = false;
        },
        error: () => {
          this.buscandoEmpleado = false;
          this.snackBar.open('Empleado no encontrado', 'Cerrar', { duration: 3000 });
        }
      });
  }

  siguientePaso(): void {
    if (this.salidaForm.get('tipoSalida')?.invalid ||
        this.salidaForm.get('fechaSalida')?.invalid) return;
    this.paso = 2;
  }

  confirmarSalida(): void {
    const body = {
      ...this.salidaForm.value,
      cartaRecibida: this.pendientes.cartaRecibida,
      devolucionMateriales: this.pendientes.devolucionMateriales,
      liquidacionFirmada: this.pendientes.liquidacionFirmada
    };

    this.http.post<any>('https://tarea-soluciones-2.onrender.com/api/v1/salidas', body).subscribe({
      next: () => {
        this.cerrarFormulario();
        this.cargarSalidas();
        this.snackBar.open('Salida registrada. Empleado marcado como EX EMPLEADO', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al registrar salida', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.paso = 1;
    this.dniBusqueda = '';
    this.empleadoEncontrado = null;
    this.pendientes = { cartaRecibida: false, devolucionMateriales: false, liquidacionFirmada: false };
    this.salidaForm.reset({
      tipoSalida: 'RENUNCIA_VOLUNTARIA',
      fechaSalida: new Date().toISOString().split('T')[0]
    });
  }

  getTipoLabel(tipo: string): string {
    switch(tipo) {
      case 'RENUNCIA_VOLUNTARIA': return 'Renuncia voluntaria';
      case 'FIN_DE_CONTRATO': return 'Fin de contrato';
      case 'CESE': return 'Cese';
      default: return tipo;
    }
  }

  getColorTipo(tipo: string): string {
    switch(tipo) {
      case 'RENUNCIA_VOLUNTARIA': return '#6366f1';
      case 'FIN_DE_CONTRATO': return '#f97316';
      case 'CESE': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getIniciales(nombre: string): string {
    if (!nombre) return 'E';
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}