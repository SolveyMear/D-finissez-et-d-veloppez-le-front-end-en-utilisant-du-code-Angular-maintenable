import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { StatComponent } from '../../components/stat/stat.component';
import { OlympicStatistics } from '../../models/olympic-statistics.model';
import { OlympicService } from '../../services/olympic.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    const olympicService = jasmine.createSpyObj<OlympicService>(
      'OlympicService',
      ['getOlympicStatistics']
    );
    olympicService.getOlympicStatistics.and.returnValue(of({
      totalCountries: 1,
      totalOlympicGames: 3,
      countries: ['Italy'],
      medalsByCountry: [96]
    } satisfies OlympicStatistics));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PieChartComponent, StatComponent],
      declarations: [HomeComponent],
      providers: [{ provide: OlympicService, useValue: olympicService }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and display the service results', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Number of countries');
    expect(fixture.nativeElement.textContent).toContain('Number of Olympic Games');
    expect(fixture.nativeElement.querySelector('.country-navigation a')?.textContent).toContain('Italy');
  });
});
