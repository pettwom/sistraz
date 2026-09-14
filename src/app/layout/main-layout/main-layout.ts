import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';
import { Loading } from '../../shared/loading/loading';
import { ImportsModule } from '../../imports';
import { LoadingService } from '../../services/loading.services';
import { ThemesService } from '../../services/themes.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,

  imports: [
    RouterOutlet,
    Sidebar,
    Navbar,
    Loading,
    ImportsModule
  ],

  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit {
  menuAbierto = false;
  // Servicio global del loading
  loadingService = inject(LoadingService);
  constructor(
    private themesService: ThemesService
  ){}

  ngOnInit(): void {
    this.themesService.inicializarTema()
  }
  tituloNavbar: string = 'Panel Principal';
  subtituloNavbar: string = 'Resumen ejecutivo del control y flujo de Gas Licuado de Petróleo';

  recibirTexto(evento: { titulo: string, subtitulo: string }) {
    this.tituloNavbar = evento.titulo;
    this.subtituloNavbar = evento.subtitulo;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }
}