import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

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
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  loginForm: FormGroup;
  registerForm: FormGroup;
  mostrarPassword = false;
  cargando = false;
  modoRegistro = false;

  constructor(
     private fb: FormBuilder,
     private authService: Auth,
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

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
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

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
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