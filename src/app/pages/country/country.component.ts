import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  private olympicUrl = './assets/mock/olympic.json'; // maintenabilité -> URL du fichier JSON à mettre dans un fichier de config ou alors au moins une variable pour le nom du fichier ?
  public lineChart!: Chart<"line", string[], number>; // je ne vois pas quel est le problème ici
  public titlePage: string = '';
  public totalEntries: any = 0; // typage (number)
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
  } // propriété router jamais utilisée -> à supprimer si inutile

  ngOnInit() {
    let countryName: string | null = null
    this.route.paramMap.subscribe((param: ParamMap) => countryName = param.get('countryName'));
    this.http.get<any[]>(this.olympicUrl).pipe().subscribe( // code inutile -> pipe sans opérateur et subscribe dans le ngOnInit() -> à factoriser dans un service ?
      //un truc avec susbscribe mais j'ai pas compris quoi
      (data) => { // séparation des responsabilités -> traitement des données dans un service ?
        if (data && data.length > 0) { // robustesse du code -> vérifier que data est bien un tableau et qu'il contient des objets avec les propriétés attendues
          const selectedCountry = data.find((i: any) => i.country === countryName); // robustesse du code -> vérifier que selectedCountry n'est pas undefined avant de l'utiliser 
          this.titlePage = selectedCountry.country; // robustesse du code -> vérifier que selectedCountry n'est pas undefined avant de l'utiliser
          const participations = selectedCountry?.participations.map((i: any) => i); // typage -> 11 fois any 
          this.totalEntries = participations?.length ?? 0; // logique de code -> si participations est null alors lengh ne sera même pas calculé
          const years = selectedCountry?.participations.map((i: any) => i.year) ?? []; //idem pour la logique de code?
          const medals = selectedCountry?.participations.map((i: any) => i.medalsCount.toString()) ?? []; // typage -> toString inutile avec un parseInt à la ligne suivante
          this.totalMedals = medals.reduce((accumulator: any, item: any) => accumulator + parseInt(item), 0);
          const nbAthletes = selectedCountry?.participations.map((i: any) => i.athleteCount.toString()) ?? [] // idem pour le toString inutile avec un parseInt à la ligne suivante
          this.totalAthletes = nbAthletes.reduce((accumulator: any, item: any) => accumulator + parseInt(item), 0); // propreté du code : répétition du code -> factoriser dans une fonction pour éviter la répétition
          this.buildChart(years, medals); // création dans le ngOnInit() du coup, il pourrait être créé avant d'avoir les données à afficher dans le graphe
        } // cycle de vie : chart jamais supprimé au changement de page -> risque de fuite mémoire si on navigue entre plusieurs pays
      },
      (error: HttpErrorResponse) => {
        this.error = error.message // absence d'utilisation de la page d'erreur
      }
    );
  }

  buildChart(years: number[], medals: string[]) { // séparation des responsabilités -> comment gérer les graphes ?
    const lineChart = new Chart("countryChart", {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: "medals",
            data: medals,
            backgroundColor: '#0b868f'
          },
        ]
      },
      options: {
        aspectRatio: 2.5
      }
    });
    this.lineChart = lineChart; // code inutile. lineChart utilisé nulle part ailleurs. On pourrait directement utiliser this.lineChart = new Chart(...) sans passer par une variable intermédiaire.
  }
}

// Dépendance directe : le composant connaît l’URL et HttpClient -> je ne sais pas