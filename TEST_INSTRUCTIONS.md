# Customer App Test Instructies

## Status

✅ Database setup voltooid (SQLite)
✅ Backend dependencies geïnstalleerd
✅ Database migrations uitgevoerd
✅ Backend server gestart
✅ Customer app gestart

## Testen

### 1. Backend API Controleren

Open in browser of gebruik curl:
```
http://localhost:3001/api/health
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

### 2. Customer App Openen

Open in browser:
```
http://localhost:5174
```

### 3. Test Flow

#### Stap 1: Klantgegevens
- Vul naam in (verplicht)
- Vul e-mailadres in (verplicht)
- Optioneel: telefoon, bedrijfsnaam, adres

#### Stap 2: Configuratie
- Lengte: 1000 mm
- Breedte: 500 mm
- Hoogte: 18 mm
- Aantal: 5
- Selecteer coating zijden (minimaal 1)

#### Stap 3: Prijsopgave
- Bekijk de berekende prijs
- Controleer configuratie details

#### Stap 4: Aanvraag Verzenden
- Controleer klantgegevens
- Klik op "Offerte Aanvraag Verzenden"
- Wacht op bevestiging

#### Stap 5: Bevestiging
- Controleer aanvraagnummer (QR-2024-XXX)
- Controleer status (PENDING)
- Controleer verzenddatum

### 4. Backend Database Controleren

Gebruik Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

Of check de database direct:
```bash
cd backend
# SQLite database is in dev.db
```

### 5. API Testen met curl

Test een quote request:
```bash
curl -X POST http://localhost:3001/api/quote-requests \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

Voorbeeld test-request.json:
```json
{
  "customerInfo": {
    "name": "Test Klant",
    "email": "test@example.com",
    "phone": "0612345678",
    "companyName": "Test BV",
    "country": "NL"
  },
  "configuration": {
    "id": "config-1",
    "lengthMm": 1000,
    "widthMm": 500,
    "heightMm": 18,
    "quantity": 5,
    "coatingSides": ["top", "bottom"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "product": {
    "id": "prod-1",
    "number": "MDF-001",
    "description": "MDF Powder Coating",
    "unitPrice": 25.50,
    "currencyCode": "EUR"
  },
  "priceResponse": {
    "unitPrice": 135.00,
    "totalPrice": 675.00,
    "currencyCode": "EUR",
    "itemNumber": "MDF-001",
    "quantity": 5
  }
}
```

## Troubleshooting

### Backend start niet
- Controleer of poort 3001 vrij is
- Check `.env` bestand in backend folder
- Check database migraties: `npm run prisma:migrate`

### Customer app start niet
- Controleer of poort 5174 vrij is
- Check `.env` bestand in root (VITE_API_BASE_URL)
- Check node_modules: `npm install`

### API calls falen
- Check CORS settings in backend
- Check VITE_API_BASE_URL in frontend
- Check browser console voor errors

### Database errors
- Check DATABASE_URL in backend/.env
- Run migrations opnieuw: `npm run prisma:migrate`
- Check Prisma client: `npm run prisma:generate`

## Volgende Stappen

Na succesvolle test:
1. Email notificaties implementeren (Fase 4)
2. Admin dashboard voor sales team
3. Authentication toevoegen
4. Production deployment
