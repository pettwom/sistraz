import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import {
  catchError,
  finalize,
  throwError
} from 'rxjs';

import {
  LoadingService
} from '../../services/loading.services';


export const httpInterceptor: HttpInterceptorFn =
  (req, next) => {

    // =====================================================
    // SERVICIOS
    // =====================================================

    const router = inject(Router);

    const loadingService = inject(LoadingService);

    const endpointsIgnorados: string[] = [
      '/Auth/estado'
    ];

    const ignorarInterceptor =
      endpointsIgnorados.some(
        endpoint =>
          req.url
            .toLowerCase()
            .includes(endpoint.toLowerCase())
      );

    // =====================================================
    // SI ES Auth/estado NO HACER NADA
    // =====================================================

    if (ignorarInterceptor) {
      return next(req);
    }
    

    // =====================================================
    // RUTAS ANGULAR QUE NO MOSTRARÁN MENSAJES GLOBALES
    // =====================================================
    //
    // Esto corresponde a rutas del FRONTEND:
    //
    // /produccion
    // /transporte
    // etc.
    //
    // Si NO quieres excluir una pantalla completa,
    // simplemente deja el array vacío.
    // =====================================================

    const rutasSinMensajes: string[] = [

      // '/produccion'

    ];


    const omitirPorRuta =
      rutasSinMensajes.some(
        ruta =>
          router.url.startsWith(ruta)
      );


    // =====================================================
    // DETERMINAR SI SE OMITEN MENSAJES
    // =====================================================

    const omitirMensajes =
      ignorarInterceptor ||
      omitirPorRuta;


    // =====================================================
    // MOSTRAR LOADING
    // =====================================================

    loadingService.show();


    // =====================================================
    // OBTENER TOKEN
    // =====================================================

    const token =
      localStorage.getItem('token');


    // =====================================================
    // ENDPOINTS QUE NO NECESITAN TOKEN
    // =====================================================

    const urlsSinToken: string[] = [

      '/api/login',

      '/api/auth/login',

      '/Auth/login',

      '/api/refresh-token'

    ];


    const excluirToken =
      urlsSinToken.some(
        url =>
          req.url
            .toLowerCase()
            .includes(
              url.toLowerCase()
            )
      );


    // =====================================================
    // REQUEST ORIGINAL
    // =====================================================

    let request = req;


    // =====================================================
    // AGREGAR TOKEN JWT
    // =====================================================

    if (
      token &&
      !excluirToken
    ) {

      request = req.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`,

          Accept:
            'application/json'

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

      catchError(
        (error: HttpErrorResponse) => {


          console.error(
            'HTTP ERROR:',
            error.status,
            error
          );


          // =================================================
          // 401 - SESIÓN EXPIRADA
          // =================================================
          //
          // IMPORTANTE:
          //
          // El 401 NUNCA se ignora.
          //
          // Aunque el endpoint esté dentro de:
          //
          // endpointsSinMensajes
          //
          // igualmente debemos cerrar la sesión.
          // =================================================

          if (error.status === 401) {

            console.error(
              'Sesión no autorizada o expirada'
            );


            // ===============================================
            // MATAR SESIÓN DEL FRONTEND
            // ===============================================

            localStorage.clear();


            // ===============================================
            // REINICIAR LOADING
            // ===============================================

            loadingService.reset();


            // ===============================================
            // REDIRECCIONAR AL LOGIN
            // ===============================================

            router.navigateByUrl(
              '/login',
              {
                replaceUrl: true
              }
            );


            // ===============================================
            // DEVOLVER ERROR
            // ===============================================

            return throwError(
              () => error
            );

          }


          // =================================================
          // OMITIR MENSAJES GLOBALES
          // =================================================
          //
          // Aquí entrará, por ejemplo:
          //
          // /prod/addProd
          //
          // El interceptor NO mostrará el mensaje.
          //
          // El error continuará hacia el componente.
          // =================================================

          if (omitirMensajes) {

            console.log(
              'Mensaje global omitido:',
              request.url
            );


            return throwError(
              () => error
            );

          }


          // =================================================
          // MANEJO GLOBAL DE ERRORES
          // =================================================

          switch (error.status) {


            // ===============================================
            // 400 - BAD REQUEST
            // ===============================================

            case 400:

              console.error(
                'Solicitud incorrecta'
              );

              break;


            // ===============================================
            // 403 - FORBIDDEN
            // ===============================================

            case 403:

              console.error(
                'No tiene permisos para realizar esta acción'
              );

              break;


            // ===============================================
            // 404 - NOT FOUND
            // ===============================================

            case 404:

              console.error(
                'Recurso no encontrado'
              );

              break;


            // ===============================================
            // 408 - TIMEOUT
            // ===============================================

            case 408:

              console.error(
                'Tiempo de espera agotado'
              );

              break;


            // ===============================================
            // 500 - INTERNAL SERVER ERROR
            // ===============================================

            case 500:

              console.error(
                'Error interno del servidor'
              );

              break;


            // ===============================================
            // 502 - BAD GATEWAY
            // ===============================================

            case 502:

              console.error(
                'Error de comunicación con el servidor'
              );

              break;


            // ===============================================
            // 503 - SERVICE UNAVAILABLE
            // ===============================================

            case 503:

              console.error(
                'Servicio no disponible'
              );

              break;


            // ===============================================
            // OTROS ERRORES
            // ===============================================

            default:

              console.error(
                'Error HTTP no controlado:',
                error.status
              );

              break;

          }


          // =================================================
          // DEVOLVER ERROR AL COMPONENTE
          // =================================================

          return throwError(
            () => error
          );

        }
      ),


      // ===================================================
      // OCULTAR LOADING
      // ===================================================
      //
      // finalize se ejecuta:
      //
      // ✓ cuando la petición termina correctamente
      // ✓ cuando existe un error
      // ✓ cuando existe un 401
      //
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