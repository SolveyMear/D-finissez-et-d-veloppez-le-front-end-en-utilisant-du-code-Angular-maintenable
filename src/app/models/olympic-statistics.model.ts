export interface OlympicStatistics {
  totalCountries: number;
  totalOlympicGames: number;
  countries: string[];
  medalsByCountry: number[];
}

export interface CountryStatistics {
  country: string;
  totalEntries: number;
  totalMedals: number;
  totalAthletes: number;
  years: number[];
  medalsByYear: number[];
}
