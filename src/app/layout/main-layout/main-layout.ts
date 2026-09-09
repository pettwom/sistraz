import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';
import { Loading } from '../../shared/loading/loading';
import { ImportsModule } from '../../imports';
import { LoadingService } from '../../services/loading.services';


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
export class MainLayout {
  menuAbierto = false;
  // Servicio global del loading
  loadingService = inject(LoadingService);
  tituloNavbar:string = '';
  subtituloNavbar:string = '';

  cambiarTitulos(evento:{titulo:string, subtitulo:string}){
    console.log(evento.titulo, ',',evento.subtitulo,'<=== mainlayout');
    
    this.tituloNavbar = evento.titulo;
    this.subtituloNavbar = evento.subtitulo;
  }

  toggleMenu() {
    console.log('main-layout recibió evento');

    this.menuAbierto = !this.menuAbierto;

    console.log('menuAbierto:', this.menuAbierto);
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }
}