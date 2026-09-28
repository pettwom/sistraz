import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class MensajesService {
  mensaje(title: string, icon: SweetAlertIcon, mensaje: string) {
    Swal.fire({
      title: title,
      icon: icon,
      html: mensaje,
      showCancelButton: false,
      showConfirmButton: false,
      timer: 2000,
      willOpen: () => {
        Swal.getContainer()?.style.setProperty('z-index', '99999');
      }
    });
  }
}
