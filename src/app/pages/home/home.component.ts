import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OlympicStatistics } from '../../models/olympic-statistics.model';
import { OlympicService, OlympicServiceError } from '../../services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public readonly titlePage = 'Medals per Country';
  public statistics: OlympicStatistics | null = null;
  public error: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly olympicService: OlympicService
  ) { }

  ngOnInit(): void {
    this.olympicService.getOlympicStatistics().subscribe({
      next: (statistics) => {
        this.statistics = statistics;
      },
      error: (error: unknown) => {
        this.error = this.getErrorMessage(error);
      }
    });
  }

  navigateToCountry(country: string): void {
    this.router.navigate(['/country', country]);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof OlympicServiceError || error instanceof HttpErrorResponse) {
      return error.message;
    }
    return 'Unable to load Olympic data. Please try again later.';
  }
}
