/**
 * CPQ Application - Main Component
 * 
 * Modern, conversion-focused CPQ UI with animations and polished design.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigurationForm } from './components/ConfigurationForm';
import { PriceBreakdown } from './components/PriceBreakdown';
import { QuoteResult } from './components/QuoteResult';
import { ArdisXmlExport } from './components/ArdisXmlExport';
import { useCpqApi } from './hooks/useCpqApi';
import { MdfConfiguration } from '../slices/configuration';
import { Quote } from '../slices/quote';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [configuration, setConfiguration] = useState<MdfConfiguration | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [customerNumber, setCustomerNumber] = useState<string>('');
  const [showQuote, setShowQuote] = useState(false);
  
  const {
    products,
    priceResponse,
    loading,
    error,
    calculatePrice,
    submitQuote,
    loadProducts,
  } = useCpqApi();

  useEffect(() => {
    loadProducts().catch((err) => {
      console.error('Failed to load products on mount:', err);
    });
  }, [loadProducts]);

  const handleConfigurationSubmit = async (config: MdfConfiguration) => {
    setConfiguration(config);
    setShowQuote(false);
    
    const product = products.length > 0 ? products[0] : null;
    if (product) {
      await calculatePrice(product.number, config);
    }
  };

  const handleGenerateQuote = async () => {
    if (!configuration || !priceResponse || !customerNumber.trim()) {
      return;
    }

    const product = products.length > 0 ? products[0] : null;
    if (!product) {
      return;
    }

    try {
      const newQuote = await submitQuote(
        product,
        configuration,
        priceResponse,
        customerNumber
      );
      setQuote(newQuote);
      setShowQuote(true);
    } catch (err) {
      console.error('Failed to generate quote:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50/50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D5A4A] mb-2 font-serif">
            Configure, Price & Quote
          </h1>
          <p className="text-lg text-[#6B5D4F]">
            Maak snel en eenvoudig een offerte op maat
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <AnimatePresence>
            {error && !error.includes('Mock mode') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fout</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>Bezig met laden...</AlertTitle>
                  <AlertDescription>Even geduld alstublieft</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants}>
            <Card className="border-2 shadow-lg border-[#D4C4B0] bg-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                  <span className="text-primary">1.</span> Configuratie
                </CardTitle>
                <CardDescription className="text-[#6B5D4F]">
                  Configureer uw MDF poedercoating product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfigurationForm onSubmit={handleConfigurationSubmit} />
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {configuration && priceResponse && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-2 shadow-lg border-primary/30 bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                      <span className="text-primary">2.</span> Prijsopgave
                    </CardTitle>
                    <CardDescription className="text-[#6B5D4F]">
                      Bekijk de gedetailleerde prijsopgave voor uw configuratie
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PriceBreakdown
                      configuration={configuration}
                      priceResponse={priceResponse}
                      productName={products.length > 0 ? products[0].description : 'Product'}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {configuration && priceResponse && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-2 shadow-lg border-[#D4C4B0] bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                      <span className="text-primary">3.</span> Offerte Genereren
                    </CardTitle>
                    <CardDescription className="text-[#6B5D4F]">
                      Voer klantnummer in om de offerte te genereren
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-number">Klantnummer</Label>
                      <Input
                        id="customer-number"
                        type="text"
                        value={customerNumber}
                        onChange={(e) => setCustomerNumber(e.target.value)}
                        placeholder="Voer klantnummer in"
                        className="max-w-md"
                      />
                    </div>
                    <Button
                      onClick={handleGenerateQuote}
                      disabled={loading || !customerNumber.trim()}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Offerte genereren...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Offerte Genereren
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showQuote && quote && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <Card className="border-2 shadow-xl border-accent/30 bg-gradient-to-br from-white to-[#F5F1EB]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                          Offerte Succesvol
                        </CardTitle>
                        <CardDescription className="mt-2 text-[#6B5D4F]">
                          Uw offerte is gegenereerd en klaar voor export
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="text-sm">
                        {quote.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <QuoteResult quote={quote} />
                    <ArdisXmlExport 
                      quote={quote} 
                      customerNumber={customerNumber}
                      customerName=""
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
