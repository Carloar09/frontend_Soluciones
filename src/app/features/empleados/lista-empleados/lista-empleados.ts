import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-lista-empleados',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './lista-empleados.html',
  styleUrl: './lista-empleados.css'
})
export class ListaEmpleados implements OnInit {

  empleados: any[] = [];
  empleadosFiltrados: any[] = [];
  sucursales: any[] = [];
  cargando = true;
  usuario: any = null;

  // Filtros
  filtroEstado: string = 'TODOS';
  sucursalId: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Lee sucursalId si viene desde Sucursales
    this.route.queryParams.subscribe(params => {
      this.sucursalId = params['sucursalId'] ? +params['sucursalId'] : null;
      this.cargarSucursales();
      this.cargarEmpleados();
    });
  }

  cargarSucursales(): void {
    this.http.get<any[]>('https://tarea-soluciones-2.onrender.com/api/v1/sucursales').subscribe({
      next: (data) => this.sucursales = data,
      error: () => {}
    });
  }

  cargarEmpleados(): void {
    this.cargando = true;
    const url = this.sucursalId
      ? `https://tarea-soluciones-2.onrender.com/api/v1/empleados?sucursalId=${this.sucursalId}`
      : 'https://tarea-soluciones-2.onrender.com/api/v1/empleados';

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.empleados = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'TODOS') {
      this.empleadosFiltrados = this.empleados;
    } else {
      this.empleadosFiltrados = this.empleados.filter(
        e => e.estado === this.filtroEstado
      );
    }
  }

  filtrarPorSucursal(event: any): void {
    this.sucursalId = event.target.value || null;
    this.cargarEmpleados();
  }

  getDiasRestantes(fecha: string): number {
    if (!fecha) return 0;
    const hoy = new Date();
    const vence = new Date(fecha);
    return Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  getColorDias(dias: number): string {
    if (dias < 30) return '#ef4444';
    if (dias < 60) return '#f97316';
    return '#22c55e';
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

  irAExpediente(dni: string): void {
    this.router.navigate(['/empleados/expediente', dni]);
  }

  nuevoEmpleado(): void {
  this.router.navigate(['/empleados/nuevo-empleado']);
}

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}