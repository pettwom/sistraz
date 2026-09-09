import {
  Component, EventEmitter,
  inject,
  Output,
  ViewChild
} from '@angular/core';
import { Perfil } from '../../pages/perfil/perfil';
import { RouterLink } from '@angular/router';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectionService } from '../../services/connection.services';
import { ThemesService } from '../../services/themes.service';
import { ImportsModule } from '../../imports';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopup, ConfirmPopupModule  } from 'primeng/confirmpopup';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ImportsModule, ConfirmPopupModule,ConfirmPopup],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  providers: [ConfirmationService, MessageService]
})
export class Navbar {
  @Output()
  @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;
    constructor(private confirmationService: ConfirmationService, private messageService: MessageService) { }

  toggleMenu = new EventEmitter<void>();
  isOnline: boolean = navigator.onLine;
  networkStatus$: Subscription = Subscription.EMPTY;
  connection = inject(ConnectionService)
  themeService = inject(ThemesService);
notificaciones = [
    {
      id: 1,
      titulo: 'Nuevo despacho registrado',
      mensaje: 'Se registró el despacho N° 000152.',
      fecha: 'Hace 5 minutos',
      icono: 'pi pi-truck'
    },
    {
      id: 2,
      titulo: 'Certificado pendiente',
      mensaje: 'Existe un certificado de calidad pendiente de revisión.',
      fecha: 'Hace 15 minutos',
      icono: 'pi pi-file'
    },
    {
      id: 3,
      titulo: 'Nueva recepción',
      mensaje: 'La cisterna LP-1254 fue recepcionada en planta.',
      fecha: 'Hace 30 minutos',
      icono: 'pi pi-inbox'
    }
  ];
  abrirMenu() {
    console.log('navbar: click')
    this.toggleMenu.emit();
  }

  cambiarTema(): void {

    this.themeService.toggleDarkMode();

  }
  mostrarNotificaciones(event: Event) {

    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,

      // No queremos botones de confirmación
      acceptVisible: false,
      rejectVisible: false,

      // Tampoco necesitamos mensaje estándar
      message: ''
    });
  }

  //  confirm(event: Event) {
  //       this.confirmationService.confirm({
  //           target: event.target as EventTarget,
  //           message: 'Save your current process?',
  //           accept: () => {
  //               this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
  //           },
  //           reject: () => {
  //               this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
  //           }
  //       });
  //   }
}
