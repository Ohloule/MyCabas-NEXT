# MyCabas - Guide de développement

## Stack technique

- **Framework**: Next.js 16 (App Router)
- **Base de données**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **Authentification**: NextAuth.js (Auth.js) - à configurer
- **Styling**: Tailwind CSS v4
- **Déploiement**: Vercel (MVP) → VPS Hostinger (production)

## Structure du projet

```
mycabasapp_2026/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── health/        # Healthcheck endpoint
│   ├── layout.tsx         # Layout racine
│   └── page.tsx           # Page d'accueil
├── lib/
│   └── prisma.ts          # Client Prisma singleton
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   ├── seed.ts            # Script de seed
│   ├── data/
│   │   ├── markets.json   # Données des marchés
│   │   └── categories.json # Catégories de produits
│   └── migrations/        # Migrations Prisma
├── Dockerfile             # Build multi-stage pour production
├── docker-compose.yml     # Stack complète (app + db)
├── docker-compose.dev.yml # DB uniquement pour dev local
└── .env.example           # Template variables d'environnement
```

## Commandes utiles

```bash
# Développement
npm run dev              # Lancer le serveur de dev

# Base de données
npm run db:generate      # Générer le client Prisma
npm run db:migrate       # Créer une migration
npm run db:push          # Pousser le schéma (sans migration)
npm run db:seed          # Remplir la DB avec les données de base
npm run db:studio        # Interface web Prisma Studio
npm run db:reset         # Reset complet de la DB

# Build & Production
npm run build            # Build production
npm run start            # Lancer en production

# Docker (dev local avec PostgreSQL)
docker-compose -f docker-compose.dev.yml up -d   # Démarrer la DB
docker-compose -f docker-compose.dev.yml down    # Arrêter la DB
```

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans Settings > Database
3. Copier l'URL de connexion (Transaction pooler, port 6543)
4. Mettre à jour le fichier `.env` avec l'URL

## Modèles de données

### Entités principales

- **User**: Utilisateurs (clients, vendors, admins)
- **Vendor**: Profil commerçant (lié à un User)
- **Market**: Marchés avec coordonnées GPS
- **MarketOpening**: Horaires d'ouverture des marchés
- **Product**: Produits des vendors
- **Category**: Catégories de produits
- **ProductPrice/ProductStock**: Prix et stocks par marché

### Relations

```
User 1--1 Vendor
User 1--1 Address
Vendor 1--* Product
Vendor *--* Market (via MarketVendor)
Product *--1 Category
Product 1--* ProductPrice (par marché)
Product 1--* ProductStock (par marché)
Market 1--* MarketOpening
```

## Catégories de produits disponibles

1. Fruits & Légumes
2. Viandes & Charcuterie
3. Poissons & Fruits de mer
4. Fromages & Produits laitiers
5. Boulangerie & Pâtisserie
6. Épicerie & Condiments
7. Boissons
8. Bio & Nature

## Prochaines étapes (Phase 2)

1. [ ] Configurer NextAuth.js avec Credentials provider
2. [ ] Créer les pages d'authentification (login, register)
3. [ ] Implémenter la recherche de marchés (frontend)
4. [ ] Créer l'espace Vendor (dashboard, produits)
