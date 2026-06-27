import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};