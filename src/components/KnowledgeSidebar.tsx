/**
 * Knowledge Sidebar Component
 * 
 * Provides helpful information, tips, and FAQ to guide users through the CPQ process.
 * Conversion-focused with trust indicators and benefits.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Lightbulb, 
  Shield, 
  Clock, 
  CheckCircle2, 
  Info,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

interface KnowledgeSidebarProps {
  variant?: 'default' | 'customer';
}

export function KnowledgeSidebar({ variant = 'default' }: KnowledgeSidebarProps) {
  const tips = [
    {
      icon: Lightbulb,
      title: 'Snelle Configuratie',
      description: 'Ons systeem berekent automatisch de beste prijs op basis van uw specificaties.',
    },
    {
      icon: Clock,
      title: 'Directe Prijsopgave',
      description: 'Ontvang binnen enkele seconden een gedetailleerde prijsopgave.',
    },
    {
      icon: Shield,
      title: 'Betrouwbare Kwaliteit',
      description: 'Alleen de beste MDF poedercoating materialen en afwerkingen.',
    },
  ];

  const faqItems = [
    {
      question: 'Hoe werkt de prijsberekening?',
      answer: 'De prijs wordt automatisch berekend op basis van afmetingen, materiaal, kleur en afwerking. Alle kosten zijn transparant weergegeven.',
    },
    {
      question: 'Kan ik de offerte aanpassen?',
      answer: 'Ja, u kunt altijd teruggaan en de configuratie aanpassen. De prijs wordt automatisch bijgewerkt.',
    },
    {
      question: 'Wat zijn de levertijden?',
      answer: 'Levertijden variëren tussen 2-4 weken, afhankelijk van de complexiteit van uw bestelling.',
    },
  ];

  const benefits = [
    { icon: TrendingUp, text: 'Transparante prijzen' },
    { icon: Users, text: 'Persoonlijk advies' },
    { icon: Award, text: 'Kwaliteitsgarantie' },
  ];

  return (
    <div className="space-y-6">
      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-secondary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              Waarom Kempa?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <benefit.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-[#6B5D4F]">{benefit.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Helpful Tips */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2 border-[#D4C4B0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              Handige Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tips.map((tip, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-start gap-2">
                  <tip.icon className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-[#5A4A3A]">{tip.title}</p>
                    <p className="text-xs text-[#6B5D4F]">{tip.description}</p>
                  </div>
                </div>
                {index < tips.length - 1 && (
                  <div className="h-px bg-[#D4C4B0] my-2 ml-6" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-2 border-[#D4C4B0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <HelpCircle className="h-5 w-5" />
              Veelgestelde Vragen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#5A4A3A] mb-1">
                      {faq.question}
                    </p>
                    <p className="text-xs text-[#6B5D4F] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
                {index < faqItems.length - 1 && (
                  <div className="h-px bg-[#D4C4B0] my-2 ml-6" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Conversion CTA */}
      {variant === 'customer' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
                <div>
                  <p className="font-semibold text-sm text-primary mb-1">
                    Directe Prijsopgave
                  </p>
                  <p className="text-xs text-[#6B5D4F]">
                    Vul uw gegevens in om direct de volledige prijsopgave te zien
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
