/**
 * Customer CPQ Application - Main Component
 * 
 * Customer-facing CPQ UI for quote requests.
 * Flow: Customer Info → Configuration → Price → Submit Request
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigurationForm } from '../app/components/ConfigurationForm';
import { PriceBreakdown } from '../app/components/PriceBreakdown';
import { CustomerInfoForm, CustomerInfo } from './components/CustomerInfoForm';
import { QuoteRequestConfirmation, QuoteRequestData } from './components/QuoteRequestConfirmation';
import { BlurredPricePreview } from './components/BlurredPricePreview';
import { useCustomerCpqApi } from './hooks/useCustomerCpqApi';
import { MdfConfiguration } from '../slices/configuration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

type Step = 'configuration' | 'price-blurred' | 'customer-info' | 'price-visible' | 'confirmation';

export function CustomerApp() {
  const [step, setStep] = useState<Step>('configuration');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [configuration, setConfiguration] = useState<MdfConfiguration | null>(null);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequestData | null>(null);
  
  const {
    products,
    priceResponse,
    loading,
    error,
    calculatePrice,
    submitQuoteRequest,
    loadProducts,
  } = useCustomerCpqApi();

  useEffect(() => {
    loadProducts().catch((err) => {
      console.error('Failed to load products on mount:', err);
    });
  }, [loadProducts]);

  const handleConfigurationSubmit = async (config: MdfConfiguration) => {
    setConfiguration(config);
    
    const product = products.length > 0 ? products[0] : null;
    if (product) {
      await calculatePrice(product.number, config);
      // Toon geblurde prijs preview
      setStep('price-blurred');
    }
  };

  const handleUnlockPrice = () => {
    // Ga naar klantgegevens formulier
    setStep('customer-info');
  };

  const handleCustomerInfoSubmit = (info: CustomerInfo) => {
    setCustomerInfo(info);
    // Nu is prijs zichtbaar
    setStep('price-visible');
  };

  const handleSubmitQuoteRequest = async () => {
    if (!customerInfo || !configuration || !priceResponse) {
      return;
    }

    const product = products.length > 0 ? products[0] : null;
    if (!product) {
      return;
    }

    try {
      const response = await submitQuoteRequest(
        customerInfo,
        product,
        configuration,
        priceResponse
      );
      
      if (response.success && response.data) {
        setQuoteRequest(response.data);
        setStep('confirmation');
      }
    } catch (err) {
      console.error('Failed to submit quote request:', err);
    }
  };

  const handleBack = () => {
    if (step === 'price-blurred') {
      setStep('configuration');
    } else if (step === 'customer-info') {
      setStep('price-blurred');
    } else if (step === 'price-visible') {
      setStep('customer-info');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Offerte Aanvragen
          </h1>
          <p className="text-lg text-gray-600">
            Configureer uw product en ontvang direct een prijsopgave
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <AnimatePresence>
            {error && (
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

          {/* Step 1: Configuration */}
          <AnimatePresence mode="wait">
            {step === 'configuration' && (
              <motion.div
                key="configuration"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span className="text-primary">1.</span> Configuratie
                    </CardTitle>
                    <CardDescription>
                      Configureer uw MDF poedercoating product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConfigurationForm onSubmit={handleConfigurationSubmit} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Blurred Price Preview */}
          <AnimatePresence mode="wait">
            {step === 'price-blurred' && configuration && priceResponse && (
              <motion.div
                key="price-blurred"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <Card className="border-2 shadow-lg border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <span className="text-primary">2.</span> Prijsopgave
                        </CardTitle>
                        <CardDescription>
                          Uw prijs is berekend! Vul uw gegevens in om de details te bekijken
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Terug
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BlurredPricePreview 
                      configuration={configuration}
                      priceResponse={priceResponse}
                      productName={products.length > 0 ? products[0].description : 'Product'}
                      onUnlock={handleUnlockPrice}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Customer Info */}
          <AnimatePresence mode="wait">
            {step === 'customer-info' && (
              <motion.div
                key="customer-info"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <span className="text-primary">3.</span> Uw Gegevens
                        </CardTitle>
                        <CardDescription>
                          Vul uw contactgegevens in om de prijsopgave te bekijken
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Terug
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CustomerInfoForm onSubmit={handleCustomerInfoSubmit} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 4: Visible Price Review */}
          <AnimatePresence mode="wait">
            {step === 'price-visible' && configuration && priceResponse && (
              <motion.div
                key="price"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <Card className="border-2 shadow-lg border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <span className="text-primary">4.</span> Prijsopgave
                        </CardTitle>
                        <CardDescription>
                          Bekijk de gedetailleerde prijsopgave voor uw configuratie
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Terug
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PriceBreakdown
                      configuration={configuration}
                      priceResponse={priceResponse}
                      productName={products.length > 0 ? products[0].description : 'Product'}
                    />
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span className="text-primary">5.</span> Offerte Aanvraag Verzenden
                    </CardTitle>
                    <CardDescription>
                      Controleer uw gegevens en verzend de aanvraag
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customerInfo && (
                      <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                        <p className="font-semibold text-[#5A4A3A]">Contactgegevens:</p>
                        <p className="text-sm text-[#6B5D4F]">
                          {customerInfo.name} {customerInfo.companyName && `- ${customerInfo.companyName}`}
                        </p>
                        <p className="text-sm text-[#6B5D4F]">{customerInfo.email}</p>
                        {customerInfo.phone && (
                          <p className="text-sm text-[#6B5D4F]">{customerInfo.phone}</p>
                        )}
                      </div>
                    )}
                    <Button
                      onClick={handleSubmitQuoteRequest}
                      disabled={loading}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Aanvraag verzenden...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Offerte Aanvraag Verzenden
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 4: Confirmation */}
          <AnimatePresence mode="wait">
            {step === 'confirmation' && quoteRequest && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <QuoteRequestConfirmation quoteRequest={quoteRequest} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
