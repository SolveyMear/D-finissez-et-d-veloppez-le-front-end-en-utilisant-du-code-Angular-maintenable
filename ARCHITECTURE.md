# Architecture front-end

Cette application Angular présente les statistiques des Jeux Olympiques à partir d'un fichier JSON local. L'architecture sépare les pages, les composants d'affichage, les modèles de données et leur chargement.

## Structure

```text
src/
├── app/
│   ├── components/
│   │   ├── header/       # En-tête partagé
│   │   ├── line-chart/   # Graphique des médailles d'un pays par édition
│   │   ├── pie-chart/    # Répartition des médailles par pays
│   │   └── stat/         # Affichage réutilisable d'un libellé et d'une valeur
│   ├── models/           # Interfaces des données et des statistiques
│   ├── pages/
│   │   ├── country/      # Statistiques détaillées d'un pays
│   │   ├── home/         # Tableau de bord
│   │   └── not-found/    # Page pour les routes inconnues
│   ├── services/
│   │   └── olympic.service.ts
│   ├── app-routing.module.ts
│   └── app.module.ts
└── assets/mock/olympic.json
```

## Pages et navigation

Les routes sont définies dans `app-routing.module.ts` :

- `/` affiche le tableau de bord ;
- `/country/:countryName` affiche les statistiques d'un pays ;
- une route inconnue affiche la page « not found ».

`AppComponent` affiche l'en-tête commun et le `router-outlet`, où Angular insère la page correspondant à l'URL.

Les composants de page coordonnent l'affichage et la navigation. La page d'accueil demande les statistiques générales à `OlympicService`. La page pays lit le nom du pays dans la route et demande les détails correspondants. Elle suit les changements de paramètres avec `switchMap` et redirige vers la page introuvable si le pays n'existe pas.

## Composants réutilisables

Les composants de `components/` sont spécialisés dans l'affichage :

- `StatComponent` reçoit un libellé et une valeur ;
- `PieChartComponent` reçoit les pays et leurs totaux de médailles. Il émet le pays sélectionné ; la page d'accueil effectue la navigation ;
- `LineChartComponent` reçoit les années, les médailles et le nom du pays ;
- `HeaderComponent` affiche le titre commun de l'application.

Les composants de graphique créent leur graphique Chart.js lorsque le canvas est disponible et détruisent l'instance lors de leur destruction. Les données sont transmises par des entrées Angular ; les graphiques ne chargent pas eux-mêmes les données.

## Modèles

Les interfaces de `models/` décrivent les données échangées :

- `Olympic` décrit un pays et ses participations ;
- `Participation` décrit une édition olympique à laquelle le pays a participé ;
- `OlympicStatistics` et `CountryStatistics` décrivent les résultats calculés que les pages affichent.

Ces types permettent de vérifier la structure des données et d'éviter le recours à `any`.

## Service et données

`OlympicService`, fourni à la racine (`providedIn: 'root'`), est le point d'accès central aux données. Il :

1. charge `assets/mock/olympic.json` avec `HttpClient` ;
2. type la réponse comme une liste de `Olympic` ;
3. partage la réponse mise en cache entre les pages ;
4. calcule les statistiques du tableau de bord et d'un pays ;
5. signale les données vides et les pays inconnus avec des erreurs identifiables.

Les pages consomment les résultats du service et restent indépendantes de la façon dont les données sont récupérées.

## Évolution vers un back-end

Pour remplacer le JSON local par une API REST, l'URL et la récupération des données pourront être adaptées dans `OlympicService`. Les pages et composants pourront continuer à consommer les mêmes statistiques typées. Si le format renvoyé par l'API diffère du modèle actuel, le service pourra convertir la réponse vers les modèles utilisés par l'application.
