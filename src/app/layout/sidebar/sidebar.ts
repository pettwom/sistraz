import { Component, EventEmitter, Output} from '@angular/core';
import { RouterLink, Router, RouterLinkActive  } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Output() closeMenu = new EventEmitter<void>();
  @Output() textoSeleccionado = new EventEmitter<{
    titulo: string;
    subtitulo: string;
  }>();
  
  titulo: string = '';
  constructor(private router: Router, private login: AuthService){}
  
  seleccionarMenu(titulo:string, subtitulo:string):void{
    this.textoSeleccionado.emit({ titulo, subtitulo });
  }

  cerrarMenu() {
    this.closeMenu.emit();
  }

  cerrarSession(event: Event){
    event.preventDefault();
    this.login.logout();
    this.router.navigate(['/login'])
  }
}
