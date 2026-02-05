# Deployment Guide - Vercel + Railway

Deployment instructies voor CPQ Kempa applicatie.

## Overzicht

- **Frontend (Customer App)**: Vercel
- **Backend API**: Railway
- **Database**: PostgreSQL (via Railway)

## Stap 1: Code naar GitHub

### 1.1 Maak GitHub repository aan

```bash
# Initialiseer git (als nog niet gedaan)
git init
git add .
git commit -m "Initial commit"

# Maak repository op GitHub en push
git remote add origin https://github.com/jouw-username/cpq-kempa.git
git branch -M main
git push -u origin main
```

## Stap 2: Backend Deployen op Railway

### 2.1 Railway Setup

1. Ga naar [railway.app](https://railway.app)
2. Login met GitHub
3. Klik op **"New Project"**
4. Selecteer **"Deploy from GitHub repo"**
5. Selecteer je repository

### 2.2 Backend Service Toevoegen

1. Klik op **"New"** → **"GitHub Repo"**
2. Selecteer je repository
3. Railway detecteert automatisch de backend folder
4. **Belangrijk**: Selecteer de `backend` folder als root directory

### 2.3 PostgreSQL Database Toevoegen

1. In je Railway project, klik op **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway maakt automatisch een PostgreSQL database aan
3. De `DATABASE_URL` environment variable wordt automatisch toegevoegd

### 2.4 Environment Variables Instellen

Ga naar je backend service → **Variables** tab en voeg toe:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://jouw-app.vercel.app
```

**Let op**: Update `CORS_ORIGIN` na het deployen van de frontend met de echte Vercel URL.

### 2.5 Database Migrations

Railway voert automatisch de build uit, maar je moet migrations handmatig runnen:

**Optie A: Via Railway CLI**
```bash
# Installeer Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link naar je project
railway link

# Run migrations
cd backend
railway run npm run prisma:migrate deploy
```

**Optie B: Via Railway Dashboard**
1. Ga naar je backend service
2. Klik op **"Deployments"** → **"View Logs"**
3. Klik op **"Shell"** tab
4. Run: `npm run prisma:migrate deploy`

### 2.6 Backend URL Noteren

Na deployment krijg je een URL zoals: `https://cpq-backend-production.up.railway.app`

**Noteer deze URL** - je hebt hem nodig voor de frontend!

## Stap 3: Frontend Deployen op Vercel

### 3.1 Vercel Setup

1. Ga naar [vercel.com](https://vercel.com)
2. Login met GitHub
3. Klik op **"Add New Project"**
4. Import je GitHub repository

### 3.2 Project Configuratie

Vercel detecteert automatisch de `vercel.json` configuratie, maar controleer:

- **Framework Preset**: Other
- **Root Directory**: `.` (root)
- **Build Command**: `npm run build:customer` (automatisch van vercel.json)
- **Output Directory**: `dist-customer` (automatisch van vercel.json)
- **Install Command**: `npm install` (automatisch)

### 3.3 Environment Variables

Voeg toe in Vercel → Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://jouw-backend.railway.app
```

**Let op**: Vervang met je echte Railway backend URL!

### 3.4 Deploy

1. Klik op **"Deploy"**
2. Wacht tot build compleet is (~2-3 minuten)
3. Je krijgt een URL zoals: `https://cpq-kempa.vercel.app`

## Stap 4: CORS Update

Na het deployen van de frontend, update de backend CORS:

1. Ga naar Railway → Backend service → Variables
2. Update `CORS_ORIGIN` met je Vercel URL(s):
   
   **Voor alleen production:**
   ```
   CORS_ORIGIN=https://jouw-app.vercel.app
   ```
   
   **Voor production + preview deployments (aanbevolen):**
   ```
   CORS_ORIGIN=https://jouw-app.vercel.app
   ```
   *Note: Vercel preview URLs (bijv. `https://jouw-app-git-branch.vercel.app`) worden automatisch toegestaan als je de main Vercel domain instelt.*
   
   **Voor meerdere specifieke domains:**
   ```
   CORS_ORIGIN=https://jouw-app.vercel.app,https://jouw-app-custom-domain.com
   ```
   (Scheid meerdere URLs met een komma)
   
3. Railway herstart automatisch

**Belangrijk:** De backend ondersteunt nu automatisch Vercel preview deployments. Als je `CORS_ORIGIN` instelt op je main Vercel URL (bijv. `https://jouw-app.vercel.app`), worden alle preview URLs automatisch toegestaan.

## Stap 5: Database Schema Update (PostgreSQL)

Het schema is al ingesteld voor PostgreSQL, maar controleer:

**backend/prisma/schema.prisma** moet zijn:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Als je nog SQLite gebruikt, verander dit naar `postgresql` voordat je deployt.

## Stap 6: Testen

### 6.1 Backend Health Check

```bash
curl https://jouw-backend.railway.app/api/health
```

Verwacht antwoord:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "database": "connected"
  }
}
```

### 6.2 Frontend Testen

1. Open je Vercel URL in browser
2. Test de volledige flow:
   - Configuratie
   - Geblurde prijs
   - Klantgegevens invullen
   - Prijs zichtbaar maken
   - Offerte aanvraag verzenden

### 6.3 Database Controleren

Via Railway:
1. Ga naar je PostgreSQL database service
2. Klik op **"Query"** tab
3. Run: `SELECT * FROM quote_requests;`

Of gebruik Prisma Studio lokaal (met Railway DATABASE_URL):
```bash
cd backend
DATABASE_URL="jouw-railway-database-url" npx prisma studio
```

## Troubleshooting

### Backend start niet

1. Check Railway logs: Service → Deployments → View Logs
2. Controleer environment variables
3. Check of migrations zijn gerund: `npm run prisma:migrate deploy`

### Frontend kan backend niet bereiken

1. Check `VITE_API_BASE_URL` in Vercel environment variables
2. Check CORS settings in backend
3. Check browser console voor errors

### Database errors

1. Check of migrations zijn gerund
2. Check DATABASE_URL in Railway
3. Check Prisma schema provider (moet `postgresql` zijn)

### Build fails

**Frontend:**
- Check Vercel build logs
- Zorg dat `npm run build:customer` werkt lokaal
- Check TypeScript errors

**Backend:**
- Check Railway build logs
- Zorg dat `npm run build` werkt lokaal
- Check Prisma generate: `npm run prisma:generate`

## Environment Variables Overzicht

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://jouw-backend.railway.app
```

### Backend (Railway)
```env
DATABASE_URL=postgresql://... (automatisch van Railway)
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://jouw-app.vercel.app
```

## Kosten

- **Vercel**: Gratis tier (100GB bandwidth, unlimited deployments)
- **Railway**: Gratis $5 credit per maand (genoeg voor kleine apps)
- **PostgreSQL**: Inbegrepen bij Railway

## Automatische Deployments

Beide platforms deployen automatisch bij:
- Push naar main branch
- Pull requests (preview deployments)

## Monitoring

### Railway
- Logs: Service → Deployments → View Logs
- Metrics: Service → Metrics tab
- Database: Database → Query tab

### Vercel
- Analytics: Project → Analytics tab
- Logs: Project → Deployments → View Function Logs
- Performance: Project → Analytics → Performance

## Volgende Stappen

Na succesvolle deployment:
1. ✅ Test volledige flow
2. ✅ Setup custom domain (optioneel)
3. ✅ Configureer email notificaties (Fase 4)
4. ✅ Setup monitoring/alerts
5. ✅ Backup strategie voor database
