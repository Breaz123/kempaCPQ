# Backend Setup Instructies

## Stap 1: Dependencies Installeren

```bash
cd backend
npm install
```

## Stap 2: Database Configuratie

### Optie A: SQLite (Snelste voor development)

1. Open `prisma/schema.prisma` en zorg dat de datasource is:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Maak een `.env` bestand (of gebruik `.env.example`):
   ```bash
   DATABASE_URL="file:./dev.db"
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

### Optie B: PostgreSQL (Voor production)

1. Installeer PostgreSQL en maak een database:
   ```sql
   CREATE DATABASE cpq_kempa;
   ```

2. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/cpq_kempa?schema=public"
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

3. Zorg dat `prisma/schema.prisma` gebruikt:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

## Stap 3: Database Migrations

```bash
# Genereer Prisma Client
npm run prisma:generate

# Run database migrations (maakt tabellen aan)
npm run prisma:migrate
```

Bij de eerste migratie wordt gevraagd om een naam, bijvoorbeeld: `init`

## Stap 4: Start Development Server

```bash
npm run dev
```

De server draait nu op `http://localhost:3001`

## Testen

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Test Quote Request

```bash
curl -X POST http://localhost:3001/api/quote-requests \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## Prisma Studio (Database GUI)

Bekijk en bewerk database data visueel:

```bash
npm run prisma:studio
```

Opent op `http://localhost:5555`

## Troubleshooting

### "Prisma Client not generated"
```bash
npm run prisma:generate
```

### "Migration failed"
- Controleer DATABASE_URL in `.env`
- Voor PostgreSQL: zorg dat database bestaat en toegankelijk is
- Voor SQLite: zorg dat je schrijfrechten hebt in de backend folder

### "Port already in use"
- Wijzig PORT in `.env` naar een andere poort (bijv. 3002)
