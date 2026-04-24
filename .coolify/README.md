# Déploiement Coolify

## Prérequis

- Coolify ≥ 4.x sur le VPS.
- Supabase self-hosted déjà déployé sur le même Coolify (ou accessible depuis).
- Domaine pointé (A record) vers le VPS.

## Étapes

1. **Nouvelle ressource** → **Application** → **Public Repository** → coller l'URL du repo.
2. **Build Pack** : `Dockerfile`.
3. **Port exposé** : `4321` (HTTP).
4. **Domaine** : renseigner (ex : `mastery.ton-domaine.com`). Coolify gère Let's Encrypt.
5. **Variables d'environnement** : voir `.env.example` à la racine. Au minimum :
   - `PUBLIC_ENV=production`
   - `PUBLIC_SITE_URL=https://mastery.ton-domaine.com`
   - `PUBLIC_SUPABASE_URL=https://supabase.ton-domaine.com`
   - `PUBLIC_SUPABASE_ANON_KEY=…`
   - `SUPABASE_SERVICE_ROLE_KEY=…` (marquer comme secret)
   - `EXPERT_USER_EMAILS=toi@dom.com`
6. **Migrations Supabase** : jouer `supabase/migrations/0001_init.sql` via :
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_init.sql
   ```
7. **Deploy**. Healthcheck Coolify suit `GET /` sur le port 4321.

## Mise à jour

Push sur la branche principale → webhook Coolify → rebuild + redeploy. Zero-downtime géré par Coolify si 2 replicas configurés.

## Rollback

Coolify garde les N dernières images — retour à la précédente via le bouton *Rollback*.
