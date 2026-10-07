# Template cabinet juridique

Site React/Vite responsive pour cabinet d’avocats, étude notariale ou cabinet de conseil. L’ouverture animée présente un sceau et une balance ; les mouvements sont réduits automatiquement selon la préférence système.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir `/` pour le site et `/#admin` pour le tableau de bord. `npm run build` génère `dist/`.

## Administration de démonstration

Le tableau de bord permet de modifier les coordonnées, textes et images principales, expertises, membres de l’équipe, articles, FAQ et indications de disponibilité. Les formulaires de rendez-vous créent des demandes consultables avec suivi de statut. Un export JSON est disponible.

Les données sont conservées dans `localStorage` sur **le même navigateur uniquement**. Cette démo ne dispose ni de compte administrateur, ni de base de données partagée, ni d’envoi d’email. Ne l’utilisez pas pour recevoir de vrais dossiers ou données confidentielles. Avant mise en ligne pour un cabinet, brancher une API authentifiée, un stockage sécurisé, les notifications et les pages légales propres au cabinet.

Les noms, chiffres, profils, coordonnées et images fournis sont fictifs ou illustratifs et doivent être remplacés.
