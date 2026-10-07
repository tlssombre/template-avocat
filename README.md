# Template cabinet juridique

Site React/Vite et API Node.js avec base SQLite. L’ouverture animée présente un sceau et une balance ; les mouvements sont réduits automatiquement selon la préférence système.

## Démarrage local

Node.js 24 ou plus récent est requis (`node:sqlite`).

```bash
npm ci
cp .env.example .env
```

Remplacez `ADMIN_PASSWORD` dans `.env` par un mot de passe unique d’au moins 12 caractères. Lancez ensuite deux terminaux :

```bash
npm run dev:api
npm run dev
```

Ouvrez l’adresse affichée par Vite pour le site, puis `/#admin` pour l’administration. Le serveur API écoute par défaut sur `127.0.0.1:3001` et Vite relaie les appels `/api`.

## Production

```bash
npm run build
npm start
```

`npm start` sert le site compilé et l’API sur le port `PORT` (3001 par défaut). Déployez derrière HTTPS et un reverse proxy. Sur un hébergeur conteneurisé, réglez `HOST=0.0.0.0`. Montez un volume persistant pour `DB_PATH` ; la valeur par défaut est `server/data.sqlite`. Ne committez jamais `.env` ou la base SQLite.

## Administration

L’admin gère les coordonnées, les principaux textes et images, les expertises, l’équipe, les articles, la FAQ et les indications de disponibilité. Les formulaires créent des demandes enregistrées dans SQLite, avec suivi de statut et export JSON. La session administrateur utilise un cookie HttpOnly. Le mot de passe de `.env` initialise ou remplace celui de la base au démarrage ; un redémarrage déconnecte les sessions actives lorsqu’il est défini.

Le site est un template : les noms, profils, chiffres, coordonnées et images sont illustratifs. Avant un usage réel, renseignez les mentions légales et la politique de confidentialité du cabinet, et définissez une politique de conservation des demandes. Il n’y a pas encore de notification par email, de calendrier de créneaux réels, de dépôt de documents ni d’espace client.
