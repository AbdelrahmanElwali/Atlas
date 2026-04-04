import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-country-card-skeleton',
  standalone: true,
  templateUrl: './country-card-skeleton.component.html',
  styleUrl: './country-card-skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryCardSkeletonComponent {}
