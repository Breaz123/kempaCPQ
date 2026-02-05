/**
 * Quote Result Component
 * 
 * Displays the generated quote with modern design and animations.
 */

import { motion } from 'framer-motion';
import { Quote } from '../../slices/quote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, CheckCircle2, Euro } from 'lucide-react';

interface QuoteResultProps {
  quote: Quote;
}

export function QuoteResult({ quote }: QuoteResultProps) {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Offerte ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-[#5A4A3A] font-mono">{quote.id}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="text-sm">
                {quote.status}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Aangemaakt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-[#5A4A3A]">
                {quote.createdAt.toLocaleString('nl-NL')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-[#D4C4B0] bg-white">
          <CardHeader>
            <CardTitle className="text-primary">Regelitems</CardTitle>
          </CardHeader>
          <CardContent>
            {quote.lineItems.length === 0 ? (
              <p className="text-muted-foreground">Geen regelitems</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#D4C4B0]">
                      <th className="text-left py-3 px-4 font-semibold text-[#5A4A3A]">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5A4A3A]">Beschrijving</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#5A4A3A]">Aantal</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#5A4A3A]">Stukprijs</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#5A4A3A]">Regeltotaal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.lineItems.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-[#E8E3DC] hover:bg-secondary/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-[#5A4A3A]">{item.productName}</td>
                        <td className="py-3 px-4 text-sm text-[#6B5D4F]">{item.description}</td>
                        <td className="py-3 px-4 text-right text-[#5A4A3A]">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#5A4A3A]">
                          {formatPrice(item.unitPrice, item.currency)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#5A4A3A]">
                          {formatPrice(item.lineTotal, item.currency)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/10 to-white border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Euro className="h-5 w-5 text-primary" />
              Totaaloverzicht
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B5D4F]">Subtotaal:</span>
              <span className="text-lg font-semibold text-[#5A4A3A]">
                {formatPrice(quote.totals.subtotal, quote.totals.currency)}
              </span>
            </div>
            
            <Separator className="bg-[#D4C4B0]" />
            
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B5D4F]">BTW:</span>
              <span className="text-lg font-semibold text-[#5A4A3A]">
                {formatPrice(quote.totals.tax, quote.totals.currency)}
              </span>
            </div>
            
            <Separator className="bg-[#D4C4B0]" />
            
            <div className="flex justify-between items-center py-3">
              <span className="text-xl font-bold text-[#5A4A3A]">Totaal:</span>
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-3xl font-bold text-primary"
              >
                {formatPrice(quote.totals.total, quote.totals.currency)}
              </motion.span>
            </div>
            
            <div className="pt-2 text-sm text-muted-foreground">
              Valuta: {quote.totals.currency} | Items: {quote.totals.lineItemCount}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
