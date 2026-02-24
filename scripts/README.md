# Scripts

## download-kempa-images.js

Script om images te downloaden van de Kempa poederlakkerij pagina.

### Gebruik

```bash
npm run download-images
```

of

```bash
node scripts/download-kempa-images.js
```

### Wat doet het script?

1. **Haalt HTML op** van de Kempa poederlak pagina: `https://kempa.be/nl/wat-we-doen/poederlakkerij/poederlak/`
2. **Extraheert image URLs** uit de HTML, specifiek gericht op:
   - Realisaties images
   - Project images
   - Poederlak gerelateerde images
3. **Download images** naar `src/customer-app/public/images/poederlak/`
4. **Slaat bestaande images over** om tijd te besparen

### Features

- ✅ Automatische redirect handling
- ✅ User-Agent header voor betere compatibiliteit
- ✅ Filtert alleen relevante images (geen logo's, icons, etc.)
- ✅ Ondersteunt verschillende image attributen (src, data-src, data-lazy-src, etc.)
- ✅ Maakt automatisch de output directory aan
- ✅ Gedetailleerde progress logging

### Output

Images worden opgeslagen in:
```
src/customer-app/public/images/poederlak/
```

### Opmerkingen

- Het script werkt het beste als de website statische HTML gebruikt
- Als images dynamisch geladen worden via JavaScript, kunnen sommige images gemist worden
- In dat geval kun je handmatig images toevoegen of de browser Network tab gebruiken om image URLs te vinden
