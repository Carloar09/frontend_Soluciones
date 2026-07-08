import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm: FormGroup;
  registerForm: FormGroup;
  mostrarPassword = false;
  cargando = false;
  modoRegistro = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['RECURSOS_HUMANOS', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.invalid) return;
    this.cargando = true;

    this.http.post<any>('https://tarea-soluciones-2.onrender.com/api/v1/auth/login', this.loginForm.value)
      .subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', JSON.stringify({
            nombre: response.nombre,
            email: response.email,
            rol: response.rol
          }));
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.cargando = false;
          this.snackBar.open(
            err.error?.mensaje || 'Credenciales incorrectas',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
  }

  registrar(): void {
    if (this.registerForm.invalid) return;
    this.cargando = true;

    this.http.post<any>('https://tarea-soluciones-2.onrender.com/api/v1/auth/register', this.registerForm.value)
      .subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', JSON.stringify({
            nombre: response.nombre,
            email: response.email,
            rol: response.rol
          }));
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.cargando = false;
          this.snackBar.open(
            err.error?.mensaje || 'Error al registrar',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
  }

  toggleModo(): void {
    this.modoRegistro = !this.modoRegistro;
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }
}