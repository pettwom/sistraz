import { Component, EventEmitter, Output} from '@angular/core';
import { RouterLink, Router, RouterLinkActive  } from '@angular/router';

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
  constructor(private router: Router){}
  
  seleccionarMenu(titulo:string, subtitulo:string):void{
    this.textoSeleccionado.emit({ titulo, subtitulo });
  }

  cerrarMenu() {
    this.closeMenu.emit();
  }

  cerrarSession(event: Event){
    event.preventDefault();
    this.router.navigate(['/login'])
  }
}
