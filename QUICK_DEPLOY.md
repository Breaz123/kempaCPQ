# Quick Deploy Guide - 5 Minuten Setup

Snelle deployment guide voor Vercel + Railway.

## ⚡ Snelle Stappen

### 1. Push naar GitHub (2 min)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Railway Backend (2 min)

1. Ga naar [railway.app](https://railway.app) → Login met GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Selecteer je repo
4. **New** → **Database** → **Add PostgreSQL**
5. **New** → **GitHub Repo** → Selecteer repo
6. In service settings → **Root Directory**: `backend`
7. **Variables** tab → Voeg toe:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://placeholder.vercel.app
   ```
8. Wacht op deployment (~2 min)
9. **Noteer de URL**: `https://xxx.up.railway.app`

### 3. Vercel Frontend (1 min)

1. Ga naar [vercel.com](https://vercel.com) → Login met GitHub
2. **Add New Project** → Import repo
3. **Environment Variables** → Voeg toe:
   ```
   VITE_API_BASE_URL=https://xxx.up.railway.app
   ```
   (Gebruik je Railway URL!)
4. **Deploy** → Wacht (~2 min)
5. **Noteer de URL**: `https://xxx.vercel.app`

### 4. Update CORS (30 sec)

1. Railway → Backend service → **Variables**
2. Update `CORS_ORIGIN` met je Vercel URL
3. Railway herstart automatisch

### 5. Database Migrations (1 min)

**Via Railway Dashboard:**
1. Railway → Backend service → **Deployments** → **View Logs**
2. Klik **Shell** tab
3. Run: `npm run prisma:migrate:deploy`

**Of via CLI:**
```bash
npm i -g @railway/cli
railway login
railway link
cd backend
railway run npm run prisma:migrate:deploy
```

## ✅ Testen

1. Open je Vercel URL
2. Test de flow:
   - Configureer product
   - Zie geblurde prijs
   - Vul gegevens in
   - Zie prijs
   - Verstuur aanvraag

## 🔧 Troubleshooting

**Backend werkt niet?**
- Check Railway logs
- Check environment variables
- Run migrations: `npm run prisma:migrate:deploy`

**Frontend kan backend niet bereiken?**
- Check `VITE_API_BASE_URL` in Vercel
- Check CORS in Railway
- Check browser console

**Database errors?**
- Check DATABASE_URL in Railway
- Run migrations
- Check schema provider (moet `postgresql` zijn)

## 📝 Belangrijke URLs

- **Frontend**: `https://xxx.vercel.app`
- **Backend**: `https://xxx.up.railway.app`
- **Health Check**: `https://xxx.up.railway.app/api/health`

## 💰 Kosten

- **Vercel**: Gratis (100GB bandwidth)
- **Railway**: Gratis $5 credit/maand
- **PostgreSQL**: Inbegrepen

Klaar! 🎉
