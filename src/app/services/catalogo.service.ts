import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SelectOption {
  id: number;
  codigo: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {

  private readonly base_url = environment.base_url
  

  constructor(private http: HttpClient) {}

  getPlantas(): Observable<SelectOption[]> {
    return this.http.get<SelectOption[]>(
      `${this.base_url}/Catalogo/params`
    );
  }
}