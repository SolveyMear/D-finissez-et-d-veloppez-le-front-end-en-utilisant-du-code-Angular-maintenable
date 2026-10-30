import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() countries: string[] = [];
  @Input() medals: number[] = [];
  @Output() countrySelected = new EventEmitter<string>();
  @ViewChild('chartCanvas') private canvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart<'pie', number[], string> | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.canvas) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    this.chart?.destroy();
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.countries,
        datasets: [{
          label: 'Medals',
          data: this.medals,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }]
      },
      options: {
        aspectRatio: 2.5,
        onClick: (event, elements) => {
          const index = elements[0]?.index;
          const country = index === undefined ? undefined : this.countries[index];
          if (country) {
            this.countrySelected.emit(country);
          }
        }
      }
    });
  }
}
