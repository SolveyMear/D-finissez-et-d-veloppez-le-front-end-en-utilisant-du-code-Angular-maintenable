import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Olympic } from '../models/olympic.model';
import { OlympicService, OlympicServiceError } from './olympic.service';

describe('OlympicService', () => {
  let service: OlympicService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(OlympicService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should calculate the dashboard statistics', () => {
    let result: unknown;
    service.getOlympicStatistics().subscribe((statistics) => result = statistics);

    httpTestingController.expectOne('./assets/mock/olympic.json').flush(getOlympics());

    expect(result).toEqual({
      totalCountries: 2,
      totalOlympicGames: 2,
      countries: ['Italy', 'France'],
      medalsByCountry: [68, 33]
    });
  });

  it('should calculate statistics for a country using numeric values', () => {
    let result: unknown;
    service.getCountryStatistics('Italy').subscribe((statistics) => result = statistics);

    httpTestingController.expectOne('./assets/mock/olympic.json').flush(getOlympics());

    expect(result).toEqual({
      country: 'Italy',
      totalEntries: 2,
      totalMedals: 68,
      totalAthletes: 747,
      years: [2012, 2016],
      medalsByYear: [28, 40]
    });
  });

  it('should report an unknown country', () => {
    let receivedError: unknown;
    service.getCountryStatistics('Unknown').subscribe({
      error: (error: unknown) => receivedError = error
    });

    httpTestingController.expectOne('./assets/mock/olympic.json').flush(getOlympics());

    expect(receivedError instanceof OlympicServiceError).toBeTrue();
    expect(receivedError).toEqual(jasmine.objectContaining({ kind: 'country-not-found' }));
  });

  it('should report an empty dataset', () => {
    let receivedError: unknown;
    service.getOlympicStatistics().subscribe({
      error: (error: unknown) => receivedError = error
    });

    httpTestingController.expectOne('./assets/mock/olympic.json').flush([]);

    expect(receivedError instanceof OlympicServiceError).toBeTrue();
    expect(receivedError).toEqual(jasmine.objectContaining({ kind: 'empty-data' }));
  });

  function getOlympics(): Olympic[] {
    return [
      {
        id: 1,
        country: 'Italy',
        participations: [
          { id: 1, year: 2012, city: 'London', medalsCount: 28, athleteCount: 372 },
          { id: 2, year: 2016, city: 'Rio', medalsCount: 40, athleteCount: 375 }
        ]
      },
      {
        id: 2,
        country: 'France',
        participations: [
          { id: 1, year: 2016, city: 'Rio', medalsCount: 33, athleteCount: 403 }
        ]
      }
    ];
  }
});
