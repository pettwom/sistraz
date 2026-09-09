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

  abrirMenu() {
    console.log('navbar: click')
    this.toggleMenu.emit();
  }

  cambiarTema(): void {

    this.themeService.toggleDarkMode();

  }
   confirm(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Save your current process?',
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }
}
