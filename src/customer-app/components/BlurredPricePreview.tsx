/**
 * Blurred Price Preview Component
 * 
 * Toont de volledige prijsopgave, maar alleen het prijsgedeelte is geblurred.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MdfConfiguration } from '../../slices/configuration';
import { BusinessCentralPriceResponse } from '../../slices/business-central';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Ruler, Hash, Layers, Euro, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlurredPricePreviewProps {
  configuration: MdfConfiguration;
  priceResponse: BusinessCentralPriceResponse;
  productName: string;
  onUnlock: () => void;
}

export function BlurredPricePreview({ 
  configuration, 
  priceResponse, 
  productName,
  onUnlock 
}: BlurredPricePreviewProps) {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Product details - NIET geblurred */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-[#5A4A3A]">{productName}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                Afmetingen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-[#5A4A3A]">
                {configuration.lengthMm} × {configuration.widthMm} × {configuration.heightMm} mm
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                Aantal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-[#5A4A3A]">{configuration.quantity}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Coating Zijden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {configuration.coatingSides.length > 0 ? (
                  configuration.coatingSides.map((side) => (
                    <Badge key={side} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {side.charAt(0).toUpperCase() + side.slice(1)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Geen</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Prijsopgave - ALLEEN DIT DEEL geblurred */}
      <motion.div variants={itemVariants} className="relative">
        <Card className="bg-gradient-to-br from-primary/10 to-white border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-[#5A4A3A]">
              <Euro className="h-5 w-5 text-primary" />
              Prijsopgave
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Blur overlay alleen over de prijs content */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/85 to-white/75 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3 p-6 bg-white/95 rounded-lg shadow-lg border-2 border-primary/20">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                </motion.div>
                <h3 className="text-base font-bold text-[#5A4A3A]">
                  Prijs Beschikbaar
                </h3>
                <p className="text-xs text-[#6B5D4F] max-w-xs">
                  Vul uw contactgegevens in om de prijs te bekijken
                </p>
                <Button
                  onClick={onUnlock}
                  size="sm"
                  className="mt-2"
                >
                  Contactgegevens Invullen
                </Button>
              </div>
            </div>

            {/* Prijs content - geblurred */}
            <div className="blur-[3px] pointer-events-none select-none space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-[#6B5D4F]">Stukprijs:</span>
                <span className="text-lg font-semibold text-[#5A4A3A]">
                  {formatPrice(priceResponse.unitPrice, priceResponse.currencyCode)}
                </span>
              </div>
              
              <Separator className="bg-[#D4C4B0]" />
              
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-semibold text-[#5A4A3A]">Totaalprijs:</span>
                <motion.span
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-2xl font-bold text-primary"
                >
                  {formatPrice(priceResponse.totalPrice, priceResponse.currencyCode)}
                </motion.span>
              </div>
              
              <div className="pt-2 text-sm text-muted-foreground">
                Valuta: {priceResponse.currencyCode}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
