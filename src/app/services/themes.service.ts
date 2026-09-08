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
  private cargarTema(): void {
    const temaGuardado = localStorage.getItem(this.STORAGE_KEY);
    const esOscuro = temaGuardado === 'dark';
    this.darkMode.set(esOscuro);
    this.aplicarTema(esOscuro);
  }
  private aplicarTema(esOscuro: boolean): void {
    const html = document.documentElement;
    if (esOscuro) {
      html.classList.add('dark-mode');
      localStorage.setItem(this.STORAGE_KEY, 'dark');
    } else {
      html.classList.remove('dark-mode');
      localStorage.setItem(this.STORAGE_KEY, 'light');
    }
  }
}