/**
 * MDF Poederlakken Page
 * 
 * Informatiepagina over MDF poederlakken voor professioneel interieurwerk
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Calendar, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PoederlakGallery } from '../components/PoederlakGallery';
import { MdfKnowledgeSidebar } from '@/components/MdfKnowledgeSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface CatalogItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

// Fallback images als API niet beschikbaar is - gebruik alle beschikbare poederlak realisaties
const fallbackImages = [
  // Model images
  'Model-web_0006_Model-1-1-1.jpg',
  'Model-web_0005_Model-2-1.jpg',
  'Model-web_0004_Model-3-.jpg',
  'Model-web_0003_Model-4-1-2.jpg',
  'Model-web_0002_Model-5-1-2.jpg',
  'Model-web_0001_Model-6-1-2.jpg',
  'Model-web_0000_Model-7-1-2.jpg',
  // Kempa realisaties (high resolution)
  // Nota: Realisaties 8-9, 10-11, 12-13 zijn gecombineerd als slides in de gallery
  // Realisatie 14 is verwijderd
  'Kempa_30052024-120-3-scaled.jpg', // Slide 1 van paar 8-9
  'Kempa_30052024-122-2-scaled.jpg', // Slide 1 van paar 10-11
  'Kempa_30052024-124-3-scaled.jpg', // Slide 1 van paar 12-13
  'Kempa_30052024-150-1-1365x2048.jpg',
  'Kempa_30052024-152-1-1365x2048.jpg',
  // Poederlak images (high resolution)
  'Poederlak-5-1365x2048.jpg',
  'Poederlak-6-1366x2048.jpg',
  'Poederlak--1366x2048.jpg',
  // Note: Realisaties 20-33 zijn verwijderd uit de gallery maar blijven beschikbaar voor gebruik elders op de website
  // (als achtergronden of bij teksten)
  'Achtergrond-Vakmanplatform-kempa.jpg',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function MdfPowderCoatingPage() {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    loadCatalogItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCatalogItems = async () => {
    // Beperk wachttijd voor externe API, zodat de gallery altijd laadt
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Catalog request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setCatalogItems(data.data);
      } else {
        // Fallback naar statische images
        setCatalogItems(fallbackImages.map((img, idx) => ({
          id: `fallback-${idx}`,
          title: `Poederlak realisatie ${idx + 1}`,
          imageUrl: `/images/poederlak/${img}`,
          order: idx,
          isActive: true,
        })));
      }
    } catch (error) {
      // Bij error of timeout: fallback naar statische images
      console.error('Error loading catalog items, using static fallback images:', error);
      setCatalogItems(fallbackImages.map((img, idx) => ({
        id: `fallback-${idx}`,
        title: `Poederlak realisatie ${idx + 1}`,
        imageUrl: `/images/poederlak/${img}`,
        order: idx,
        isActive: true,
      })));
    } finally {
      window.clearTimeout(timeoutId);
      setLoadingCatalog(false);
    }
  };

  const handleRequestSamples = () => {
    window.location.href = 'mailto:order@kempa.be?subject=Stalen aanvragen - MDF Poederlakken';
  };

  const handleScheduleCall = () => {
    window.location.href = 'mailto:info@kempa.be?subject=Gesprek plannen - MDF Poederlakken';
  };

  return (
    <div>
      {/* Hero Section met achtergrond foto */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[90vh] min-h-[500px] max-h-[900px] mb-16 overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="/images/poederlak/hero-poederlakkerij.webp"
            alt="Kempa poederlakkerij"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-8 flex justify-center"
            >
              <img
                src="/images/logos/kempa-logo-groen.svg"
                alt="Kempa Logo"
                className="h-16 md:h-20 lg:h-24 w-auto drop-shadow-lg"
              />
            </motion.div>
            <Badge className="mb-6 bg-white/90 text-primary text-sm px-4 py-1 backdrop-blur-sm">
              MDF Poederlakken
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif leading-tight drop-shadow-lg">
              MDF poederlakken voor professioneel interieurwerk
            </h1>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-12 max-w-7xl bg-white">
        {/* Main Content Grid: 2 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-16"
            >
          {/* Opening - Probleem/Oplossing impliciet */}
          <motion.section variants={itemVariants} className="prose prose-lg max-w-none bg-white py-16">
            {/* Conversion-focused header badge */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Industriële Kwaliteit • Consistente Afwerking</span>
              </div>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-xl leading-relaxed">
                Herken je dit? Een keukenproject loopt uit omdat de lakafwerking niet consistent is. 
                De eerste batch ziet er perfect uit, maar bij de tweede levering valt het verschil meteen op. 
                Je moet uitleggen waarom, terwijl je eigenlijk gewoon wilt leveren wat je belooft.
              </p>
              <p className="text-xl leading-relaxed">
                Bij Kempa poederlakken we MDF-onderdelen industrieel en reproduceerbaar. 
                Elke batch heeft dezelfde kwaliteit, elke kleur komt exact overeen. 
                Geen verrassingen, geen discussies. Gewoon strak werk, elke keer weer.
              </p>
              
              {/* Benefits highlight */}
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/50 rounded-lg border-l-4 border-primary">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-gray-700">100% reproduceerbaar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-gray-700">Industriële kwaliteit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-gray-700">Transparante prijzen</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/" className="flex-1">
                    <Button 
                      size="lg"
                      className="w-full text-lg py-6 rounded-[999px] pointer-events-auto hover:shadow-lg transition-all"
                      style={{
                        backgroundColor: 'hsl(var(--primary))',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#6d3c59';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--primary))';
                      }}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Direct configureren
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleRequestSamples}
                    variant="outline"
                    size="lg"
                    className="flex-1 text-lg py-6 border-2 rounded-[999px] hover:shadow-md transition-all hover:bg-[#6d3c59] hover:border-[#6d3c59] hover:text-white"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Stalen aanvragen
                  </Button>
                  <Button 
                    onClick={handleScheduleCall}
                    variant="outline"
                    size="lg"
                    className="flex-1 text-lg py-6 border-2 rounded-[999px] hover:shadow-md transition-all hover:bg-[#6d3c59] hover:border-[#6d3c59] hover:text-white"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Gesprek plannen
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Voor wie */}
          <motion.section variants={itemVariants} className="space-y-8 bg-white py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-serif mb-6">
              Voor wie dit werkt
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Dit is interessant als je werkt met MDF-maatwerk en kwaliteit belangrijk is. 
                  Denk aan interieurbouwers die keukenfronten of zichtpanelen moeten afwerken, 
                  projectinrichters die herhaalbare afwerkingen nodig hebben, of B2B-spelers die 
                  MDF doorverkopen en een professionele uitstraling willen waarmaken.
                </p>
                <p className="text-lg">
                  Typische situaties zijn keukenfronten en zichtdelen, kasten en wanden, 
                  of projecten waar kleurvastheid over meerdere fases cruciaal is. 
                  Ook bij seriewerk of herhaalopdrachten waar je niet elke keer opnieuw 
                  wilt uitleggen waarom de kleur net iets anders is.
                </p>
                <p className="text-base text-gray-600 italic">
                  Minder relevant als je uitsluitend met massief hout werkt, of als het project 
                  eenmalig is zonder specifieke kwaliteitsvereisten. Ook niet nodig als je zelf 
                  al over een volledig ingerichte lakafdeling beschikt.
                </p>
              </div>
              {/* Illustratieve realisatie-afbeelding (niet in gallery) */}
              <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/images/poederlak/web__0003_schollier-0942412-1152x1536.jpg"
                  alt="Voorbeeldinterieur met Kempa poederlak"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-4 right-4 text-xs md:text-sm text-white/90">
                  Projectvoorbeeld uit de praktijk – maatwerkinterieur afgewerkt met MDF poederlak.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Waarde voor klant */}
          <motion.section variants={itemVariants} className="space-y-8 bg-white py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-serif">
              Wat het je oplevert
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Operationeel</h3>
                <p className="text-gray-700 leading-relaxed">
                  Minder faalkosten en nabewerkingen. Constante kwaliteit over meerdere batches betekent 
                  dat je niet meer hoeft uit te leggen waarom batch twee net iets anders is dan batch één. 
                  Betere planning in productie en plaatsing, omdat je weet wat je krijgt. 
                  En minder afhankelijkheid van interne lakcapaciteit geeft je meer flexibiliteit.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Commercieel</h3>
                <p className="text-gray-700 leading-relaxed">
                  Hogere doorverkoopwaarde richting eindklant, omdat je een consistent product levert. 
                  Minder discussies over afwerking betekent meer tijd voor wat echt belangrijk is. 
                  Een professioneler totaalvoorstel verhoogt het vertrouwen bij architect en bouwheer.
                </p>
              </div>
              <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="text-gray-800 leading-relaxed">
                  <strong className="text-primary">Ondersteuning bij verkoop:</strong> Industriële lakkwaliteit 
                  in plaats van ambachtelijke variatie. Reproduceerbare kleuren en structuren die je 
                  kunt beloven en waarmaken. En een duidelijke prijsopbouw zonder verrassingen achteraf.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Prijs */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                    Transparante Prijsopbouw
                  </Badge>
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-4">€166/m²</div>
                  <p className="text-xl text-gray-700 font-semibold">Catalogusprijs per m²</p>
                  <p className="text-base text-gray-600 mt-2">
                    Op basis van het zichtvlak van de deur, met een minimum van 0,15 m² per onderdeel
                  </p>
                </div>
              
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Inbegrepen</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Professionele poederlakafwerking van MDF, standaard kleurassortiment, 
                    industriële procescontrole en consistente afwerking per batch.
                  </p>
                </div>
                
                <div className="pt-6 border-t border-primary/20">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Buiten scope</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Speciale kleuren of structuren, extra voorbehandeling bij complexe vormen, 
                    spoedopdrachten of projectvereisten buiten het standaardproces. 
                    Dit kan tegen meerprijs, maar we bespreken het vooraf.
                  </p>
                </div>

                <div className="pt-6 border-t border-primary/20">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Dit is geen discountstrategie. De prijs hangt samen met procesbeheersing, 
                    niet met korting. Geen prijsschommelingen per project, transparant en schaalbaar. 
                    Gericht op langdurige samenwerking, niet op eenmalige deals.
                  </p>
                </div>
              </div>
              </div>
            </div>
          </motion.section>

          {/* Catalogus / Portfolio */}
          <motion.section variants={itemVariants} className="space-y-8 bg-white py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary font-serif mb-4">
                Onze poederlak realisaties
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Een overzicht van onze poederlak realisaties. Van keukenfronten tot maatwerkinterieur.
                Klik op een afbeelding om te vergroten.
              </p>
            </div>
            {loadingCatalog ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : catalogItems.length > 0 ? (
              <PoederlakGallery
                images={catalogItems.map(item => ({
                  id: item.id,
                  src: item.imageUrl.startsWith('http') ? item.imageUrl : item.imageUrl,
                  alt: item.title,
                  title: item.title,
                }))}
              />
            ) : (
              // Gebruik alle beschikbare foto's uit de PoederlakGallery component als fallback
              <PoederlakGallery />
            )}
          </motion.section>

          {/* Toepassingen */}
          <motion.section variants={itemVariants} className="space-y-8 bg-white py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-serif">
              Waar het wordt toegepast
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-gray-200 shadow-md hover:shadow-xl transition-all hover:border-primary/30 bg-white">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-200">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Keukens
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    Fronten en zichtdelen met strakke afwerking en hoge slijtvastheid. 
                    Het belangrijkste: een consistent lakbeeld over de volledige keuken, 
                    ook als de levering in fases gebeurt.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200 shadow-md hover:shadow-xl transition-all hover:border-primary/30 bg-white">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-200">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Interieur & maatwerk
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    Kasten, wanden en meubels waar reproduceerbare afwerking belangrijk is voor vervolgopdrachten. 
                    Een professionele uitstraling die je kunt waarmaken richting eindklant.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200 shadow-md hover:shadow-xl transition-all hover:border-primary/30 bg-white">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-200">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Project- en seriewerk
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    Herhaalbare volumes waar kleurvastheid over meerdere fases cruciaal is. 
                    Betrouwbare leverplanning omdat je weet wat je krijgt, wanneer je het nodig hebt.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Kwaliteit & Betrouwbaarheid */}
          <motion.section variants={itemVariants} className="space-y-8 bg-white py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-serif mb-6">
              Kwaliteit en betrouwbaarheid
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Industriële lakprocessen met controle op hechting en afwerking. 
                  Geschikt voor professioneel interieurgebruik, niet voor hobbyprojecten.
                </p>
                <p className="text-lg">
                  Gestandaardiseerde workflow betekent duidelijke afspraken vooraf en voorspelbare output. 
                  Geen verrassingen, geen excuses. Gewoon strak werk, elke keer.
                </p>
                <p className="text-base text-gray-600">
                  We zetten dit in bij professionele interieurbouwers, in B2B- en projectcontext. 
                  Gericht op continuïteit, niet op eenmalige cases. Als je op zoek bent naar 
                  een partner voor de lange termijn, dan zijn we er.
                </p>
              </div>
              {/* Achtergrondbeeld uit de poederlakkerij (niet in gallery) */}
              <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/images/poederlak/kempa-poederlakkerij-web-alg.jpg"
                  alt="Kempa poederlakkerij in bedrijf"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-4 right-4 text-xs md:text-sm text-white/90">
                  Een blik in de Kempa poederlakkerij – industriële processen voor constante kwaliteit.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Sales Enablement */}
          <motion.section variants={itemVariants} className="space-y-8 bg-white py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-serif mb-6">
              Ondersteuning bij doorverkoop
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Fysieke stalen voor je toonzaal en klantgesprekken. Technische uitleg die je helpt 
                  om het product correct te positioneren. En een consistente kwaliteitsboodschap die 
                  je kunt gebruiken in je verkoopgesprekken.
                </p>
                <p className="text-lg">
                  Stalen en documentatie helpen eindklanten visueel beslissen, verminderen keuzestress 
                  en verhogen je conversiekans. Omdat ze zien wat ze krijgen, niet alleen horen wat je belooft.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
                  <p className="text-gray-800 leading-relaxed">
                    <strong className="text-gray-900">Verkoop onder je eigen naam.</strong> Kempa ondersteunt 
                    discreet op de achtergrond. Je krijgt technische zekerheid zonder merkverwarring. 
                    Jouw naam, onze kwaliteit.
                  </p>
                </div>
              </div>
              {/* Foto bij verkoopondersteuning (niet in gallery) */}
              <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/images/poederlak/Q5A3814-web3-1024x683.jpg"
                  alt="Poederlak realisatie in showroom"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-4 right-4 text-xs md:text-sm text-white/90">
                  Beeldmateriaal dat je kunt inzetten in je eigen communicatie richting eindklanten.
                </p>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
                Klaar om te beginnen?
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
                Configureer direct je MDF poederlak project, vraag stalen aan, of plan een gesprek. 
                We helpen je graag verder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto flex-wrap">
                <Link to="/" className="flex-1 min-w-0">
                  <Button 
                    size="lg"
                    variant="secondary"
                    className="w-full text-lg py-6 rounded-[999px] hover:bg-[#6d3c59] hover:text-white transition-all"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Direct configureren
                  </Button>
                </Link>
                <Button 
                  onClick={handleRequestSamples}
                  variant="outline"
                  size="lg"
                  className="flex-1 min-w-0 text-lg py-6 bg-white/10 border-white/30 text-white hover:bg-[#6d3c59] hover:border-[#6d3c59] rounded-[999px] transition-all"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Stalen aanvragen
                </Button>
                <Button 
                  onClick={handleScheduleCall}
                  variant="outline"
                  size="lg"
                  className="flex-1 min-w-0 text-lg py-6 bg-white/10 border-white/30 text-white hover:bg-[#6d3c59] hover:border-[#6d3c59] rounded-[999px] transition-all"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Gesprek plannen
                </Button>
              </div>
            </div>
          </motion.section>
            </motion.div>
          </div>

          {/* Knowledge Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <MdfKnowledgeSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
