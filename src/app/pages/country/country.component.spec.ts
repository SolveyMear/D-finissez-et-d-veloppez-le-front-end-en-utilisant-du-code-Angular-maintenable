import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { LineChartComponent } from '../../components/line-chart/line-chart.component';
import { StatComponent } from '../../components/stat/stat.component';
import { CountryStatistics } from '../../models/olympic-statistics.model';
import { OlympicService } from '../../services/olympic.service';
import { CountryComponent } from './country.component';

describe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;

  beforeEach(async () => {
    const olympicService = jasmine.createSpyObj<OlympicService>(
      'OlympicService',
      ['getCountryStatistics']
    );
    olympicService.getCountryStatistics.and.returnValue(of({
      country: 'Italy',
      totalEntries: 3,
      totalMedals: 96,
      totalAthletes: 1128,
      years: [2012, 2016, 2020],
      medalsByYear: [28, 28, 40]
    } satisfies CountryStatistics));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, LineChartComponent, StatComponent],
      declarations: [CountryComponent],
      providers: [
        { provide: OlympicService, useValue: olympicService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ countryName: 'Italy' })) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and display the selected country statistics', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Italy');
    expect(fixture.nativeElement.textContent).toContain('Total number of medals');
  });
});
