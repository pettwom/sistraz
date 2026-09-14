import { Injectable, signal } from '@angular/core';

export interface MenuOption {
  idMenu: number;
  titulo: string;
  enlace: string | null;
  idMenuPadre: number | null;
  icono: string | null;
  orden: number;
  descripcion: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MenuStateService {

  private _menu = signal<MenuOption[]>(this.cargarMenuStorage());

  readonly menu = this._menu.asReadonly();

  setMenu(menu: MenuOption[]): void {
    this._menu.set(menu);

    localStorage.setItem(
      'MenuOption',
      JSON.stringify(menu)
    );
  }

  limpiarMenu(): void {
    this._menu.set([]);
    localStorage.removeItem('MenuOption');
  }

  private cargarMenuStorage(): MenuOption[] {
    const data = localStorage.getItem('MenuOption');

    if (!data) {
      return [];
    }

    try {
      const menu = JSON.parse(data);

      return Array.isArray(menu)
        ? menu
        : [];
    }
    catch {
      return [];
    }
  }
}