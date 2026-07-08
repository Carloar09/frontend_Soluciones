import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-expediente',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './expediente.html',
  styleUrl: './expediente.css'
})
export class Expediente implements OnInit {

  dni: string = '';
  empleado: any = null;
  cargando = true;
  modoEdicion = false;
  editForm: FormGroup;
  usuario: any = null;

  // Subida de documentos
  archivoSeleccionado: File | null = null;
  tipoDocumento: string = 'DNI';
  subiendoDoc = false;

  // Filtro documentos
  filtroTipoDoc: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: [''],
      email: ['', Validators.email],
      direccion: [''],
      contactoEmergencia: [''],
      estado: ['ACTIVO']
    });
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.dni = this.route.snapshot.paramMap.get('dni') || '';
    if (this.dni && this.dni !== 'nuevo') {
      this.cargarExpediente();
    } else {
      this.cargando = false;
      this.modoEdicion = true;
    }
  }

  cargarExpediente(): void {
    this.cargando = true;
    this.http.get<any>(`https://tarea-soluciones-2.onrender.com/api/v1/empleados/expediente/${this.dni}`)
      .subscribe({
        next: (data) => {
          this.empleado = data;
          this.editForm.patchValue({
            nombres: data.nombre,
            apellidos: data.apellidos,
            telefono: data.telefono,
            email: data.email,
            direccion: data.direccion,
            contactoEmergencia: data.contactoEmergencia,
            estado: data.estadoEmpleado
          });
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          this.snackBar.open('No se encontró el empleado', 'Cerrar', { duration: 3000 });
        }
      });
  }

  guardarEdicion(): void {
    if (this.editForm.invalid) return;

    const body = {
      ...this.editForm.value,
      dni: this.empleado.dni,
      sucursalId: this.empleado.sucursalId || 1,
      area: this.empleado.area,
      cargo: this.empleado.cargo,
      fechaIngreso: this.empleado.fechaIngreso,
      fechaVencimiento: this.empleado.fechaVencimiento
    };

    this.http.put<any>(`https://tarea-soluciones-2.onrender.com/api/v1/empleados/${this.empleado.id}`, body)
      .subscribe({
        next: () => {
          this.modoEdicion = false;
          this.cargarExpediente();
          this.snackBar.open('Información actualizada', 'Cerrar', { duration: 2000 });
        },
        error: () => {
          this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
        }
      });
  }

  onArchivoSeleccionado(event: any): void {
    this.archivoSeleccionado = event.target.files[0];
  }

  subirDocumento(): void {
    if (!this.archivoSeleccionado) return;
    this.subiendoDoc = true;

    const formData = new FormData();
    formData.append('dniEmpleado', this.dni);
    formData.append('tipoDocumento', this.tipoDocumento);
    formData.append('archivo', this.archivoSeleccionado);

    this.http.post<any>('https://tarea-soluciones-2.onrender.com/api/v1/documentos/subir', formData)
      .subscribe({
        next: () => {
          this.subiendoDoc = false;
          this.archivoSeleccionado = null;
          this.cargarExpediente();
          this.snackBar.open('Documento subido correctamente', 'Cerrar', { duration: 2000 });
        },
        error: () => {
          this.subiendoDoc = false;
          this.snackBar.open('Error al subir documento', 'Cerrar', { duration: 3000 });
        }
      });
  }

  eliminarDocumento(idDocumento: number): void {
    this.http.delete(`https://tarea-soluciones-2.onrender.com/api/v1/documentos/${idDocumento}`)
      .subscribe({
        next: () => {
          this.cargarExpediente();
          this.snackBar.open('Documento eliminado', 'Cerrar', { duration: 2000 });
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
  }

  descargarDocumento(idDocumento: number, nombreArchivo: string): void {
    this.http.get(`https://tarea-soluciones-2.onrender.com/api/v1/documentos/${idDocumento}/descargar`,
      { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = nombreArchivo;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.snackBar.open('Error al descargar', 'Cerrar', { duration: 3000 });
        }
      });
  }

  get documentosFiltrados(): any[] {
    if (!this.empleado?.documentoDTO) return [];
    if (!this.filtroTipoDoc) return this.empleado.documentoDTO;
    return this.empleado.documentoDTO.filter(
      (d: any) => d.tipoDocumento === this.filtroTipoDoc
    );
  }

  getIniciales(nombre: string): string {
    if (!nombre) return 'E';
    return nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
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

  volver(): void {
    this.router.navigate(['/empleados']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}