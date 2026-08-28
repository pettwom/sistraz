import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(
    private http: HttpClient
  ) { }

  login(datos: any): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/login`,
      datos
    );

  }

  guardarToken(token: string) {

    localStorage.setItem(
      'token',
      token
    );

  }

  obtenerToken() {

    return localStorage.getItem(
      'token'
    );

  }

  estaAutenticado(): boolean {

    return !!this.obtenerToken();

  }

  logout() {

    localStorage.removeItem(
      'token'
    );

  }

}