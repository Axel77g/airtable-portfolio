# Frontend Portfolio Airtable

Ce projet frontend est une application React qui sert d'interface utilisateur pour afficher et gérer un portfolio de projets. L'application utilise les technologies TypeScript, Framer Motion pour les animations, et communique avec un backend via des providers.

### Stack
- Typescript
- React
- Framer Motion
- Tailwind
- React Router

## Instalation et lancement

```bash
 npm i && npm run dev
```
Lance un serveur de développement vite sur http://locahost:5173

Le frontend est configuré pour utiliser le backend sur l'url http://locahost:3000 elle est modifiable dans le `.env`


## Routes disponible

- Route `/` -> Home slider avec les projets
- Route `/projects/:slug` -> Détail d'un projet
- Route `/login` -> Page de login administrateur dashboard de gestion
- Route `/admin` (redirection `/login` si non connecté) -> page de gestion 

## Caractéristiques principales

- **Interface utilisateur interactive** avec animations fluides
- **Système de providers** pour la communication avec l'API
- **Authentification** pour l'accès à l'interface d'administration
- **Gestion des projets** via une interface admin sécurisée
- **Slider de projets** animé avec Framer Motion + pagination et search incluse

## Architecture

L'application est structurée autour des composants suivants:

### Système de Provider

Le pattern Provider est implémenté pour gérer toutes les communications avec l'API backend:

- **Provider.ts**: Classe de base abstraite pour tous les providers
- **ProjectsProvider.ts**: Gestion des projets (récupération, like/dislike, publication)
- **AuthProvider.ts**: Gestion de l'authentification

Ces providers encapsulent la logique de communication avec l'API et utilisent Axios avec la configuration appropriée pour gérer les credentials
