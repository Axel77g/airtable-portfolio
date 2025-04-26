# Backend Portfolio Airtable

Ce projet backend sert de serveur d'API pour une application de portfolio de projets, utilisant Airtable comme base de données. Il offre une architecture robuste avec diverses fonctionnalités comme la mise en cache, l'authentification, et un pattern repository bien structuré.

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

### Classe abstraite AbstractAirtableRepository

Cette classe fournit:
- L'infrastructure commune pour interagir avec Airtable
- Des méthodes de validation avec Zod
- Des helpers pour échapper aux caractères spéciaux dans les requêtes
- L'intégration avec le système de cache

Chaque repository concret étend cette classe et implémente:
- `getTableName()`: Retourne le nom de la table Airtable
- `getFieldSchema()`: Définit le schéma Zod pour la validation des records reçu par airtable

### Implémentations concrètes

Les implémentations comme `AirtableUserRepository` et `AirtableProjectRepository` fournissent:
- Des méthodes spécifiques à chaque entité (ex: findByEmail, findBySlug)
- La conversion des données Airtable vers des entités du domaine
- La validation des données reçues de l'API Airtable

## Système de Controller avec Zod

La fonction `makeController` permet de créer des contrôleurs Express avec validation automatique:

1. **Validation des entrées**: Utilise Zod pour valider les données de requête (query, body, params)
2. **Traitement des erreurs**: Renvoie une erreur 422 si la validation échoue
3. **Typage fort**: Le payload validé est typé et accessible via `req.payload`
