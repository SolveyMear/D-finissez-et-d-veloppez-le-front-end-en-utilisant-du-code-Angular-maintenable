import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap } from 'rxjs';
import { CountryStatistics } from '../../models/olympic-statistics.model';
import { OlympicService, OlympicServiceError } from '../../services/olympic.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  public statistics: CountryStatistics | null = null;
  public error: string | null = null;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly olympicService: OlympicService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        const countryName = params.get('countryName');
        this.statistics = null;
        this.error = null;

        if (!countryName) {
          this.router.navigate(['/not-found']);
          return EMPTY;
        }

        return this.olympicService.getCountryStatistics(countryName).pipe(
          catchError((error: unknown) => {
            if (error instanceof OlympicServiceError && error.kind === 'country-not-found') {
              this.router.navigate(['/not-found']);
            } else {
              this.error = this.getErrorMessage(error);
            }
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (statistics) => {
        this.statistics = statistics;
      }
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof OlympicServiceError || error instanceof HttpErrorResponse) {
      return error.message;
    }
    return 'Unable to load Olympic data. Please try again later.';
  }
}
