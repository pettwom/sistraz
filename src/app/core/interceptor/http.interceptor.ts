import {HttpInterceptorFn} from '@angular/common/http';

import {inject} from '@angular/core';

import {Router} from '@angular/router';

import {
  catchError,
  finalize,
  throwError
} from 'rxjs';

import { LoadingService } from '../../services/loading.services';


export const httpInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  const loadingService = inject(LoadingService);


  // =====================================================
  // MOSTRAR LOADING
  // =====================================================

  loadingService.show();


  // =====================================================
  // OBTENER TOKEN
  // =====================================================

  const token = localStorage.getItem('token');


  // =====================================================
  // RUTAS QUE NO NECESITAN TOKEN
  // =====================================================

  const urlsSinToken = [

    '/api/login',

    '/api/auth/login',

    '/api/refresh-token'

  ];


  const excluirToken = urlsSinToken.some(url =>
    req.url.includes(url)
  );


  // =====================================================
  // REQUEST ORIGINAL
  // =====================================================

  let request = req;


  // =====================================================
  // AGREGAR TOKEN
  // =====================================================

  if (token && !excluirToken) {

    request = req.clone({

      setHeaders: {

        Authorization: `Bearer ${token}`,

        Accept: 'application/json'

      }

    });

  }


  // =====================================================
  // MOSTRAR PETICIÓN EN CONSOLA
  // =====================================================

  console.log(
    'HTTP REQUEST:',
    request.method,
    request.url
  );


  // =====================================================
  // ENVIAR PETICIÓN
  // =====================================================

  return next(request).pipe(


    // ===================================================
    // MANEJO DE ERRORES
    // ===================================================

    catchError((error) => {

      console.error(
        'HTTP ERROR:',
        error.status,
        error
      );


      switch (error.status) {


        // ===============================================
        // 400
        // ===============================================

        case 400:

          console.error(
            'Solicitud incorrecta'
          );

          break;


        // ===============================================
        // 401
        // ===============================================

        case 401:

          console.error(
            'Sesión no autorizada o expirada'
          );

          localStorage.removeItem('token');

          loadingService.reset();

          router.navigate(['/login']);

          break;


        // ===============================================
        // 403
        // ===============================================

        case 403:

          console.error(
            'No tiene permisos'
          );

          break;


        // ===============================================
        // 404
        // ===============================================

        case 404:

          console.error(
            'Recurso no encontrado'
          );

          break;


        // ===============================================
        // 500
        // ===============================================

        case 500:

          console.error(
            'Error interno del servidor'
          );

          break;


        // ===============================================
        // OTROS ERRORES
        // ===============================================

        default:

          console.error(
            'Error HTTP no controlado'
          );

          break;

      }


      return throwError(
        () => error
      );

    }),


    // ===================================================
    // OCULTAR LOADING AL FINALIZAR
    // ===================================================

    finalize(() => {

      loadingService.hide();

      console.log(
        'HTTP FINALIZADO:',
        request.url
      );

    })

  );

};