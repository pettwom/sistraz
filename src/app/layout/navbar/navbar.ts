import { Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { Perfil } from '../../pages/perfil/perfil';
import { RouterLink } from '@angular/router';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectionService } from '../../services/connection.services';
import { ThemesService } from '../../services/themes.service';
import { ImportsModule } from '../../imports';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ImportsModule, ConfirmPopupModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  providers: [ConfirmationService, MessageService],
})
export class Navbar {
  // ==========================================
  // EVENTO PARA ABRIR / CERRAR SIDEBAR
  // ==========================================

  @Output()
  toggleMenu = new EventEmitter<void>();

  notificaciones = [
    {
      id: 1,
      titulo: 'Nuevo despacho registrado',
      mensaje: 'Se registró correctamente el despacho N° 000152.',
      fecha: 'Hace 5 minutos',
      icono: 'pi pi-truck',
    },
    {
      id: 2,
      titulo: 'Certificado pendiente',
      mensaje: 'Existe un certificado de calidad pendiente de revisión.',
      fecha: 'Hace 15 minutos',
      icono: 'pi pi-file',
    },
    {
      id: 3,
      titulo: 'Nueva recepción',
      mensaje: 'La cisterna LP-1254 fue recepcionada correctamente en planta.',
      fecha: 'Hace 30 minutos',
      icono: 'pi pi-inbox',
    },
  ];
  // ==========================================
  // SERVICIOS
  // ==========================================

  connection = inject(ConnectionService);

  themeService = inject(ThemesService);

  private confirmationService = inject(ConfirmationService);

  private messageService = inject(MessageService);

  // ==========================================
  // ABRIR MENÚ
  // ==========================================

  abrirMenu(): void {
    console.log('navbar: click');

    this.toggleMenu.emit();
  }

  // ==========================================
  // CAMBIAR TEMA
  // ==========================================

  cambiarTema(): void {
    this.themeService.toggleDarkMode();
  }

  // ==========================================
  // NOTIFICACIONES
  // ==========================================

  confirm(event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,

      message: 'Save your current process?',

      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'You have accepted',
          life: 3000,
        });
      },

      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
          life: 3000,
        });
      },
    });
  }
  mostrarNotificaciones(event: Event): void {

  this.confirmationService.confirm({
    target: event.currentTarget as EventTarget,
    message: '',
    acceptVisible: false,
    rejectVisible: false,
    defaultFocus: 'none'
  });

}
}
