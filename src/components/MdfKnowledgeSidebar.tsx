/**
 * MDF Poederlakken Knowledge Sidebar Component
 * 
 * Provides helpful information, tips, and FAQ specific to MDF poederlakken.
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
  Award,
  Package,
  Palette,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export function MdfKnowledgeSidebar() {
  const tips = [
    {
      icon: Package,
      title: 'Maatwerk mogelijk',
      description: 'Van kleine series tot grote projecten - we werken met elke hoeveelheid.',
    },
    {
      icon: Palette,
      title: 'Uitgebreid kleurenpalet',
      description: 'Kies uit ons standaard assortiment of vraag een speciale kleur aan.',
    },
    {
      icon: Zap,
      title: 'Snelle doorlooptijd',
      description: 'Gemiddeld 2-4 weken levertijd, afhankelijk van de complexiteit.',
    },
  ];

  const faqItems = [
    {
      question: 'Wat is het verschil tussen poederlak en traditionele lak?',
      answer: 'Poederlak is een industriële afwerking die consistenter en duurzamer is dan traditionele lak. Het wordt elektrostatisch aangebracht en gebakken, wat zorgt voor een uniforme laag zonder druppels of oneffenheden.',
    },
    {
      question: 'Welke kleuren zijn beschikbaar?',
      answer: 'We hebben een uitgebreid standaard kleurenpalet. Voor speciale kleuren kunnen we RAL-kleuren matchen of een custom kleur ontwikkelen tegen meerprijs.',
    },
    {
      question: 'Wat zijn de minimale afmetingen?',
      answer: 'We werken met verschillende formaten. Neem contact op voor specifieke afmetingen en mogelijkheden voor uw project.',
    },
    {
      question: 'Hoe lang duurt een project?',
      answer: 'Gemiddeld 2-4 weken vanaf goedkeuring van de configuratie. Spoedopdrachten zijn mogelijk tegen meerprijs.',
    },
  ];

  const benefits = [
    { icon: Shield, text: 'Industriële kwaliteit' },
    { icon: TrendingUp, text: 'Consistente afwerking' },
    { icon: Award, text: 'Kleurvastheid gegarandeerd' },
  ];

  const trustIndicators = [
    { label: 'Professionele afwerking', value: '100%' },
    { label: 'Tevreden klanten', value: '500+' },
    { label: 'Jaar ervaring', value: '15+' },
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
          <CardContent className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <benefit.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-[#6B5D4F]">{benefit.text}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-[#D4C4B0] grid grid-cols-3 gap-4">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl font-bold text-primary">{indicator.value}</div>
                  <div className="text-xs text-[#6B5D4F] mt-1">{indicator.label}</div>
                </div>
              ))}
            </div>
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

      {/* Quick CTA */}
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
                  Direct Prijsopgave
                </p>
                <p className="text-xs text-[#6B5D4F]">
                  Configureer uw project en ontvang direct een transparante prijsopgave
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
