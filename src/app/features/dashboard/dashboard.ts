import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // Datos de las 5 tarjetas superiores
  stats = {
    totalEmpleados: 0,
    activosHoy: 0,
    incidenciasEsteMes: 0,
    incidentesPorResolver: 0,
    documentosPendientes: 0
  };

  // Lista de contratos próximos a vencer
  proximosContratos: any[] = [];

  // Lista de actividad reciente
  actividadReciente: any[] = [];

  // Sucursales disponibles para el filtro
  sucursales: any[] = [];
  sucursalSeleccionada: number | null = null;

  // Datos del usuario logueado
  usuario: any = null;

  cargando = true;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarSucursales();
    this.cargarDashboard();
  }

  cargarSucursales(): void {
    this.http.get<any[]>('http://localhost:8080/api/v1/sucursales').subscribe({
      next: (data) => this.sucursales = data,
      error: () => {}
    });
  }

  cargarDashboard(): void {
    this.cargando = true;
    const url = this.sucursalSeleccionada
      ? `http://localhost:8080/api/v1/dashboard?sucursalId=${this.sucursalSeleccionada}`
      : 'http://localhost:8080/api/v1/dashboard';

    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.stats = {
          totalEmpleados: data.totalEmpleados,
          activosHoy: data.activosHoy,
          incidenciasEsteMes: data.incidenciasEsteMes,
          incidentesPorResolver: data.incidentesPorResolver,
          documentosPendientes: data.documentosPendientes
        };
        this.proximosContratos = data.proximosContratos || [];
        this.actividadReciente = data.actividadReciente || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  filtrarPorSucursal(sucursalId: number | null): void {
    this.sucursalSeleccionada = sucursalId;
    this.cargarDashboard();
  }

  getColorAlerta(color: string): string {
    switch(color) {
      case 'ROJO': return '#ef4444';
      case 'NARANJA': return '#f97316';
      default: return '#22c55e';
    }
  }

  getIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  irAEmpleados(): void {
    this.router.navigate(['/empleados']);
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