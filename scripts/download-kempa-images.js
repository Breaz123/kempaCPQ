/**
 * Script om images te downloaden van Kempa poederlakkerij pagina
 * 
 * Gebruik: node scripts/download-kempa-images.js
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEMPA_URL = 'https://kempa.be/nl/wat-we-doen/poederlakkerij/poederlak/';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'customer-app', 'public', 'images', 'poederlak');

// Maak output directory aan als deze niet bestaat
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Download een bestand van een URL met betere error handling
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    protocol.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          return reject(new Error('Redirect without location header'));
        }
        const absoluteRedirectUrl = redirectUrl.startsWith('http') 
          ? redirectUrl 
          : new URL(redirectUrl, url).href;
        return downloadFile(absoluteRedirectUrl, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        return reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

/**
 * Haal HTML op van een URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

/**
 * Extract image URLs uit HTML, specifiek gericht op realisaties sectie
 */
function extractImageUrls(html) {
  const imageUrls = new Set();
  
  // Zoek naar img tags met verschillende attributen (src, data-src, data-lazy-src, etc.)
  const imgPatterns = [
    /<img[^>]+src=["']([^"']+)["']/gi,
    /<img[^>]+data-src=["']([^"']+)["']/gi,
    /<img[^>]+data-lazy-src=["']([^"']+)["']/gi,
    /<img[^>]+data-original=["']([^"']+)["']/gi,
    /<img[^>]+srcset=["']([^"']+)["']/gi,
  ];
  
  imgPatterns.forEach(regex => {
    let match;
    while ((match = regex.exec(html)) !== null) {
      let url = match[1];
      
      // Voor srcset, neem de eerste URL
      if (url.includes(',')) {
        url = url.split(',')[0].trim().split(' ')[0];
      }
      
      // Maak absolute URL als het relatief is
      if (url.startsWith('/')) {
        url = 'https://kempa.be' + url;
      } else if (!url.startsWith('http')) {
        url = 'https://kempa.be/' + url;
      }
      
      // Filter alleen relevante images (realisaties, poederlak, project images)
      // Zoek naar images in realisaties sectie of met relevante keywords
      const isRealisatieImage = 
        url.includes('realisatie') || 
        url.includes('project') ||
        url.includes('poederlak') || 
        url.includes('poedercoating') || 
        url.includes('deur') || 
        url.includes('kader') ||
        url.includes('keuken') ||
        url.includes('interieur') ||
        (url.match(/\.(jpg|jpeg|png|webp|gif)$/i) && 
         !url.includes('logo') && 
         !url.includes('icon') &&
         !url.includes('avatar'));
      
      if (isRealisatieImage) {
        imageUrls.add(url);
      }
    }
  });
  
  // Zoek naar background-image URLs in CSS (voor lazy-loaded images)
  const bgImageRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  let match;
  while ((match = bgImageRegex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('/')) {
      url = 'https://kempa.be' + url;
    } else if (!url.startsWith('http')) {
      url = 'https://kempa.be/' + url;
    }
    if (url.match(/\.(jpg|jpeg|png|webp|gif)$/i) && 
        !url.includes('logo') && 
        !url.includes('icon')) {
      imageUrls.add(url);
    }
  }
  
  // Zoek naar JSON data met image URLs (veel sites laden images via JSON)
  const jsonDataRegex = /"image":\s*["']([^"']+)["']/gi;
  while ((match = jsonDataRegex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('/')) {
      url = 'https://kempa.be' + url;
    } else if (!url.startsWith('http')) {
      url = 'https://kempa.be/' + url;
    }
    if (url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      imageUrls.add(url);
    }
  }
  
  // Zoek naar data attributes met image URLs
  const dataImageRegex = /data-image=["']([^"']+)["']/gi;
  while ((match = dataImageRegex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('/')) {
      url = 'https://kempa.be' + url;
    } else if (!url.startsWith('http')) {
      url = 'https://kempa.be/' + url;
    }
    if (url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      imageUrls.add(url);
    }
  }
  
  // Zoek naar images in realisaties sectie specifiek (beter patroon voor gallery images)
  // Zoek naar figure, picture, of div elementen met images binnen realisaties context
  const realisatieSectionRegex = /(?:realisaties?|gallery|portfolio)[\s\S]*?<[^>]+(?:src|data-src|data-lazy-src|data-original)=["']([^"']+)["']/gi;
  while ((match = realisatieSectionRegex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('/')) {
      url = 'https://kempa.be' + url;
    } else if (!url.startsWith('http')) {
      url = 'https://kempa.be/' + url;
    }
    if (url.match(/\.(jpg|jpeg|png|webp|gif)$/i) && 
        !url.includes('logo') && 
        !url.includes('icon')) {
      imageUrls.add(url);
    }
  }
  
  // Zoek naar WordPress/WooCommerce image URLs (wp-content/uploads)
  const wpImageRegex = /(https?:\/\/[^"'\s]+wp-content\/uploads\/[^"'\s]+\.(jpg|jpeg|png|webp|gif))/gi;
  while ((match = wpImageRegex.exec(html)) !== null) {
    let url = match[1];
    if (!url.includes('logo') && !url.includes('icon') && !url.includes('avatar')) {
      imageUrls.add(url);
    }
  }
  
  // Zoek naar alle image URLs die eindigen op -scaled.jpg, -web.jpg, etc. (typisch voor WordPress)
  const scaledImageRegex = /(https?:\/\/[^"'\s]+-[0-9]+x[0-9]+\.(jpg|jpeg|png|webp|gif)|https?:\/\/[^"'\s]+-scaled\.(jpg|jpeg|png|webp|gif)|https?:\/\/[^"'\s]+-web[0-9]*\.(jpg|jpeg|png|webp|gif))/gi;
  while ((match = scaledImageRegex.exec(html)) !== null) {
    let url = match[1];
    if (!url.includes('logo') && !url.includes('icon') && !url.includes('avatar')) {
      imageUrls.add(url);
    }
  }
  
  return Array.from(imageUrls);
}

/**
 * Genereer een veilige bestandsnaam
 */
function sanitizeFilename(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const filename = path.basename(pathname);
  
  // Als er geen extensie is, probeer te detecteren
  if (!filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    // Probeer extensie te vinden in query params of gebruik .jpg als default
    const extMatch = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
    return extMatch ? `image-${Date.now()}.${extMatch[1]}` : `image-${Date.now()}.jpg`;
  }
  
  return filename;
}

/**
 * Main functie
 */
async function main() {
  console.log('📥 Downloading images from Kempa poederlakkerij page...');
  console.log(`🌐 URL: ${KEMPA_URL}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);
  
  try {
    // Haal HTML op
    console.log('📄 Fetching HTML...');
    const html = await fetchHTML(KEMPA_URL);
    console.log('✅ HTML fetched\n');
    
    // Extract image URLs
    console.log('🔍 Extracting image URLs...');
    const imageUrls = extractImageUrls(html);
    console.log(`✅ Found ${imageUrls.length} images\n`);
    
    if (imageUrls.length === 0) {
      console.log('⚠️  No images found. The page might use JavaScript to load images.');
      console.log('💡 Tip: Open the page in a browser and check Network tab for image URLs.');
      return;
    }
    
    // Download elke image
    console.log('⬇️  Downloading images...\n');
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const filename = sanitizeFilename(url);
      const filepath = path.join(OUTPUT_DIR, filename);
      
      try {
        // Skip als bestand al bestaat
        if (fs.existsSync(filepath)) {
          console.log(`⏭️  [${i + 1}/${imageUrls.length}] Skipped (exists): ${filename}`);
          continue;
        }
        
        console.log(`⬇️  [${i + 1}/${imageUrls.length}] Downloading: ${filename}`);
        await downloadFile(url, filepath);
        console.log(`✅ [${i + 1}/${imageUrls.length}] Downloaded: ${filename}`);
        successCount++;
      } catch (error) {
        console.error(`❌ [${i + 1}/${imageUrls.length}] Failed: ${filename} - ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📁 Location: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
