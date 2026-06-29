import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  
  if (
    req.url.includes('/api/v1/auth/login') ||
    req.url.includes('/api/v1/auth/register')
  ) {
    return next(req);
  }

  const authService = inject(Auth);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};