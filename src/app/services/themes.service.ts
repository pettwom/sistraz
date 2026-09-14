import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemesService {

  private readonly STORAGE_KEY = 'theme';

  darkMode = signal<boolean>(true);

  constructor() {
    this.inicializarTema();
  }

  inicializarTema(): void {

    const html = document.documentElement;

    const temaGuardado =
      localStorage.getItem(this.STORAGE_KEY);

    // Si nunca se guardó un tema,
    // arrancar en modo oscuro
    if (temaGuardado === null) {

      html.classList.add('dark-mode');

      localStorage.setItem(
        this.STORAGE_KEY,
        'dark'
      );

      this.darkMode.set(true);

      return;
    }

    // Si estaba guardado dark
    if (temaGuardado === 'dark') {

      html.classList.add('dark-mode');

      this.darkMode.set(true);

    } else {

      html.classList.remove('dark-mode');

      this.darkMode.set(false);
    }
  }

  toggleDarkMode(): void {

    const html = document.documentElement;

    const nuevoEstado =
      !this.darkMode();

    if (nuevoEstado) {

      html.classList.add('dark-mode');

      localStorage.setItem(
        this.STORAGE_KEY,
        'dark'
      );

    } else {

      html.classList.remove('dark-mode');

      localStorage.setItem(
        this.STORAGE_KEY,
        'light'
      );
    }

    this.darkMode.set(nuevoEstado);
  }

}