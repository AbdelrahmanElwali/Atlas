export interface CountryTranslations {
  readonly [key: string]: string | undefined;
}

export interface Country {
  readonly commonName: string;
  readonly officialName: string;
  readonly cca2: string;
  readonly cca3: string;
  readonly region: string;
  readonly subregion: string;
  readonly capital: string;
  readonly population: number;
  readonly flagEmoji: string;
  readonly flagPng: string;
  readonly lat: number;
  readonly lng: number;
  readonly translations: CountryTranslations;
}
