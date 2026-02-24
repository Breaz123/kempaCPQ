/**
 * Price Breakdown Component
 * 
 * Displays price breakdown with modern design and animations.
 */

import { motion } from 'framer-motion';
import { MdfConfiguration } from '../../slices/configuration';
import { BusinessCentralPriceResponse } from '../../slices/business-central';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Ruler, Hash, Layers, Euro } from 'lucide-react';

interface PriceBreakdownProps {
  configuration: MdfConfiguration;
  priceResponse: BusinessCentralPriceResponse;
  productName: string;
}

export function PriceBreakdown({
  configuration,
  priceResponse,
  productName,
}: PriceBreakdownProps) {
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
              {configuration.dimensionSets && configuration.dimensionSets.length > 0 ? (
                <div className="space-y-1 text-sm">
                  {configuration.dimensionSets.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium text-[#5A4A3A]">
                        {set.lengthMm} × {set.widthMm} × {set.heightMm} mm
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Aantal: {set.quantity}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-1">
                    Totaal aantal stuks: {configuration.quantity}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-semibold text-[#5A4A3A]">
                  {configuration.lengthMm} × {configuration.widthMm} × {configuration.heightMm} mm
                </p>
              )}
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

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/10 to-white border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Euro className="h-5 w-5 text-primary" />
              Prijsopgave
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
