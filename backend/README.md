"# Backend Portfolio Airtable
Ce projet backend sert de serveur d'API pour une application de portfolio de projets, utilisant Airtable comme base de données. Il offre une architecture avec diverses fonctionnalités comme la mise en cache, l'authentification, et un pattern repository bien structuré.

### Stack

- Typescript 
- Airtable

## Instalation et lancement

Créer un `.env` en suivant les variables à configurer dans `.env.example`

```bash
 npm i && npm run dev
```

Lance un serveur express sur http://locahost:3000

## Architecture

Le backend est construit sur Node.js avec Express et TypeScript, organisé selon les principes suivants:

- **Pattern Repository**: Séparation claire entre les couches de données et métier
- **Validation de données**: Utilisation de Zod pour valider les données entrantes
- **Mise en cache**: Système intelligent pour limiter les appels à l'API Airtable
- **Gestion de session**: Persistance des préférences utilisateur et authentification

## Système de Repository

Le projet implémente un pattern repository avec les éléments suivants:

### Interfaces de Repository

Les interfaces (comme `IUserRepository`, `IProjectRepository`) définissent les contrats que les implémentations concrètes doivent respecter. Elles se trouvent dans le dossier `repositories/`.
Permet a l'avenir de changer de système de stockage (coût et limitation airtable)

### Classe abstraite AbstractAirtableRepository

Cette classe fournit:
- L'infrastructure commune pour interagir avec Airtable
- Des méthodes de validation avec Zod
- Des helpers pour échapper aux caractères spéciaux dans les requêtes
- L'intégration avec le système de cache

Chaque repository concret étend cette classe et implémente:
- `getTableName()`: Retourne le nom de la table Airtable
- `getFieldSchema()`: Définit le schéma Zod pour la validation des records reçu par airtable

> Cette classe peut être utilisé dans d'autre projet utilisant un patern Repository avec Airtable, elle permet rapidement d'avoir un cache fonctionnel et un typage fort des sortie de l'API

### Implémentations concrètes

Les implémentations comme `AirtableUserRepository` et `AirtableProjectRepository` fournissent:
- Des méthodes spécifiques à chaque entité (ex: findByEmail, findBySlug)
- La conversion des données Airtable vers des entités du domaine
- La validation des données reçues de l'API Airtable

## Système de Cache

1. **Durée de vie**

- Les entrées expirent après 30 minutes
- vérifie la validité temporelle `isOutdated()`

2. **Performance**

- Évite les appels API répétés
- Optimise les ressources avec une limite de taille
- Utilise un système de hachage pour identifier de manière unique les requêtes

3. **Gestion de la mémoire**

- Limite de 50 entrées maximum
- Suppression automatique des entrées les plus anciennes
- Ne met pas en cache les résultats vides

## AirtableQueryPaginatedDecorator
Ce décorateur améliore les requêtes Airtable en ajoutant la gestion de la pagination
Il fonctionne de paire avec le systeme de caching vu précédement

1. **Objectif**

- Contourne les limitations de la librairie Airtable pour la pagination (manque me champs offset de l'api avec les methodes de base `all()` `firstPage()`, `eachPage()` non applicable)
- Implémente l'interface pour la compatibilité avec le cache `IAirtableQuery`

2. **Fonctionnalités clés**

- Gestion de la pagination via `paginate()`
- Communication directe avec l'API Airtable via axios
- Maintient les informations de page (hasNext, hasPrev)

> Creation de cette class nécessaire pour permetre le cache d'une query paginé (notamment pour la liste des projets), 
> le systeme de pagination avec `eachPage()`, ne me permetait pas d'utiliser mon systeme de cache `AirtableCache`

## Système de Controller avec Zod

La fonction `makeController` permet de créer des contrôleurs Express avec validation automatique:

1. **Validation des entrées**: Utilise Zod pour valider les données de requête (query, body, params)
2. **Traitement des erreurs**: Renvoie une erreur 422 si la validation échoue
3. **Typage fort**: Le payload validé est typé et accessible via `req.payload`
