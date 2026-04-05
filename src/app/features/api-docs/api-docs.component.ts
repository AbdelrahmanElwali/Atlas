import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type CodeLang = 'javascript' | 'python' | 'csharp';
type TryMode = 'list' | 'code' | 'name' | 'region';

@Component({
  selector: 'app-api-docs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-docs.component.html',
  styleUrl: './api-docs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiDocsComponent {
  readonly baseUrl = 'http://atlas.runasp.net';

  readonly codeLang = signal<CodeLang>('javascript');
  readonly tryMode = signal<TryMode>('list');
  readonly tryCode = signal('EG');
  readonly tryName = signal('Egypt');
  readonly tryRegion = signal('Africa');

  readonly tryLoading = signal(false);
  readonly tryError = signal<string | null>(null);
  readonly tryStatus = signal<number | null>(null);
  readonly tryBody = signal<string>('');

  readonly copyHint = signal<string | null>(null);

  readonly exampleCountry = {
    commonName: 'Egypt',
    officialName: 'Arab Republic of Egypt',
    cca2: 'EG',
    cca3: 'EGY',
    region: 'Africa',
    subregion: 'Northern Africa',
    capital: 'Cairo',
    population: 109262178,
    flagEmoji: '🇪🇬',
    flagPng: 'https://flagcdn.com/w320/eg.png',
    lat: 27,
    lng: 30,
    translations: { ara: 'مصر', eng: 'Egypt' },
  } as const;

  readonly endpoints = [
    {
      method: 'GET',
      path: '/api/countries',
      description:
        'Returns every country as a JSON array. Ideal for building lists, offline caches, or regional grouping on the client.',
      exampleJson: this.formatJson([
        this.exampleCountry,
        {
          commonName: 'Japan',
          officialName: 'Japan',
          cca2: 'JP',
          cca3: 'JPN',
          region: 'Asia',
          subregion: 'Eastern Asia',
          capital: 'Tokyo',
          population: 125124989,
          flagEmoji: '🇯🇵',
          flagPng: 'https://flagcdn.com/w320/jp.png',
          lat: 36,
          lng: 138,
          translations: { ara: 'اليابان', eng: 'Japan' },
        },
      ]),
    },
    {
      method: 'GET',
      path: '/api/countries/{code}',
      description:
        'Returns one country by ISO 3166-1 alpha-2 or alpha-3 code (e.g. EG, EGY). Path segments are URL-encoded automatically by clients.',
      exampleJson: this.formatJson(this.exampleCountry),
    },
    {
      method: 'GET',
      path: '/api/countries/name/{name}',
      description:
        'Search by common or official name. Both English and Arabic names are supported; use UTF-8 encoding and percent-encode the path segment.',
      exampleJson: this.formatJson([this.exampleCountry]),
    },
    {
      method: 'GET',
      path: '/api/countries/region/{region}',
      description:
        'Returns all countries in a given region name (e.g. Africa, Asia). The value must match the region string returned on country objects.',
      exampleJson: this.formatJson([this.exampleCountry]),
    },
  ] as const;

  readonly schemaRows: ReadonlyArray<{ field: string; type: string; description: string }> = [
    { field: 'commonName', type: 'string', description: 'Short English common name.' },
    { field: 'officialName', type: 'string', description: 'Formal state name.' },
    { field: 'cca2', type: 'string', description: 'ISO 3166-1 alpha-2 code.' },
    { field: 'cca3', type: 'string', description: 'ISO 3166-1 alpha-3 code.' },
    { field: 'region', type: 'string', description: 'Primary world region.' },
    { field: 'subregion', type: 'string', description: 'Finer geographic grouping.' },
    { field: 'capital', type: 'string', description: 'Capital city name.' },
    { field: 'population', type: 'number', description: 'Estimated population.' },
    { field: 'flagEmoji', type: 'string', description: 'Unicode regional indicator sequence.' },
    { field: 'flagPng', type: 'string', description: 'URL to a PNG flag asset.' },
    { field: 'lat', type: 'number', description: 'Representative latitude (WGS84).' },
    { field: 'lng', type: 'number', description: 'Representative longitude (WGS84).' },
    {
      field: 'translations',
      type: 'object',
      description: 'Map of language codes to localized names (keys vary; includes Arabic where available).',
    },
  ];

  readonly codeByLang: Record<CodeLang, string> = {
    javascript: `const base = '${this.baseUrl}';

// List all countries
const all = await fetch(\`\${base}/api/countries\`);
const countries = await all.json();

// Single country by code (cca2 or cca3)
const one = await fetch(\`\${base}/api/countries/EG\`);
const egypt = await one.json();

// Search by name — English or Arabic (encode non-ASCII)
const nameUrl = \`\${base}/api/countries/name/\${encodeURIComponent('مصر')}\`;
const byName = await fetch(nameUrl);
const matches = await byName.json();

// Countries in a region
const regionUrl = \`\${base}/api/countries/region/\${encodeURIComponent('Africa')}\`;
const byRegion = await fetch(regionUrl);
const african = await byRegion.json();`,

    python: `import requests
from urllib.parse import quote

base = "${this.baseUrl}"

countries = requests.get(f"{base}/api/countries").json()

egypt = requests.get(f"{base}/api/countries/EG").json()

matches = requests.get(f"{base}/api/countries/name/{quote('مصر')}").json()

african = requests.get(f"{base}/api/countries/region/{quote('Africa')}").json()`,

    csharp: `using System.Net.Http;
using System.Text.Json;

var baseUrl = "${this.baseUrl}";
using var http = new HttpClient();

var countriesJson = await http.GetStringAsync($"\${baseUrl}/api/countries");
using var countries = JsonDocument.Parse(countriesJson);

var egJson = await http.GetStringAsync($"\${baseUrl}/api/countries/EG");
using var egypt = JsonDocument.Parse(egJson);

var namePath = Uri.EscapeDataString("مصر");
var nameJson = await http.GetStringAsync($"\${baseUrl}/api/countries/name/\${namePath}");
using var byName = JsonDocument.Parse(nameJson);

var regionPath = Uri.EscapeDataString("Africa");
var regionJson = await http.GetStringAsync($"\${baseUrl}/api/countries/region/\${regionPath}");
using var byRegion = JsonDocument.Parse(regionJson);`,
  };

  readonly tryUrl = computed(() => {
    const base = this.baseUrl;
    switch (this.tryMode()) {
      case 'list':
        return `${base}/api/countries`;
      case 'code':
        return `${base}/api/countries/${encodeURIComponent(this.tryCode().trim() || 'EG')}`;
      case 'name':
        return `${base}/api/countries/name/${encodeURIComponent(this.tryName().trim() || 'Egypt')}`;
      case 'region':
        return `${base}/api/countries/region/${encodeURIComponent(this.tryRegion().trim() || 'Africa')}`;
    }
  });

  setLang(lang: CodeLang): void {
    this.codeLang.set(lang);
  }

  setTryMode(mode: string): void {
    if (mode !== 'list' && mode !== 'code' && mode !== 'name' && mode !== 'region') {
      return;
    }
    this.tryMode.set(mode);
    this.tryError.set(null);
    this.tryBody.set('');
    this.tryStatus.set(null);
  }

  async copyBaseUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.baseUrl);
      this.copyHint.set('Copied');
      setTimeout(() => this.copyHint.set(null), 2000);
    } catch {
      this.copyHint.set('Copy failed');
      setTimeout(() => this.copyHint.set(null), 2000);
    }
  }

  async runTry(): Promise<void> {
    this.tryLoading.set(true);
    this.tryError.set(null);
    this.tryBody.set('');
    this.tryStatus.set(null);
    const url = this.tryUrl();
    try {
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
      this.tryStatus.set(res.status);
      const text = await res.text();
      try {
        const parsed = JSON.parse(text) as unknown;
        this.tryBody.set(JSON.stringify(parsed, null, 2));
      } catch {
        this.tryBody.set(text || '(empty body)');
      }
      if (!res.ok) {
        this.tryError.set(`HTTP ${res.status} ${res.statusText || ''}`.trim());
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Request failed';
      this.tryError.set(message);
    } finally {
      this.tryLoading.set(false);
    }
  }

  private formatJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
}
