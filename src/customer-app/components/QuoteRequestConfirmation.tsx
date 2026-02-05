/**
 * Quote Request Confirmation Component
 * 
 * Displays confirmation after submitting a quote request.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Mail, FileText, Clock } from 'lucide-react';

export interface QuoteRequestData {
  id: string;
  requestNumber: string;
  status: string;
  submittedAt: string;
  customerEmail: string;
}

interface QuoteRequestConfirmationProps {
  quoteRequest: QuoteRequestData;
}

export function QuoteRequestConfirmation({ quoteRequest }: QuoteRequestConfirmationProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'In behandeling',
      REVIEWING: 'Wordt beoordeeld',
      APPROVED: 'Goedgekeurd',
      REJECTED: 'Afgewezen',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'APPROVED') return 'default';
    if (status === 'REJECTED') return 'destructive';
    return 'secondary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="space-y-6"
    >
      <Card className="border-2 shadow-xl border-green-500/20 bg-gradient-to-br from-white to-green-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl text-green-700">
                  Offerte Aanvraag Ontvangen
                </CardTitle>
                <CardDescription className="mt-1">
                  Uw aanvraag is succesvol verzonden
                </CardDescription>
              </div>
            </div>
            <Badge variant={getStatusVariant(quoteRequest.status)} className="text-sm">
              {getStatusLabel(quoteRequest.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Aanvraagnummer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-[#5A4A3A] font-mono">
                    {quoteRequest.requestNumber}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#6B5D4F] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Verzonden op
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-[#5A4A3A]">
                    {formatDate(quoteRequest.submittedAt)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-[#5A4A3A]">
                      Bevestiging per e-mail
                    </p>
                    <p className="text-sm text-[#6B5D4F]">
                      U ontvangt een bevestigingsmail op <strong>{quoteRequest.customerEmail}</strong>.
                      Ons sales team neemt binnen 1-2 werkdagen contact met u op.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-secondary to-white border-[#D4C4B0]">
              <CardHeader>
                <CardTitle className="text-lg text-[#5A4A3A]">
                  Volgende stappen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#6B5D4F]">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>U ontvangt een bevestigingsmail met uw aanvraagnummer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>Ons sales team beoordeelt uw aanvraag</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>U ontvangt binnen 1-2 werkdagen een reactie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span>Bij goedkeuring wordt een officiële offerte gegenereerd</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
