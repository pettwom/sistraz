import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.obtenerToken();

  let request = req;

  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {

        console.warn('Sesión expirada');

        // Mata completamente la sesión
        authService.logout();

        // Evita que pueda volver con "Atrás"
        router.navigateByUrl('/login', {
          replaceUrl: true
        });
      }

      return throwError(() => error);
    })

  );
};