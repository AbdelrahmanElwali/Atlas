import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Country } from '../../core/models/country.model';
import { CountryService } from '../../core/services/country.service';
import { ErrorPanelComponent } from '../../shared/components/error-panel/error-panel.component';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, ErrorPanelComponent],
  templateUrl: './country-detail.component.html',
  styleUrl: './country-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly countryService = inject(CountryService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly country = signal<Country | null>(null);

  readonly mapEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const c = this.country();
    if (!c) {
      return null;
    }
    const pad = 14;
    const minLon = c.lng - pad;
    const minLat = c.lat - pad;
    const maxLon = c.lng + pad;
    const maxLat = c.lat + pad;
    const raw = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${c.lat},${c.lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(raw);
  });

  readonly osmLink = computed(() => {
    const c = this.country();
    return c ? `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=5/${c.lat}/${c.lng}` : '#';
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      const code = p.get('code')?.trim() ?? '';
      if (code) {
        this.load(code);
      }
    });
  }

  retry(): void {
    const code = this.route.snapshot.paramMap.get('code')?.trim() ?? '';
    if (code) {
      this.load(code);
    }
  }

  translationEntries(c: Country): { key: string; value: string }[] {
    return Object.entries(c.translations ?? {}).filter(
      (e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0,
    ).map(([key, value]) => ({ key, value }));
  }

  private load(code: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.country.set(null);
    this.countryService.getByCode(code).subscribe({
      next: (data) => {
        this.country.set(data);
        this.title.setTitle(`${data.commonName} — Atlas`);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }
}
