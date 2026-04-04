import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Country } from '../../../core/models/country.model';

@Component({
  selector: 'app-country-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryCardComponent {
  readonly country = input.required<Country>();

  detailLink(c: Country): string {
    return `/countries/${encodeURIComponent(c.cca2)}`;
  }
}
