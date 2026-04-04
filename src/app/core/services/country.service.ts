import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Country } from '../models/country.model';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly http = inject(HttpClient);
  private readonly root = `${environment.apiBaseUrl}/api/countries`;

  private readonly cacheAll = signal<Country[] | null>(null);

  readonly cachedCountries = this.cacheAll.asReadonly();

  getAll(forceRefresh = false): Observable<Country[]> {
    if (!forceRefresh) {
      const cached = this.cacheAll();
      if (cached) {
        return of(cached);
      }
    }
    return this.http.get<Country[]>(this.root).pipe(
      tap((list) => this.cacheAll.set(list)),
      catchError((e) => this.mapError(e)),
    );
  }

  getByCode(code: string): Observable<Country> {
    const c = encodeURIComponent(code.trim());
    return this.http.get<Country>(`${this.root}/${c}`).pipe(catchError((e) => this.mapError(e)));
  }

  searchByName(name: string): Observable<Country[]> {
    const q = encodeURIComponent(name.trim());
    return this.http.get<Country[]>(`${this.root}/name/${q}`).pipe(catchError((e) => this.mapError(e)));
  }

  getByRegion(region: string): Observable<Country[]> {
    const r = encodeURIComponent(region.trim());
    return this.http.get<Country[]>(`${this.root}/region/${r}`).pipe(catchError((e) => this.mapError(e)));
  }

  clearCache(): void {
    this.cacheAll.set(null);
  }

  private mapError(err: unknown): Observable<never> {
    let message = 'Something went wrong';
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.trim()) {
        message = body;
      } else if (body && typeof body === 'object' && 'message' in body && typeof (body as { message: unknown }).message === 'string') {
        message = (body as { message: string }).message;
      } else {
        message = err.message || `HTTP ${err.status}`;
      }
    } else if (err instanceof Error) {
      message = err.message;
    }
    return throwError(() => new Error(message));
  }
}
