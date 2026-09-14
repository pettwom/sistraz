import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemesService {
  private readonly STORAGE_KEY = 'sistraz-theme';
  darkMode = signal<boolean>(false);
  constructor() {
    this.cargarTema();
  }
  toggleDarkMode(): void {
    const nuevoEstado = !this.darkMode();
    this.darkMode.set(nuevoEstado);
    this.aplicarTema(nuevoEstado);
  }
  public cargarTema(): void {
    const temaGuardado = localStorage.getItem(this.STORAGE_KEY);
    const html = document.documentElement;
    if (temaGuardado === 'dark') {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
    const esOscuro = temaGuardado === 'dark';
    this.darkMode.set(esOscuro);
    this.aplicarTema(esOscuro);
    console.log(esOscuro, 'en themes.service');

  }
  private aplicarTema(esOscuro: boolean): void {
    const html = document.documentElement;
    // Animación de salida
    html.animate(
      [
        { opacity: 1 },
        { opacity: 0.7 }
      ],
      {
        duration: 200,
        easing: 'ease-in',
        fill: 'forwards'
      }
    );
    if (esOscuro) {
      const html = document.documentElement;



      setTimeout(() => {

        // Cambiar a modo oscuro
        html.classList.add('dark-mode');
        localStorage.setItem(this.STORAGE_KEY, 'dark');

        // Animación de entrada
        html.animate(
          [
            { opacity: 0.2 },
            { opacity: 1 }
          ],
          {
            duration: 800,
            easing: 'ease-out',
            fill: 'forwards'
          }
        );

      }, 400);
      // html.classList.add('dark-mode');
      // localStorage.setItem(this.STORAGE_KEY, 'dark');
    } else {
      setTimeout(() => {
        html.classList.remove('dark-mode');
        localStorage.setItem(this.STORAGE_KEY, 'light');
        // Animación de entrada
        html.animate(
          [
            { opacity: 0.3 },
            { opacity: 1 }
          ],
          {
            duration: 800,
            easing: 'ease-out',
            fill: 'forwards'
          }
        );
      }, 200);
      // html.classList.remove('dark-mode');
      // localStorage.setItem(this.STORAGE_KEY, 'light');
    }
  }
}