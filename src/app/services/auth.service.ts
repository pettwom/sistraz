import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../core/models/login-response.model';
import { Usuario } from '../core/models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.base_url;
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'usuario';
  usuario = signal<Usuario | null>(this.obtenerUsuarioStorage());
  constructor(
    private http: HttpClient
  ) { }

  login(usuario: string, password: string): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, { usuario, password })
      .pipe(tap(response => {
        if (response.exito) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
          this.usuario.set(response.usuario)
        }
      }));

  }

  logout() {

    localStorage.removeItem(
      this.TOKEN_KEY
    );
    localStorage.removeItem(
      this.USER_KEY
    );
    localStorage.clear();
    this.usuario.set(null);

  }

  obtenerToken(): string | null {

    return localStorage.getItem(this.TOKEN_KEY);

  }

  estaAutenticado(): boolean {

    return !!this.obtenerToken();

  }

  private obtenerUsuarioStorage(): Usuario | null {
    const dato = localStorage.getItem(this.USER_KEY);
    if(!dato)return null;
    try {
      return JSON.parse(dato) as Usuario;
    } catch {
      return null;
    }
  }

}