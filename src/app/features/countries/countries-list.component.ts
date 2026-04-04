import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Country } from '../../core/models/country.model';
import { CountryService } from '../../core/services/country.service';
import { CountryCardComponent } from '../../shared/components/country-card/country-card.component';
import { CountryCardSkeletonComponent } from '../../shared/components/country-card-skeleton/country-card-skeleton.component';
import { ErrorPanelComponent } from '../../shared/components/error-panel/error-panel.component';
import { ObserveVisibilityDirective } from '../../shared/directives/observe-visibility.directive';

@Component({
  selector: 'app-countries-list',
  standalone: true,
  imports: [
    RouterLink,
    CountryCardComponent,
    CountryCardSkeletonComponent,
    ErrorPanelComponent,
    ObserveVisibilityDirective,
  ],
  templateUrl: './countries-list.component.html',
  styleUrl: './countries-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountriesListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly countryService = inject(CountryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly countries = signal<Country[]>([]);
  readonly regions = signal<string[]>([]);
  readonly searchActive = signal(false);
  readonly activeSearch = signal('');

  readonly pageSize = 24;
  readonly visibleCount = signal(24);
  readonly selectedRegion = signal<string | null>(null);

  readonly filtered = computed(() => {
    const list = this.countries();
    const r = this.selectedRegion();
    if (!r) {
      return list;
    }
    return list.filter((c) => c.region === r);
  });

  readonly visibleList = computed(() => this.filtered().slice(0, this.visibleCount()));

  readonly hasMore = computed(() => this.visibleCount() < this.filtered().length);

  readonly skeletonIndices = Array.from({ length: 12 }, (_, i) => i);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((q) => {
      const search = q.get('search')?.trim() ?? '';
      const region = q.get('region')?.trim() || null;
      this.selectedRegion.set(region);
      this.visibleCount.set(this.pageSize);
      if (search) {
        this.searchActive.set(true);
        this.activeSearch.set(search);
        this.fetchSearch(search);
      } else {
        this.searchActive.set(false);
        this.activeSearch.set('');
        this.fetchAll();
      }
    });
  }

  setRegion(region: string | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { region: region, search: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  clearSearch(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) {
      return;
    }
    this.visibleCount.update((n) => Math.min(n + this.pageSize, this.filtered().length));
  }

  retry(): void {
    const s = this.activeSearch();
    this.visibleCount.set(this.pageSize);
    if (this.searchActive() && s) {
      this.fetchSearch(s);
    } else {
      this.fetchAll(true);
    }
  }

  private fetchSearch(q: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.countryService.searchByName(q).subscribe({
      next: (list) => {
        this.countries.set(list);
        this.regions.set([]);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.countries.set([]);
        this.loading.set(false);
      },
    });
  }

  private fetchAll(force = false): void {
    this.loading.set(true);
    this.error.set(null);
    this.countryService.getAll(force).subscribe({
      next: (list) => {
        this.countries.set(list);
        const reg = [...new Set(list.map((c) => c.region).filter(Boolean))].sort((a, b) =>
          a.localeCompare(b),
        );
        this.regions.set(reg);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.countries.set([]);
        this.regions.set([]);
        this.loading.set(false);
      },
    });
  }
}
