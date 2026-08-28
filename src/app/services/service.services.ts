import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceServices {

  private readonly baseUrl = environment.base_url;

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // CONSTRUIR URL
  // =====================================================

  private buildUrl(
    endpoint: string
  ): string {

    // Si ya viene una URL completa, no la modifica
    if (
      endpoint.startsWith('http://') ||
      endpoint.startsWith('https://')
    ) {
      return endpoint;
    }

    const base =
      this.baseUrl.replace(/\/+$/, '');

    const path =
      endpoint.replace(/^\/+/, '');

    return `${base}/${path}`;
  }


  // =====================================================
  // GET
  // =====================================================

  get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Observable<T> {

    const url =
      this.buildUrl(endpoint);

    let httpParams =
      new HttpParams();

    if (params) {

      Object.keys(params).forEach(key => {

        const value = params[key];

        if (
          value !== null &&
          value !== undefined
        ) {

          httpParams =
            httpParams.set(
              key,
              String(value)
            );

        }

      });

    }

    return this.http.get<T>(
      url,
      {
        params: httpParams
      }
    );
  }


  // =====================================================
  // GET URL COMPLETA
  // =====================================================

  getExternal<T>(
    url: string
  ): Observable<T> {

    return this.http.get<T>(url);

  }


  // =====================================================
  // POST
  // =====================================================

  post<T>(
    endpoint: string,
    data: unknown
  ): Observable<T> {

    const url =
      this.buildUrl(endpoint);

    return this.http.post<T>(
      url,
      data
    );

  }


  // =====================================================
  // PUT
  // =====================================================

  put<T>(
    endpoint: string,
    data: unknown
  ): Observable<T> {

    const url =
      this.buildUrl(endpoint);

    return this.http.put<T>(
      url,
      data
    );

  }


  // =====================================================
  // PATCH
  // =====================================================

  patch<T>(
    endpoint: string,
    data: unknown
  ): Observable<T> {

    const url =
      this.buildUrl(endpoint);

    return this.http.patch<T>(
      url,
      data
    );

  }


  // =====================================================
  // DELETE
  // =====================================================

  delete<T>(
    endpoint: string
  ): Observable<T> {

    const url =
      this.buildUrl(endpoint);

    return this.http.delete<T>(
      url
    );

  }


  // =====================================================
  // DOWNLOAD
  // =====================================================

  download(
    endpoint: string
  ): Observable<Blob> {

    const url =
      this.buildUrl(endpoint);

    return this.http.get(
      url,
      {
        responseType: 'blob'
      }
    );

  }

}