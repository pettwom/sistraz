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

  abrirMenu() {
    console.log('navbar: click')
    this.toggleMenu.emit();
  }

  connection = inject(ConnectionService)
}
