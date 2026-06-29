import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.css'
})
export class Sucursales implements OnInit {

  sucursales: any[] = [];
  cargando = true;
  usuario: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.http.get<any[]>('http://localhost:8080/api/v1/sucursales').subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  getIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  irAEmpleados(sucursalId: number): void {
    this.router.navigate(['/empleados'], { queryParams: { sucursalId } });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}