# Customer App Setup

## Overzicht

De customer app is een aparte frontend applicatie voor klanten om offerte aanvragen te doen. Deze communiceert met de backend API in plaats van direct met Business Central.

## Development

### Start Customer App

```bash
npm run dev:customer
```

De customer app draait op `http://localhost:5174` (andere poort dan sales app)

### Start Sales App (origineel)

```bash
npm run dev
```

De sales app draait op `http://localhost:5173`

### Start Backend API

```bash
cd backend
npm run dev
```

Backend API draait op `http://localhost:3001`

## Environment Variables

Voor de customer app, maak een `.env` bestand in de root:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Flow Verschil

### Sales App Flow:
1. Configuratie
2. Prijsopgave
3. Klantnummer invoeren
4. **Directe submission naar Business Central**

### Customer App Flow:
1. **Klantgegevens invullen**
2. Configuratie
3. Prijsopgave
4. **Offerte aanvraag verzenden naar backend**
5. Bevestiging met aanvraagnummer

## Build

### Customer App Build

```bash
npm run build:customer
```

Output: `dist-customer/`

### Sales App Build

```bash
npm run build
```

Output: `dist/`

## Deployment

Beide apps kunnen apart gedeployed worden:
- Sales app: `/` of `/sales`
- Customer app: `/customer` of aparte subdomain

## Testing

1. Start backend API: `cd backend && npm run dev`
2. Start customer app: `npm run dev:customer`
3. Open `http://localhost:5174`
4. Vul klantgegevens in
5. Configureer product
6. Bekijk prijsopgave
7. Verstuur aanvraag
8. Controleer backend database voor nieuwe aanvraag
