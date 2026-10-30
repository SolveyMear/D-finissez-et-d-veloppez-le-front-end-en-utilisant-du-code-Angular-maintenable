import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { CountryStatistics, OlympicStatistics } from '../models/olympic-statistics.model';
import { Olympic } from '../models/olympic.model';

export type OlympicServiceErrorKind = 'empty-data' | 'country-not-found';

export class OlympicServiceError extends Error {
  constructor(
    public readonly kind: OlympicServiceErrorKind,
    message: string
  ) {
    super(message);
    this.name = 'OlympicServiceError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class OlympicService {
  private readonly olympicUrl = './assets/mock/olympic.json';
  private readonly olympics$: Observable<Olympic[]>;

  constructor(private readonly http: HttpClient) {
    this.olympics$ = this.http.get<Olympic[]>(this.olympicUrl).pipe(
      map((olympics) => {
        if (olympics.length === 0) {
          throw new OlympicServiceError('empty-data', 'No Olympic data is available.');
        }
        return olympics;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  getOlympicStatistics(): Observable<OlympicStatistics> {
    return this.olympics$.pipe(
      map((olympics) => {
        const countries = olympics.map((olympic) => olympic.country);
        const years = new Set<number>();
        const medalsByCountry = olympics.map((olympic) => {
          return olympic.participations.reduce((total, participation) => {
            years.add(participation.year);
            return total + participation.medalsCount;
          }, 0);
        });

        return {
          totalCountries: countries.length,
          totalOlympicGames: years.size,
          countries,
          medalsByCountry
        };
      })
    );
  }

  getCountryStatistics(countryName: string): Observable<CountryStatistics> {
    return this.olympics$.pipe(
      map((olympics) => {
        const olympic = olympics.find((item) => item.country === countryName);
        if (!olympic) {
          throw new OlympicServiceError(
            'country-not-found',
            `No Olympic data was found for ${countryName}.`
          );
        }

        const participations = olympic.participations;
        return {
          country: olympic.country,
          totalEntries: participations.length,
          totalMedals: participations.reduce(
            (total, participation) => total + participation.medalsCount,
            0
          ),
          totalAthletes: participations.reduce(
            (total, participation) => total + participation.athleteCount,
            0
          ),
          years: participations.map((participation) => participation.year),
          medalsByYear: participations.map((participation) => participation.medalsCount)
        };
      })
    );
  }
}
