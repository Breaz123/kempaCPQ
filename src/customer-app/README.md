# Customer CPQ App

Klantgerichte frontend voor offerte aanvragen.

## Flow

1. **Klantgegevens** - Gebruiker vult contactgegevens in
2. **Configuratie** - Product configuratie (MDF poedercoating)
3. **Prijsopgave** - Bekijk de berekende prijs
4. **Aanvraag verzenden** - Verstuur offerte aanvraag naar backend
5. **Bevestiging** - Ontvang bevestiging met aanvraagnummer

## Verschil met Sales App

- **Sales App**: Directe quote submission naar Business Central
- **Customer App**: Offerte aanvraag via backend API (wordt later door sales verwerkt)

## API Integratie

De customer app communiceert met de backend API op:
- `POST /api/quote-requests` - Nieuwe offerte aanvraag

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Development

De customer app gebruikt dezelfde Vite setup als de sales app. 
Voor development kan je een aparte Vite config maken of de root aanpassen.
