# 1. Architecture et séparation des responsabilités
## `home.component.ts` et `country.component.ts`

- fichiers trop volumineux : ils comportent de la logique métier et de la gestion de données.
>Manque les dossiers **services** et les **models** pour déléguer ces différents traitements

- `ngOnInit()` (l.21) : contient à la fois 
    - appel http dans le composant (donc le composant dépend HttpClient et de l'url écrite en dur dans le code).
    - traitement des données : la méthode récupère, calcule et construit le graphique. 

>La récupération et le traitement devraient être dans un service.  
>Un dossier models pourrait gérer les interfaces pour décrire les données du Json.


# 2. Typage
## `home.component.ts`

- Typage faible `any` : 8 fois.  <lister>

Problèmes avec `any` :
- pas d'autocomplétion de l'IDE
- possibilités d'erreurs qui passeront inaperçues
>Solution avec la création d'interfaces pour décrire les données json dans le dossier models (voir partie 1).

## `country.component.ts`
- Mauvais typage de la variable `medals` dans me chart, ce qui demande des changements à 3 endroits du code: 
    - typage du paramètre du milieu de `lineChart`: `string[]` déclare que les valeurs du graphique donc les médailles vont être des chaînes de charactères. 
    - `toString()` (ll.35 et 37)  et `parseInt` (ll. 36 et 38) : rend le code compliqué inutilement.
    - `buildChart()medals: string[]` (l.41).  

>Dans le json, medals est bien un `number` mais dans le chart on attend une `string`, cela génère du code compliqué pour rien (voir partie 1 ).

- Typage incohérent de totalEntries : passer de `any` à `number`.
- Typage faible `any` : 11 fois.


# 3. Gestion asynchrone (Observables et cycle de vie)
## `home.component.ts` et `country.component.ts`

- Pour la création du graphe , rien ne garantit que le canvas existe : cela fonctionne parce que la réponse arrive après la construction de la vue. Si le canvas devenait conditionnel (`ngIf`), le graphique ne s’afficherait plus.
>Utilisation de `ngAfterViewInit()` pourrait être la solution pour le premier pb (création de canva).

- Chart n'est jamais supprimé → risque de fuite mémoire à chaque fois qu'on quitte la page et qu'on retourne dessus.  
>Utilisation de `ngOnDestroy()`et `destroy()`pour le second qui permettrait de nettoyer les charts créés.

## `country.component.ts`
- Les deux observables (ll. 26-27) sont indépendants mais le second dépend du résultat du premier, sans que rien dans le code ne garantisse l'ordre, il fonctionne par coïncidence de timing.
>On pourrait utiliser un opérateur RxJS pour éviter ça en cas de changement dans le code (ex: une nouvelle source du json).


# 4. Qualité et propreté du code
## `home.component.ts` et `country.component.ts`

- `pipe()` (l.27) sans opérateur donc inutile.
- Création des graphes est dupliquée et mélangée à la logique de page.
>On pourrait envisager un composant générique si d'autres graphes viennent à être ajoutés, ou deux petits composants spécifiques pour gérer la construction, configuration et suppression.
- `subscribe` (l.27) : ancienne syntaxe donc code obsolète, nouvelle reco est un seul objet avec des clés nommées pour une meilleure lisibilité.
- `lineChart` et `pieChart` jamais utilisé donc inutile de les stocker dans des variables dans l'état actuel du code. Si on délègue la création d'un Chart, on aura besoin des variables.
- url écrits en dur dans le code, donc difficilement maintenable en cas de changement d'url.

## `home.component.ts`
- `console.log()` (ll. 24-35) code oublié à supprimer.
- `titlePage` écrit en dur dans le code, peu maintenable en cas de changement de nom de page, s'il faut changer plusieurs noms de pages et qu'elles sont toutes en dur dans leur fichier, il faut aller chercher chaque variable.
- `this.totalJOs = Array.from(new Set(data.map((i: any) => i.participations.map((f: any) => f.year)).flat())).length;` (l. 26): création d'un `Array` puis un `.length` est inutile, on pourrait faire utiliser la méthode `.size` de `Set` .
- `i` (l.30) ,n'est pas typé et donc de type `any` (indiqué dans l'IDE).
- `e` (l.55) ,n'est pas typé et donc de type `any`(indiqué dans l'IDE).

## `country.component.ts`
- La méthode `map((i) => i)` (l.33) renvoi le tableau tel quel sans aucune transformation, donc code inutile.
- En plus cette méthode ne sert qu'à calculer le length du tableau donc code doublement inutile. 
>On pourrait compter le nombre d'objets dans les tableaux de participations.
- `router`importé mais jamais utilisé, à supprimer.
- Gestion des médailles et des athlètes (ll.26-39) : code similaire qui pourrait être une méthode privée.

## `home.component.html` et `country.component.html`
- Le balisage n'est pas optimisé, beaucoup de `div` qui empêcherait un lecteur d'écran de comprendre le rôle de chaque balise.
- Présence de `h2` mais pas de  `h1` : la hiérarchie des titres n'est pas respectée.
- La variable `titlePage` dans une `div` au lieu d'être dans la balise `h1` manquante.
- Le `header` n'existe pas, mais il est décrit dans les deux fichiers.
>Un composant header pourrait être créé et inséré à `index.html`.

    <body>
        <insert header here>
        <app-root></app-root>
    </body>
- Aucun attributs d'accessibilité.
>Accessiblité pour Charts : https://www.chartjs.org/docs/latest/general/accessibility.html
- Balisage pour les labels / valeurs autre que des simple `p`.
>Utilisation possible des balises de table, donc `tr`, `th` et `td`.

## `home.component.html`
- Attribut `lang=en` dans `index.html` mais abréviation française : JOs.  

## `country.component.html`
- Code inutilisé, l'attribut css `chart-container` ne sert pas.

## `styles.scss`
- L'attribut `.heading` est défini mais utilisé dans aucun template.
- L'attribut `center` est défini mais redéfini dans `not-found.component.scss`.

# 5. Robustesse et comportement visuel
## `home.component.ts` et `country.component.ts`
- présence d'un `!`après des variables qui indique la promesse qu'une valeur sera attribuée par la suite alors que rien n'indique que ça sera le cas.
    - lineChart (l.14 de `country.component`) 
    - variable `error` (l.16 de `home.component` et l. 19 de `country.component`) 

- ` if (data && data.length > 0) ` vérification partielle et insuffisante - vérifie la présence de data et si data n'est pas vide, il manque : 
    - la vérification de chaque clé de l'objet **en cas d'API** pour l'instant c'est un json statique donc 
    - du coup toutes les vérifications `?` `??` qui viennent après la l. 33 sont inutiles parce que si `selectedCountry` est undefined alors le reste du code plantera parce les lignes suivantes ne seront jamais atteintes

- les erreurs "pays introuvable", "ressource introuvable" ou "erreur réseau" par exemple ne sont pas traitées de manières différenciées, la page `not-found` n'est jamais appelée alors qu'elle existe, l'utilisateur ne peut pas savoir d'où vient l'erreur.

## `home.component.ts`
- `pageTitle` n'a pas le mot clé public, ce n'est pas un problème en soi parce qu'elle est implicitement publique, mais ça n'est pas raccord avec les autres propriétés qui elles ont le mot clé `public` indiqué. soit on indique que toutes les propriétés sont publiques soit aucune, mais les présenter différement fait bizarre.

## `home.component.html` et `country.component.html`
- Le message `error` n'est jamais lu dans le template donc jamais affiché à l'utilisateur en cas d'échec de la requête.

## `home.component.html`
- La navigation vers les pages des pays n'existe qu'au clic, gérée dans `home.component.ts`. Un `<canvas>` n'est pas activable au clavier : les personnes qui naviguent sans souris ne peuvent pas accéder aux pages des pays.
>Rendre la navigation accessible au clavier : élément focalisable (`tabindex`) et réaction aux touches Entrée / Espace, ou alternative sous forme de liens vers chaque pays.
>Source : https://pauljadam.com/demos/canvas.html

- Les parts du camembert ne se distinguent que par la couleur : les personnes qui ne distinguent pas certaines couleurs ne peuvent pas identifier les pays.
>Ajouter un indice en plus de la couleur (légende, noms ou valeurs affichés sur le graphique).

- Le `<canvas>` n'a aucune description textuelle : un lecteur d'écran ne perçoit pas son contenu.
>Ajouter `role="img"` et un `aria-label` qui résume le graphique, voire un contenu de secours ou un tableau de données (voir la page d'accessibilité de Chart.js).

## `not-found.component.html`
- Message d'erreur écrit en dur dans le template.
- Message d'erreur plutôt générique, rajouter indication sur la cause de l'erreur.
- `Go back` n'est pas clair, vérifier où on retourne réellement et changer le texte si on retourne à la page d'accueil depuis une page pays.
- Même problème, pas de `h1` mais un `h2`.

## `home.component.scss`
- `styleUrls: ['./home.component.scss']` mais ce fichier scss est vide, les styles de ce fichier sont définis dans `style.scss`

## `country.component.scss`
- Responsive pas adapté

## `styles.scss`

<TODO check visuals and accessibility at home with ng serve>
<TODO À vérifier avec `ng serve` : où mène ``<a routerLink="">Go back</a>`` (pages `country` et `not-found`)>

