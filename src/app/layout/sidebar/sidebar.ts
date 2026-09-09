import { Component, EventEmitter, Output} from '@angular/core';
import { RouterLink, Router, RouterLinkActive  } from '@angular/router';
interface TextoMenu {
titulo: string;
subtitulo: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Output() closeMenu = new EventEmitter<void>();
  @Output() textoSeleccionado = new EventEmitter<TextoMenu>();
  
  titulo: string = '';
  constructor(private router: Router){}
  
  seleccionarMenu(titulo:string, subtitulo:string):void{
    const textoMenu: TextoMenu = { titulo, subtitulo };
    this.textoSeleccionado.emit(textoMenu);
    console.log('===>', titulo, subtitulo, '<====');
  }
  cerrarMenu() {
    this.closeMenu.emit();
  }

  cerrarSession(event: Event){
    event.preventDefault();
    this.router.navigate(['/login'])
  }
}
