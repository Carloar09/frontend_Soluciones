import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './busqueda.html',
  styleUrl: './busqueda.css'
})
export class Busqueda {

  dniBusqueda = '';
  buscando = false;
  empleadoEncontrado: any = null;
  buscado = false;
  usuario: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  }

  buscar(): void {
    if (!this.dniBusqueda.trim()) return;
    this.buscando = true;
    this.empleadoEncontrado = null;
    this.buscado = false;

    this.http.get<any>(`https://tarea-soluciones-2.onrender.com/api/v1/empleados/expediente/${this.dniBusqueda.trim()}`)
      .subscribe({
        next: (data) => {
          this.empleadoEncontrado = data;
          this.buscando = false;
          this.buscado = true;
        },
        error: () => {
          this.buscando = false;
          this.buscado = true;
          this.empleadoEncontrado = null;
        }
      });
  }

  verExpediente(): void {
    this.router.navigate(['/empleados/expediente', this.empleadoEncontrado.dni]);
  }

  registrarIncidencia(): void {
    this.router.navigate(['/incidencias'], {
      queryParams: { dni: this.empleadoEncontrado.dni }
    });
  }

  iniciarSalida(): void {
    this.router.navigate(['/salidas'], {
      queryParams: { dni: this.empleadoEncontrado.dni }
    });
  }

  getColorEstado(estado: string): string {
    switch(estado) {
      case 'ACTIVO': return '#22c55e';
      case 'INACTIVO': return '#6b7280';
      case 'PERMISO': return '#f97316';
      case 'EX_EMPLEADO': return '#ef4444';
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