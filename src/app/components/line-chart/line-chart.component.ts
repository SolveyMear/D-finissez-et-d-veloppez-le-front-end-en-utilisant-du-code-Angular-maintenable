import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() years: number[] = [];
  @Input() medals: number[] = [];
  @Input() country = '';
  @ViewChild('chartCanvas') private canvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart<'line', number[], number> | null = null;

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
      type: 'line',
      data: {
        labels: this.years,
        datasets: [{
          label: 'Medals',
          data: this.medals,
          backgroundColor: '#0b868f',
          borderColor: '#0b868f'
        }]
      },
      options: {
        aspectRatio: 2.5,
        plugins: {
          title: {
            display: true,
            text: `Medals won by ${this.country} at each Olympic Games`
          }
        }
      }
    });
  }
}
