/**
 * Configuration Form Component
 * 
 * Modern form for MDF powder coating configuration with animations.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdfConfiguration, CoatingSide, createMdfConfiguration, validateMdfConfiguration } from '../../slices/configuration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ConfigurationFormProps {
  onSubmit: (config: MdfConfiguration) => void;
}

const ALL_SIDES: CoatingSide[] = [
  CoatingSide.Top,
  CoatingSide.Bottom,
  CoatingSide.Front,
  CoatingSide.Back,
  CoatingSide.Left,
  CoatingSide.Right,
];

const SIDE_LABELS: Record<CoatingSide, string> = {
  [CoatingSide.Top]: 'Bovenkant',
  [CoatingSide.Bottom]: 'Onderkant',
  [CoatingSide.Front]: 'Voorkant',
  [CoatingSide.Back]: 'Achterkant',
  [CoatingSide.Left]: 'Linkerkant',
  [CoatingSide.Right]: 'Rechterkant',
};

export function ConfigurationForm({ onSubmit }: ConfigurationFormProps) {
  const [lengthMm, setLengthMm] = useState<number>(1000);
  const [widthMm, setWidthMm] = useState<number>(500);
  const [heightMm, setHeightMm] = useState<number>(18);
  const [quantity, setQuantity] = useState<number>(1);
  const [coatingSides, setCoatingSides] = useState<CoatingSide[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSideToggle = (side: CoatingSide) => {
    setCoatingSides((prev) =>
      prev.includes(side)
        ? prev.filter((s) => s !== side)
        : [...prev, side]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config = createMdfConfiguration(
      `config-${Date.now()}`,
      lengthMm,
      widthMm,
      heightMm,
      quantity,
      coatingSides
    );

    const validation = validateMdfConfiguration(config);
    
    if (!validation.isValid) {
      setErrors(validation.errors.map((e) => e.message));
      return;
    }

    setErrors([]);
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="length">Lengte (mm)</Label>
          <Input
            id="length"
            type="number"
            value={lengthMm}
            onChange={(e) => setLengthMm(Number(e.target.value))}
            min="1"
            required
            className="w-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="width">Breedte (mm)</Label>
          <Input
            id="width"
            type="number"
            value={widthMm}
            onChange={(e) => setWidthMm(Number(e.target.value))}
            min="1"
            required
            className="w-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="height">Hoogte/Dikte (mm)</Label>
          <Input
            id="height"
            type="number"
            value={heightMm}
            onChange={(e) => setHeightMm(Number(e.target.value))}
            min="1"
            required
            className="w-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="quantity">Aantal</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            required
            className="w-full"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <Label>Coating Zijden</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_SIDES.map((side, index) => {
            const isSelected = coatingSides.includes(side);
            return (
              <motion.label
                key={side}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className={`
                  flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-[#D4C4B0] hover:border-primary/50 bg-white'
                  }
                `}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleSideToggle(side)}
                />
                <span className="text-sm font-medium">{SIDE_LABELS[side]}</span>
              </motion.label>
            );
          })}
        </div>
        {coatingSides.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Selecteer ten minste één zijde voor coating
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto"
        >
          Configureer & Bereken Prijs
        </Button>
      </motion.div>
    </form>
  );
}
