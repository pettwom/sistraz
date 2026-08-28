import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, catchError, of } from 'rxjs';

import { environment } from '../../environments/environment';

export type ConnectionStatus =
  | 'online'
  | 'backend-offline'
  | 'offline';


@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  estado = signal<ConnectionStatus>('online');

  private subscription?: Subscription;

  private readonly backendUrl =
    environment.base_url;


  constructor(
    private http: HttpClient
  ) {

    this.inicializar();

  }


  private inicializar(): void {

    // Estado inicial
    this.verificarConexion();


    // Detectar cuando se pierde la red
    window.addEventListener(
      'offline',
      () => {

        this.estado.set('offline');

      }
    );


    // Detectar cuando vuelve la red
    window.addEventListener(
      'online',
      () => {

        this.verificarConexion();

      }
    );


    // Verificar backend periódicamente
    this.subscription = interval(
      15000
    ).subscribe(() => {

      this.verificarConexion();

    });

  }


  verificarConexion(): void {

    // Primero verificar conectividad del navegador
    if (!navigator.onLine) {

      this.estado.set('offline');

      return;

    }


    // Hay red, ahora verificamos el backend

    this.http.get(
      `${this.backendUrl}/health`,
      {
        observe: 'response'
      }
    )
    .pipe(

      catchError(() => {

        this.estado.set(
          'backend-offline'
        );

        return of(null);

      })

    )
    .subscribe(response => {

      if (response) {

        this.estado.set(
          'online'
        );

      }

    });

  }


  get estaOnline(): boolean {

    return this.estado() === 'online';

  }


  get backendDisponible(): boolean {

    return (
      this.estado() !==
      'backend-offline'
    );

  }

}