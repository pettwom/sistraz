import {Injectable,signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private peticionesActivas = 0;

  cargando = signal(false);


  show(): void {

    this.peticionesActivas++;

    this.cargando.set(true);

  }


  hide(): void {

    if (this.peticionesActivas > 0) {
      this.peticionesActivas--;
    }

    if (this.peticionesActivas === 0) {
      this.cargando.set(false);
    }

  }


  reset(): void {

    this.peticionesActivas = 0;

    this.cargando.set(false);

  }

}