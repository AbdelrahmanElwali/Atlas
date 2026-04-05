import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Atlas — World countries',
  },
  {
    path: 'countries',
    loadComponent: () =>
      import('./features/countries/countries-list.component').then((m) => m.CountriesListComponent),
    title: 'Countries',
  },
  {
    path: 'countries/:code',
    loadComponent: () =>
      import('./features/countries/country-detail.component').then((m) => m.CountryDetailComponent),
    title: 'Country',
  },
  {
    path: 'docs',
    loadComponent: () => import('./features/api-docs/api-docs.component').then((m) => m.ApiDocsComponent),
    title: 'API documentation',
  },
  { path: '**', redirectTo: '' },
];
