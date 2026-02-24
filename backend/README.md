# CPQ Kempa Backend API

Backend API voor CPQ Kempa applicatie. Handelt offerte aanvragen van klanten af.

## Features

- REST API voor offerte aanvragen
- PostgreSQL database (met Prisma ORM)
- TypeScript voor type safety
- Express.js server

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: PostgreSQL (Production)

1. Maak een PostgreSQL database aan
2. Update `.env` met je database URL:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/cpq_kempa?schema=public"
   ```

#### Option B: SQLite (Development)

1. Update `.env`:
   ```
   DATABASE_URL="file:./dev.db"
   ```
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

### 3. Database Migrations

```bash
# Genereer Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 4. Environment Variables

Maak een `.env` bestand aan met de volgende variabelen:

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Storage Configuration
# Options: 'local' or 'cloudinary'
STORAGE_TYPE=local

# Cloudinary Configuration (only needed if STORAGE_TYPE=cloudinary)
# Get these from https://cloudinary.com/console
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

#### Storage Options

**Lokale opslag (default):**
- Foto's worden opgeslagen in `src/customer-app/public/images/poederlak/`
- Werkt direct zonder extra configuratie
- Geschikt voor development

**Cloudinary (aanbevolen voor productie):**
1. Maak een gratis account op [cloudinary.com](https://cloudinary.com)
2. Ga naar je dashboard en kopieer je credentials
3. Zet in `.env`:
   ```
   STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=je_cloud_name
   CLOUDINARY_API_KEY=je_api_key
   CLOUDINARY_API_SECRET=je_api_secret
   ```
4. Foto's worden nu automatisch naar Cloudinary geüpload en via CDN geserveerd

### 5. Start Development Server

```bash
npm run dev
```

De server draait op `http://localhost:3001`

## API Endpoints

### Health Check

```
GET /api/health
```

### Quote Requests

```
POST   /api/quote-requests              # Nieuwe offerte aanvraag
GET    /api/quote-requests               # Lijst van aanvragen
GET    /api/quote-requests/:id           # Specifieke aanvraag
GET    /api/quote-requests/number/:nr   # Aanvraag bij request number
PATCH  /api/quote-requests/:id/status   # Update status
```

### Catalog Management

```
GET    /api/catalog                      # Publieke catalogus items
GET    /api/catalog/admin                # Alle items (admin)
POST   /api/catalog                      # Nieuw item (admin)
PUT    /api/catalog/:id                  # Update item (admin)
DELETE /api/catalog/:id                  # Verwijder item (admin)
POST   /api/catalog/upload               # Upload afbeelding (admin)
```

## Database Schema

Zie `prisma/schema.prisma` voor het volledige schema.

### QuoteRequest Model

- Klantgegevens (naam, email, telefoon, adres)
- Configuratie data (JSON)
- Product data (JSON)
- Price data (JSON)
- Status workflow (PENDING → REVIEWING → APPROVED/REJECTED)

## Development

### Prisma Studio

Bekijk en bewerk database data:

```bash
npm run prisma:studio
```

### Database Migrations

Maak een nieuwe migration:

```bash
npm run prisma:migrate
```

## Production

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── routes/          # API routes
│   │   └── server.ts        # Express server
│   ├── config/
│   │   └── database.ts      # Prisma client
│   ├── models/              # Domain models
│   ├── services/            # Business logic
│   └── types/               # TypeScript types
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

## Next Steps

- [ ] Email notificaties (Fase 4)
- [ ] Input validatie met Zod
- [ ] Authentication & Authorization
- [ ] Rate limiting
- [ ] Logging (Winston/Pino)
- [ ] API documentation (Swagger/OpenAPI)
