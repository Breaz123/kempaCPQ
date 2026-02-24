# Storage Setup Guide

Deze applicatie ondersteunt twee manieren om foto's op te slaan:

## 1. Lokale Opslag (Default)

Foto's worden opgeslagen in `src/customer-app/public/images/poederlak/`

**Voordelen:**
- Geen extra configuratie nodig
- Werkt direct
- Geen externe dependencies

**Nadelen:**
- Foto's zijn alleen beschikbaar op de server waar ze zijn geüpload
- Bij deployment moeten foto's mee worden gedeployed
- Geen CDN (langzamer voor gebruikers ver weg)

**Gebruik:**
Zet in je `.env`:
```env
STORAGE_TYPE=local
```

## 2. Cloudinary (Aanbevolen voor Productie)

Foto's worden geüpload naar Cloudinary en via CDN geserveerd.

**Voordelen:**
- Foto's zijn altijd beschikbaar via URL
- Automatische CDN (sneller voor alle gebruikers)
- Automatische image optimization
- Werkt perfect bij deployment

**Setup Stappen:**

1. **Maak een gratis Cloudinary account:**
   - Ga naar [cloudinary.com](https://cloudinary.com)
   - Klik op "Sign Up for Free"
   - Maak een account aan

2. **Haal je credentials op:**
   - Na het inloggen zie je je Dashboard
   - Kopieer de volgende waarden:
     - **Cloud Name** (bijv. `dxyz123`)
     - **API Key** (bijv. `123456789012345`)
     - **API Secret** (bijv. `abcdefghijklmnopqrstuvwxyz`)

3. **Configureer in `.env`:**
   ```env
   STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=je_cloud_name
   CLOUDINARY_API_KEY=je_api_key
   CLOUDINARY_API_SECRET=je_api_secret
   ```

4. **Herstart de server:**
   ```bash
   npm run dev
   ```

5. **Test de upload:**
   - Upload een foto via de admin catalog pagina
   - De foto wordt nu automatisch naar Cloudinary geüpload
   - Je krijgt een Cloudinary URL terug (bijv. `https://res.cloudinary.com/...`)

## Wisselen tussen Storage Types

Je kunt altijd wisselen tussen lokale en cloud storage:

- **Naar Cloudinary:** Zet `STORAGE_TYPE=cloudinary` en voeg credentials toe
- **Naar lokaal:** Zet `STORAGE_TYPE=local` (of verwijder de regel)

**Let op:** Bestaande foto's blijven op de oude locatie staan. Alleen nieuwe uploads gebruiken het nieuwe storage type.

## Cloudinary Gratis Tier

Het gratis Cloudinary account geeft je:
- 25 GB storage
- 25 GB bandwidth per maand
- Onbeperkte transformaties
- Perfect voor kleine tot middelgrote projecten

Voor grotere projecten zijn er betaalde plannen beschikbaar.
