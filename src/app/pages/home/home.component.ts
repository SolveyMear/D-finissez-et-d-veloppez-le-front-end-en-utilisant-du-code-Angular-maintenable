import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private olympicUrl = './assets/mock/olympic.json';
  public pieChart!: Chart<"pie", number[], string>;
  public totalCountries: number = 0
  public totalJOs: number = 0
  public error!:string // robustesse ou logique de code -> si on a jamais d'erreur on aura une promise non tenue ici
  titlePage: string = "Medals per Country"; // propreté du code -> titre de la page en dur  | d'ailleurs, pourquoi cette syntaxe ? pourquoi pas de mot clé public?

  constructor(private router: Router, private http:HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>(this.olympicUrl).pipe().subscribe( // séparation des responsabilités -> récup des données json et traitement des données dans un service dédié | subscribe et pipe déjà traité
      (data) => { // traitement à déléguer à un service
        console.log(`Liste des données : ${JSON.stringify(data)}`); // code à supprimer
        if (data && data.length > 0) { // idem manque de vérifications pb traité déjà 
          this.totalJOs = Array.from(new Set(data.map((i: any) => i.participations.map((f: any) => f.year)).flat())).length; // pourquoi utiliser Set alors qu'on peut juste remplir le nouveau tableau non?
          const countries: string[] = data.map((i: any) => i.country);
          this.totalCountries = countries.length;
          const medals = data.map((i: any) => i.participations.map((i: any) => (i.medalsCount))); // première partie de la méthode dupliquée, peut-être factorisé
          const sumOfAllMedalsYears = medals.map((i) => i.reduce((acc: any, i: any) => acc + i, 0)); //i non typé 
          this.buildPieChart(countries, sumOfAllMedalsYears); // idem que pour countries
        }
      },
      (error:HttpErrorResponse) => { // idem que pour countries
        console.log(`erreur : ${error}`); //code à supprimer
        this.error = error.message
      }
    )
  }

  buildPieChart(countries: string[], sumOfAllMedalsYears: number[]) {
    const pieChart = new Chart("DashboardPieChart", {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Medals',
          data: sumOfAllMedalsYears,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => { // e non typé
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true)
            if (points.length) {
              const firstPoint = points[0];
              const countryName = pieChart.data.labels ? pieChart.data.labels[firstPoint.index] : '';
              this.router.navigate(['country', countryName]);
            }
          }
        }
      }
    });
    this.pieChart = pieChart; // idem 
  }
}

