import {
  Component, EventEmitter,
  inject,
  Output
} from '@angular/core';
import { Perfil } from '../../pages/perfil/perfil';
import { RouterLink } from '@angular/router';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectionService } from '../../services/connection.services';
import { ThemesService } from '../../services/themes.service';


@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Output()
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
}
