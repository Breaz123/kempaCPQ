/**
 * Ardis XML Export Component
 * 
 * Provides functionality to export quote to Ardis XML format with modern UI.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from '../../slices/quote';
import { exportQuoteToArdisXml, ArdisHeaderInfo, CustomerInfo } from '../../slices/quote';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, FileCode, CheckCircle2 } from 'lucide-react';

interface ArdisXmlExportProps {
  quote: Quote;
  customerNumber: string;
  customerName?: string;
}

export function ArdisXmlExport({ quote, customerNumber, customerName }: ArdisXmlExportProps) {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const currentUser = 'avreys';
    
    const now = new Date();
    const datum = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    
    const filenaam = quote.id.replace('quote-', 'O');
    
    const firstItem = quote.lineItems[0];
    const hoofdModel = extractModelFromProductId(firstItem.productId);
    
    const headerInfo: ArdisHeaderInfo = {
      filenaam,
      user: currentUser,
      datum,
      klantNaam: customerName || '',
      klantNummer: customerNumber,
      klantReferentie: '',
      hoofdModel,
      hoofdGrondstof: 'MDF PL',
      hoofdAfwerking: '50 : Poederlak  -  Poederlak',
      hoofdKleur: ' ONBEKEND',
      hoofdOpm: '',
      toeslag: 0,
      toeslag2: 0,
    };
    
    const customerInfo: CustomerInfo = {
      naam: customerName || '',
      nummer: customerNumber,
      referentie: '',
    };
    
    const xml = exportQuoteToArdisXml(quote, headerInfo, customerInfo);
    setXmlContent(xml);
    setShowExport(true);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=Windows-1252' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quote.id.replace('quote-', 'O')}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleExport}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
      >
        <FileCode className="mr-2 h-4 w-4" />
        Exporteer naar Ardis XML
      </Button>

      <AnimatePresence>
        {showExport && xmlContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-[#D4C4B0] bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FileCode className="h-5 w-5 text-primary" />
                  Ardis XML Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleDownload}
                    variant="default"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download XML
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Gekopieerd!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Kopieer naar Klembord
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono border">
                    {xmlContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function extractModelFromProductId(productId: string): string {
  if (productId.includes('(')) {
    return productId;
  }
  return `${productId}(07)`;
}
