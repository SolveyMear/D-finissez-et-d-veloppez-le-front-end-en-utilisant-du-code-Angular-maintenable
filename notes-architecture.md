# Audit du code

## 1. Architecture et séparation des responsabilités
### `home.component.ts` et `country.component.ts`

- **Fichiers trop volumineux** : Ils font une soixantaine de lignes; pas volumineux, mais trop de responsabilités.
>Manque les dossiers **services** et les **models** pour déléguer ces différents traitements
- **Anti-pattern**: Données gérées dans le composant.
- `ngOnInit()` (l.21) : contient à la fois 
    - appel http dans le composant (donc le composant dépend HttpClient et de l'url écrite en dur dans le code).
    - traitement des données : la méthode récupère, calcule et construit le graphique. 

>La récupération et le traitement devraient être dans un service.  
>Un dossier models pourrait gérer les interfaces pour décrire les données du Json.


## 2. Typage
### `home.component.ts`

- Typage faible `any` : 8 fois.

Problèmes avec `any` :
- pas d'autocomplétion de l'IDE
- possibilités d'erreurs qui passeront inaperçues
>Solution avec la création d'interfaces pour décrire les données json dans le dossier models (voir partie 1).

### `country.component.ts`
- Mauvais typage de la variable `medals` dans le graphique, ce qui demande des changements à 3 endroits du code: 
    - le graphique attend des valeurs numériques, mais le type `string[]` utilisé pour `lineChart` indique que les médailles sont des chaînes de caractères.
    - `toString()` (ll.35 et 37)  et `parseInt` (ll. 36 et 38) : rend le code compliqué inutilement.
    - `buildChart(years: number[], medals: string[])` (l.41).  

>Dans le JSON, `medalsCount` est un nombre et Chart.js attend des valeurs numériques. Les conversions `toString()` puis `parseInt()` sont donc inutiles et le typage du graphique doit être cohérent avec ces nombres.

- Typage incohérent de totalEntries : passer de `any` à `number`.
- Typage faible `any` : 11 fois.


## 3. Gestion asynchrone (Observables et cycle de vie)
### `home.component.ts` et `country.component.ts`

- Le graphique est créé dans la réponse à la requête HTTP, après l'initialisation de la vue. Cela fonctionne actuellement car le `<canvas>` est toujours présent dans le template. Si cet élément devenait conditionnel (par exemple avec `*ngIf`), la réponse pourrait arriver alors que le canvas n'existe pas et la création du graphique échouerait.
>Il faut s'assurer que le canvas et les données sont tous deux disponibles avant de créer le graphique. `ngAfterViewInit()` permet d'accéder à la vue initialisée, mais si les données arrivent ensuite ou si le canvas est conditionnel, il faut aussi gérer leur disponibilité asynchrone (par exemple avec `@ViewChild` et créer le graphique lorsque les deux sont prêts).

- Les instances Chart.js ne sont jamais détruites lorsque le composant est quitté. Leur nettoyage explicite évite de conserver des références au canvas ou des ressources associées lorsque l'utilisateur navigue entre les pages.
>Conserver l'instance du graphique et appeler sa méthode `destroy()` lors de la destruction du composant, par exemple dans `ngOnDestroy()`.

### `country.component.ts`
- La lecture de `paramMap` et la requête HTTP sont séparées. L'émission initiale de `paramMap` est synchrone, donc le code fonctionne actuellement, mais un changement de paramètre après l'initialisation ne relance pas la requête pour le nouveau pays.
>On pourrait chaîner la lecture du paramètre et la requête avec un opérateur RxJS (par exemple `switchMap`), afin de suivre aussi les changements de route.


## 4. Qualité et propreté du code
### `home.component.ts` et `country.component.ts`

- `pipe()` (l.27) sans opérateur donc inutile.
- Création des graphes est dupliquée et mélangée à la logique de page.
>On pourrait envisager un composant générique si d'autres graphes viennent à être ajoutés, ou deux petits composants spécifiques pour gérer la construction, configuration et suppression.
- `subscribe` (l.27) : ancienne syntaxe donc code obsolète, nouvelle reco est un seul objet avec des clés nommées pour une meilleure lisibilité.
- `lineChart` et `pieChart` sont interpolés dans le contenu des éléments `<canvas>`. Ce contenu sert de repli si le navigateur ne prend pas en charge `<canvas>`; il n'affiche pas le graphique Chart.js, qui est dessiné directement dans le canvas par la bibliothèque. L'interpolation d'une instance de graphique ne fournit pas non plus un contenu de repli utile. Les propriétés peuvent plutôt conserver les références aux instances pour les détruire dans `ngOnDestroy()`, si ce nettoyage est ajouté.
- url écrits en dur dans le code, donc difficilement maintenable en cas de changement d'url.

### `home.component.ts`
- `console.log()` (ll. 24-35) code oublié à supprimer.
- `titlePage` écrit en dur dans le code, peu maintenable en cas de changement de nom de page, s'il faut changer plusieurs noms de pages et qu'elles sont toutes en dur dans leur fichier, il faut aller chercher chaque variable.
- `this.totalJOs = Array.from(new Set(data.map((i: any) => i.participations.map((f: any) => f.year)).flat())).length;` (l. 26): création d'un `Array` puis un `.length` est inutile, on pourrait faire utiliser la méthode `.size` de `Set` .
- `i` (l.30) n'est pas typé explicitement et hérite du type `any` de `data`.

### `country.component.ts`
- La méthode `map((i) => i)` (l.33) renvoi le tableau tel quel sans aucune transformation, donc code inutile.
- En plus cette méthode ne sert qu'à calculer le length du tableau donc code doublement inutile. 
>On pourrait compter le nombre d'objets dans les tableaux de participations.
- `router`importé mais jamais utilisé, à supprimer.
- Gestion des médailles et des athlètes (ll.26-39) : code similaire qui pourrait être une méthode privée.

### `home.component.ts`
- `titlePage` n'a pas le mot clé `public`, ce n'est pas un problème en soi parce qu'elle est implicitement publique, mais ça n'est pas raccord avec les autres propriétés qui, elles, ont le mot clé `public` indiqué. Soit on indique que toutes les propriétés sont publiques, soit aucune, mais les présenter différemment fait bizarre.

### `country.component.html`
- Code inutilisé, l'attribut css `chart-container` ne sert pas.
- "Date" en `h2` alors que c'est l'appellation de l'axe horizontal. C'est pas logique et en plus pas de `h1` sur la page.

### `styles.scss`
- L'attribut `.heading` est défini mais utilisé dans aucun template.

## 5. Robustesse
### `home.component.ts` et `country.component.ts`
- Assertion d'initialisation définie (ou assertion d’affectation définitive ?) (`!`) après des propriétés sans valeur initiale :
    - `lineChart` (`country.component.ts`) n'est affectée que si des données valides sont reçues; sinon elle reste non initialisée.
    - `error` (`home.component.ts` et `country.component.ts`) n'est affectée qu'en cas d'erreur.
    - `pieChart` (`home.component.ts`).
>Le `!` ne garantit pas qu'une valeur sera attribuée : il demande à TypeScript de faire confiance au développeur et de ne pas signaler l'absence d'initialisation. Initialiser ces propriétés avec `null` et les typer en conséquence (par exemple `Chart<...> | null` et `string | null`) rendrait explicitement leurs états initiaux et les cas où aucune valeur n'est disponible.

- ` if (data && data.length > 0) ` vérification partielle et insuffisante - vérifie la présence de data et si data n'est pas vide, il manque : 
    - la vérification de chaque clé de l'objet **en cas d'API** pour l'instant c'est un json statique donc 
    - du coup toutes les vérifications `?` `??` qui viennent après la l. 33 sont inutiles parce que si `selectedCountry` est undefined alors le reste du code plantera parce les lignes suivantes ne seront jamais atteintes

- Les erreurs « pays introuvable », « ressource introuvable » et « erreur réseau » ne sont pas traitées distinctement. La route `**` affiche `NotFoundComponent` pour les URL qui ne correspondent à aucune route (par exemple `/country` sans nom de pays), mais un nom de pays inconnu correspond tout de même à la route `country/:countryName`.
- En cas de nom de pays inconnu, `CountryComponent` ne redirige pas vers `NotFoundComponent`. La recherche renvoie `undefined`, puis l'accès à `selectedCountry.country` échoue; les compteurs gardent leurs valeurs initiales et le graphique n'est pas créé.

## 6. Accessibilité
### `index.html`, `home.component.html`, `country.component.html` et `not-found.component.html`
- La langue déclarée dans `index.html` est `en`, tout est écrit en anglais sauf JOs, l'abréviation de Jeux Olympiques. Les lecteurs d'écran peuvent donc prononcer ce mot avec une mauvaise langue.
- Les pages utilisent des `h2` sans titre principal `h1`. La hiérarchie des titres n'est pas respectée et `titlePage` est placé dans une `div` au lieu d'un titre.
- Les templates s'appuient beaucoup sur des `div` et des paragraphes simples pour structurer le contenu. Ces éléments n'indiquent pas le rôle des sections ni la relation entre les libellés et leurs valeurs.
>Utiliser des éléments sémantiques adaptés (par exemple `main`, `header`, des titres hiérarchisés et une liste ou un tableau pour les statistiques) aiderait les technologies d'assistance à comprendre la structure. Les données tabulaires peuvent utiliser `table`, `tr`, `th` et `td`.
- Il n'y a pas de région `header` commune aux pages, malgré le titre affiché sur la page d'accueil.
>Un composant d'en-tête commun pourrait être créé et inclus dans le composant racine.

### `home.component.html`
- La navigation vers les pages des pays est déclenchée au clic dans le gestionnaire du graphique. Un `<canvas>` et ses zones dessinées ne sont pas des liens ou des contrôles HTML activables au clavier : les personnes qui naviguent sans souris ne peuvent pas suivre ces destinations.
>Fournir une alternative accessible au clavier, par exemple une liste de liens HTML vers chaque pays. Une simple mise au point du canvas (`tabindex`) ne suffit pas sans interaction clavier et indication sémantique adaptées.
>Source : https://pauljadam.com/demos/canvas.html
- Les parts du camembert se distinguent uniquement par la couleur. Les utilisateurs qui ne distinguent pas certaines couleurs peuvent ne pas identifier les pays.
>Ajouter une information qui ne dépend pas de la couleur, comme des noms ou des valeurs visibles, et conserver une légende compréhensible.
- Le `<canvas>` n'a pas de description textuelle ni d'alternative présentant les données du graphique.
>Ajouter un nom accessible (par exemple `role="img"` et un `aria-label` descriptif) et fournir également une alternative textuelle ou un tableau des données. Voir les recommandations Chart.js : https://www.chartjs.org/docs/latest/general/accessibility.html
- Le template interpole `pieChart` dans le contenu de repli du canvas (`{{ pieChart }}`). Angular convertit l'objet Chart en texte, ce qui donne `[object Object]` : si ce contenu de repli est exposé au lecteur d'écran, c'est cette information inutilisable qui peut être annoncée, et non le contenu du graphique.

### `country.component.html`
- Le template interpole `lineChart` dans le contenu de repli du canvas (`{{ lineChart }}`). Comme pour le graphique de la page d'accueil, un lecteur d'écran peut recevoir `[object Object]` au lieu d'une description des données.
>Remplacer cette interpolation par un contenu de repli explicite et utile, ou une alternative accessible (description et tableau de données).
- Le titre `Date` est rendu comme un `h2` alors qu'il désigne l'axe horizontal, pas une section de contenu. Cela ajoute un titre sans rapport à la navigation par titres.

### `home.component.scss` et `styles.scss`
- Les éléments de légende du graphique sont dessinés dans le canvas par Chart.js et non rendus comme des boutons HTML. Ils ne sont donc pas accessibles comme des contrôles au clavier ou aux technologies d'assistance.
>Ne pas dépendre de la légende du canvas comme unique moyen de navigation; proposer des contrôles HTML accessibles.

## 7. Comportement visuel
### `home.component.html` et `country.component.html`
- Le message `error` n'est pas affiché dans les templates. En cas d'échec de la requête, la page ne donne aucun retour visuel à l'utilisateur.

### `not-found.component.html`
- Le message d'erreur est écrit en dur et reste générique; il ne précise pas la cause de l'erreur.
- D'après ce que j'ai observé du comportement du site, le lien `Go back` renvoie à l'accueil, même lorsqu'il est affiché depuis une page pays et qu'on veut retourner sur la dernière page pays.

### `home.component.scss`
- `styleUrls: ['./home.component.scss']` référence un fichier SCSS vide; les styles de la page sont définis dans `styles.scss`.

### `country.component.scss`
- `.container` utilise une largeur relative de `50%`, puis passe à `100%` sous `1000px`. Le seuil est large et les autres éléments de la page (notamment les compteurs en ligne) ne prévoient pas de réorganisation sur petit écran.
- `.wrapper-container` ne fait que centrer le conteneur, tandis que `.container` porte la largeur. Les noms ne rendent pas immédiatement cette répartition des rôles évidente.

### `styles.scss` et `not-found.component.scss`
- `.center` et `.split` sont des styles globaux utilisés par plusieurs pages. Le style local `.center` de `not-found.component.scss` ajoute une hauteur et une largeur de fenêtre, ce qui donne à la même classe des comportements différents selon la page.
- `.split` conserve une disposition horizontale sans retour à la ligne, ce qui peut provoquer un débordement sur les petits écrans.

### Graphique de la page d'accueil
- Les éléments de légende du graphique sont dessinés dans le canvas par Chart.js, ce ne sont pas des boutons HTML. Le curseur ne change pas au survol d’une part cliquable.

## 8. Tests
- Les trois tests des pages (`home`, `country` et `not-found`) vérifient uniquement que le composant est créé. Ils ne couvrent ni l'affichage des données, ni la navigation, ni les erreurs, ni le comportement des graphiques. Ces specs correspondent au squelette généré par Angular et n'apportent donc qu'une vérification très limitée.
- La suite `country.component.spec.ts` est nommée `DetailComponent` alors qu'elle teste `CountryComponent`.
- `app.component.spec.ts` conserve des assertions générées par Angular sur `app.title` et sur le texte « olympic-games-starter app is running! ». Or `AppComponent` ne définit plus `title` et son template ne contient plus ce texte, mais uniquement le `router-outlet` : l'accès à `app.title` empêche la compilation des specs et l'assertion sur le texte serait également en échec.
- Il faudrait remplacer les assertions générées par des tests correspondant aux comportements attendus de l'application, en priorité les données et états d'erreur des pages ainsi que les principaux parcours de navigation.

## Proposition d'architecture

```
src/
├── app/
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.component.html
│   │   │   ├── header.component.scss
│   │   │   ├── header.component.spec.ts
│   │   │   └── header.component.ts
│   │   ├── line-chart/
│   │   │   ├── line-chart.component.html
│   │   │   ├── line-chart.component.scss
│   │   │   ├── line-chart.component.spec.ts
│   │   │   └── line-chart.component.ts
│   │   ├── pie-chart/
│   │   │   ├── pie-chart.component.html
│   │   │   ├── pie-chart.component.scss
│   │   │   ├── pie-chart.component.spec.ts
│   │   │   └── pie-chart.component.ts
│   │   └── stat/
│   │       ├── stat.component.html
│   │       ├── stat.component.scss
│   │       ├── stat.component.spec.ts
│   │       └── stat.component.ts
│   ├── models/
│   │   ├── olympic.model.ts
│   │   └── participation.model.ts
│   ├── pages/
│   │   ├── home/
│   │   │   ├── home.component.html
│   │   │   ├── home.component.scss
│   │   │   ├── home.component.spec.ts
│   │   │   └── home.component.ts
│   │   ├── country/
│   │   │   ├── country.component.html
│   │   │   ├── country.component.scss
│   │   │   ├── country.component.spec.ts
│   │   │   └── country.component.ts
│   │   └── not-found/
│   │       ├── not-found.component.html
│   │       ├── not-found.component.scss
│   │       ├── not-found.component.spec.ts
│   │       └── not-found.component.ts
│   ├── services/
│   │   ├── olympic.service.spec.ts
│   │   └── olympic.service.ts
│   ├── app-routing.module.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.component.spec.ts
│   ├── app.component.ts
│   └── app.module.ts
├── assets/
├── environments/
├── index.html
├── main.ts
└── styles.scss
```

## Rôle de chaque dossier

- **components/** *Separation of concerns (SRP)* : le composant affiche, le service gère les données. Composants « de page » et composants « de présentation » : une page récupère les données et décide (naviguer, afficher une erreur), tandis que pie-chart, line-chart et stat reçoivent des données et affichent, sans connaître le service ni le routeur.  

    >Séparation composant / service : les calculs peuvent être testés sans interface, et une seule modification suffit quand l’origine des données change.  

    >Composants de page / de présentation : stat, pie-chart et line-chart ne connaissent ni le service ni le routeur, donc ils se réutilisent et se testent seuls.
    - **components/header/** : 
        - Pour créer un composant header réutilisable dans toutes les pages du site, à placer dans `app.component.html` au dessus de `<router-outlet></router-outlet>`. 
        - Il affiche le nom de l’appli (« Olympic Games App »), aujourd’hui présent seulement dans home.

    - **components/pie-chart/** : 
        - Affiche le camembert des médailles par pays (page `home`).
        - Crée le graphique quand son `<canvas>` existe (`ngAfterViewInit`) et le détruit quand on quitte la page (`ngOnDestroy`). Règle la duplication, la fuite mémoire et la dépendance au timing du canvas.
        - Au clic sur une part, il prévient la page (mécanisme `output`), qui décide de naviguer : le composant ne connaît pas le routeur.

    - **components/line-chart/** :
        - Affiche la courbe des médailles par édition (page `country`).
        - Même fonctionnement de création et de destruction que `pie-chart`.
        - Alternatives écartées : ajouter `ngOnDestroy()` dans chaque page (la duplication resterait) ou faire un seul composant générique (plus complexe que nécessaire pour deux graphiques). Je choisis deux composants spécialisés, plus simples à lire.

    - **components/stat/** : Affiche un libellé et une valeur, remplace les cinq blocs identiques des deux pages. 

- **models/**
    - **models/olympic.model.ts** : Permettra de créer l'interface qui décrit les propriétés d’un pays (`country`, `participations`) et permettra de remplacer les `any`.

    - **models/participation.model.ts** : Permettra de créer l'interface qui décrit celles d’une participation (`year`, `medalsCount`, `athleteCount`).

- **pages/** : 
    - La structure ne change pas mais le contenu des différents fichiers sera très différent. 
    - Le HttpClient et les calculs seront supprimés des fichiers `.ts` et ils demanderont les données au service pour les afficher. 
    - `home` utilisera `stat` et `pie-chart` ; `country` utilisera `stat` et `line-chart`.
    - Le titre propre à chaque page (nom du pays, « Medals per Country ») reste dans la page, car il change d’une page à l’autre.

- **services/olympic.service.ts** : *Singleton* : une seule instance d’une classe, partagée par toute l’application. 

>Une seule URL, une seule logique d’accès aux données, et la possibilité de garder les données en mémoire pour ne pas refaire la requête à chaque page. Un service déclaré avec `providedIn: 'root'` n’a qu’une instance pour toute l’appli.

- Contiendra la requête http, le traitement des données et l'URL du fichier (plus d'URL en dur dans les composants).
- Je laisse un seul service parce qu'il n'y a pas beaucoup de transformations à faire sur les données.
- Il distingue les types d'erreur (réseau, données vides, pays inconnu) et les signale à la page en renvoyant une erreur identifiable. La page décide : pays inconnu → `not-found`, erreur réseau → message affiché dans la page.

## Déplacement des fichiers

| Morceau de code actuel    | Où il se trouve            | Où il irait            |
|:--------------------------|:---------------------------|:-----------------------|
| Requête HTTP + URL        | `home.component.ts`<br>`country.component.ts`   | `olympic.service.ts` |
| Calcul des totaux         | `home.component.ts`<br>`country.component.ts`   | `olympic.service.ts` |
| Création du pie-chart     | `home.component.ts` | `pie-chart.component.ts` |
| Création du line-chart    | `country.component.ts` | `line-chart.component.ts` |
| Bloc libellé + valeur     | `home.component.html`<br>`country.component.html`| `stat.component.html`<br>`stat.component.ts` |
| Nom de l'appli + `<hr/>`  | `home.component.html` | `header.component.html` |
| Forme des données du Json | nulle part (any) | `olympic.model.ts`<br>`participation.model.ts` |
| Destruction du Chart      | nulle part | `pie-chart.component.ts`<br>`line-chart.component.ts` |
| Gestion des erreurs       | `home.component.ts`<br>`country.component.ts` | `olympic.service.ts`<br>`home.component.ts`<br>`country.component.ts` |


## Prise en compte de modifications futures

- **Intégration d'une API** : les pages ne connaissent que le service et les models. Pour remplacer le fichier JSON par une API REST, il suffit de modifier le service (l'URL, qui peut aller dans `environments/`, et la conversion du format si l'API renvoie autre chose). Les pages et les composants ne changent pas.

- **Composants réutilisables** : j'ai créé `stat`, `pie-chart` et `line-chart` parce que la duplication existe déjà dans les deux pages actuelles. Si d'autres pages les utilisent plus tard, ils seront prêts, mais ce n'est pas la raison du choix.

- **Nouvelle page** : on ajoute un composant dans `pages/` et sa route dans `app-routing.module.ts`. On réutilise les fichiers de `models/` et les composants existants, et on utilise `olympic.service.ts` pour les requêtes, les données et les erreurs.