
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest{
  nombre: string;
  email: string;
  password: string;
  rol: 'RECURSOS_HUMANOS' | 'CONTABILIDAD' | 'GERENTE';
}
export interface AuthResponse {
  token: string;
  nombre: string;
  email: string;
  rol: string;
  mensaje: string;
}
