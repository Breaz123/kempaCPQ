/**
 * Configuration Form Component
 * 
 * Modern form for MDF powder coating configuration with animations.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdfConfiguration, CoatingSide, MdfStructure, createMdfConfiguration, validateMdfConfiguration, DimensionSet } from '../../slices/configuration';
import { DrillPosition, createDrillPosition } from '../../slices/configuration/models/DrillPosition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2, Plus } from 'lucide-react';
import { Mdf3DPreview } from './Mdf3DPreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

// Kempa MDF poederlak kleuren (benadering op basis van RGB-waarden)
const BASE_COLORS = [
  { name: 'Platinawit (KP-W980)', value: '#F0EDE8' },
  { name: 'Zuiver wit (KP-9010)', value: '#F1EDE1' },
  { name: 'Zijdegrijs (KP-U750)', value: '#BBB8AE' },
  { name: 'Lichtgrijs (KP-U708)', value: '#D2D2CB' },
  { name: 'Steengrijs (KP-U727)', value: '#9E9286' },
  { name: 'Cascara (S101-06)', value: '#E6E3E0' },
  { name: 'Zandbeige (KP-U156)', value: '#E3DBC9' },
  { name: 'Turtle Grey (S035-22)', value: '#9F9385' },
  { name: 'Zwart (KP-Zwart)', value: '#0E0E10' },
  { name: 'Kasjmier (KP-U702)', value: '#C9C2BA' },
  { name: 'Came (KP-U216)', value: '#F1E9DD' },
  { name: 'Fango (KP-U795)', value: '#776B5E' },
  { name: 'Hemelswit (KP-W930)', value: '#E8EAED' },
  { name: 'Zachtgrijs (KP-916)', value: '#C8C7C3' },
  { name: 'Taupe (KP-171)', value: '#8D8275' },
  { name: 'Alpinewit (KP-W1100)', value: '#E3E2DB' },
  { name: 'Grafietzwart (KP-701)', value: '#302E2D' },
  { name: 'Donkerbruin (KP-764)', value: '#433632' },
  { name: 'Muisgrijs (KP-933)', value: '#7B7871' },
  { name: 'Terra (KP-084)', value: '#B07756' },
  { name: 'Kastanjebruin (KP-8015)', value: '#5F332B' },
  { name: 'Evergreen (KP-691)', value: '#8B9483' },
  { name: 'Misty Blue (KP-U502)', value: '#6C7E80' },
];

// Kempa MDF structuren
const STRUCTURE_OPTIONS: { id: MdfStructure; label: string; description: string }[] = [
  { id: MdfStructure.Line, label: 'Line', description: 'Verticale lijnen voor een strak, ritmisch effect.' },
  { id: MdfStructure.Stone, label: 'Stone', description: 'Licht korrelige structuur met een steenachtige uitstraling.' },
  { id: MdfStructure.Leather, label: 'Leather', description: 'Zachte, lederachtige structuur met subtiele beweging.' },
  { id: MdfStructure.Linen, label: 'Linen', description: 'Fijne linnenstructuur voor een rustige, textiele look.' },
];

export function ConfigurationForm({ onSubmit }: ConfigurationFormProps) {
  // Dikte: vaste waarden volgens Kempa-catalogus (19, 22, 25, 30, 38 mm)
  const AVAILABLE_THICKNESSES = [19, 22, 25, 30, 38] as const;
  type DimensionRow = DimensionSet;

  const createInitialRow = (): DimensionRow => ({
    id: `dim-${Date.now()}`,
    lengthMm: 1000,
    widthMm: 500,
    heightMm: AVAILABLE_THICKNESSES[0],
    quantity: 1,
  });

  const [dimensionRows, setDimensionRows] = useState<DimensionRow[]>([
    createInitialRow(),
  ]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<string>(BASE_COLORS[0].value);
  const [structure, setStructure] = useState<MdfStructure>(MdfStructure.Line);
  const [drillPositions, setDrillPositions] = useState<DrillPosition[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  // State for adding new drill position
  const [newDrillSide, setNewDrillSide] = useState<CoatingSide>(CoatingSide.Front);
  const [newDrillPos1, setNewDrillPos1] = useState<string>('');
  const [newDrillPos2, setNewDrillPos2] = useState<string>('');

  const activeRow: DimensionRow =
    dimensionRows.find((row) => row.id === activeRowId) ??
    dimensionRows[0];

  const updateRow = (id: string, patch: Partial<DimensionRow>) => {
    setDimensionRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const handleAddRow = () => {
    setDimensionRows((rows) => {
      const newRow: DimensionRow = {
        id: `dim-${Date.now()}-${Math.random()}`,
        lengthMm: rows[0]?.lengthMm ?? 1000,
        widthMm: rows[0]?.widthMm ?? 500,
        heightMm: rows[0]?.heightMm ?? AVAILABLE_THICKNESSES[0],
        quantity: 1,
      };
      setActiveRowId(newRow.id);
      return [...rows, newRow];
    });
  };

  const handleRemoveRow = (id: string) => {
    setDimensionRows((rows) => {
      if (rows.length === 1) {
        return rows;
      }
      const filtered = rows.filter((row) => row.id !== id);
      if (!filtered.find((row) => row.id === activeRowId)) {
        setActiveRowId(filtered[0]?.id ?? null);
      }
      return filtered;
    });
  };

  const handleAddDrillPosition = () => {
    const pos1 = parseFloat(newDrillPos1);
    const pos2 = parseFloat(newDrillPos2);
    
    if (isNaN(pos1) || isNaN(pos2) || pos1 < 0 || pos2 < 0) {
      return;
    }
    
    const newDrill = createDrillPosition(
      `drill-${Date.now()}-${Math.random()}`,
      newDrillSide,
      pos1,
      pos2
    );
    
    setDrillPositions([...drillPositions, newDrill]);
    setNewDrillPos1('');
    setNewDrillPos2('');
  };

  const handleRemoveDrillPosition = (id: string) => {
    setDrillPositions(drillPositions.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (dimensionRows.length === 0) {
      setErrors(['Voeg minstens één maatregel toe.']);
      return;
    }
    
    // Powder coating: always coat all sides with the same color
    const allSides = [
      CoatingSide.Top,
      CoatingSide.Bottom,
      CoatingSide.Front,
      CoatingSide.Back,
      CoatingSide.Left,
      CoatingSide.Right,
    ];

    const totalQuantity = dimensionRows.reduce(
      (sum, row) => sum + (row.quantity || 0),
      0
    );

    const primaryRow = activeRow ?? dimensionRows[0];

    const config = createMdfConfiguration(
      `config-${Date.now()}`,
      primaryRow.lengthMm,
      primaryRow.widthMm,
      primaryRow.heightMm,
      totalQuantity || primaryRow.quantity || 1,
      allSides // Always coat all sides
    );

    // Attach selected structure to configuration for pricing/quote context
    (config as MdfConfiguration).structure = structure;

    // Attach all dimension sets so de prijsformule weet dat er
    // meerdere verschillende afmetingen zijn.
    (config as MdfConfiguration).dimensionSets = dimensionRows.map((row) => ({
      id: row.id,
      lengthMm: row.lengthMm,
      widthMm: row.widthMm,
      heightMm: row.heightMm,
      quantity: row.quantity,
    }));
    
    // Add drill positions to config
    if (drillPositions.length > 0) {
      (config as any).drillPositions = drillPositions;
    }

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Afmetingen & aantallen</Label>
            <p className="text-sm text-muted-foreground">
              Voeg hier snel meerdere verschillende formaten toe, bijvoorbeeld
              5× 200×200 mm en 4× 100×200 mm. Klik op een regel om deze in de
              3D preview te bekijken.
            </p>
            <div className="space-y-3">
              {dimensionRows.map((row, index) => {
                const isActive = activeRow.id === row.id;
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded-lg border ${
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white'
                    } cursor-pointer`}
                    onClick={() => setActiveRowId(row.id)}
                  >
                    <div className="space-y-1">
                      <Label htmlFor={`length-${row.id}`} className="text-xs">
                        Lengte (mm)
                      </Label>
                      <Input
                        id={`length-${row.id}`}
                        type="number"
                        value={row.lengthMm}
                        onChange={(e) =>
                          updateRow(row.id, {
                            lengthMm: Number(e.target.value),
                          })
                        }
                        min="1"
                        required
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`width-${row.id}`} className="text-xs">
                        Breedte (mm)
                      </Label>
                      <Input
                        id={`width-${row.id}`}
                        type="number"
                        value={row.widthMm}
                        onChange={(e) =>
                          updateRow(row.id, {
                            widthMm: Number(e.target.value),
                          })
                        }
                        min="1"
                        required
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`height-${row.id}`} className="text-xs">
                        Dikte (mm)
                      </Label>
                      <select
                        id={`height-${row.id}`}
                        value={row.heightMm}
                        onChange={(e) =>
                          updateRow(row.id, {
                            heightMm: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        required
                      >
                        {AVAILABLE_THICKNESSES.map((thickness) => (
                          <option key={thickness} value={thickness}>
                            {thickness} mm
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`quantity-${row.id}`} className="text-xs">
                        Aantal
                      </Label>
                      <Input
                        id={`quantity-${row.id}`}
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(row.id, {
                            quantity: Number(e.target.value),
                          })
                        }
                        min="1"
                        required
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <Button
                        type="button"
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => setActiveRowId(row.id)}
                      >
                        Bekijk
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={dimensionRows.length === 1}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveRow(row.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {index === dimensionRows.length - 1 && (
                      <div className="md:col-span-5 text-xs text-muted-foreground">
                        {dimensionRows.length > 1 && (
                          <span>
                            Totaal aantal stuks:{' '}
                            {dimensionRows.reduce(
                              (sum, r) => sum + (r.quantity || 0),
                              0
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={handleAddRow}
              >
                <Plus className="h-4 w-4 mr-1" />
                Maatregel toevoegen
              </Button>
              <p className="text-xs text-muted-foreground">
                Beschikbare diktes: 19, 22, 25 mm (standaard) en 30, 38 mm
                (+35%).
              </p>
            </div>
          </div>

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

            {/* De enkelvoudige dikte/aantal velden zijn vervangen door de
                tabel hierboven zodat meerdere maten mogelijk zijn. */}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="space-y-3"
          >
            <Label>Coating Kleur</Label>
            <div className="grid grid-cols-4 gap-3">
              {BASE_COLORS.map((color, index) => {
                const isLightColor = color.value === '#F8F9FA' || color.value === '#F1C40F';
                const isSelected = selectedColor === color.value;
                
                return (
                  <motion.button
                    key={color.value}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    onClick={() => setSelectedColor(color.value)}
                    className={`
                      h-12 rounded-lg border-2 transition-all cursor-pointer relative
                      ${isSelected
                        ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105'
                        : isLightColor
                        ? 'border-gray-400 hover:border-primary/50'
                        : 'border-gray-300 hover:border-primary/50'
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {isSelected && (
                      <div className="flex items-center justify-center h-full">
                        <svg
                          className={`w-6 h-6 drop-shadow-lg ${isLightColor ? 'text-gray-800' : 'text-white'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Kies een kleur voor de poederlak coating. De hele plaat wordt gecoat met deze kleur.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Deze kleuren zijn benaderingen op scherm; door het verschil in afwerkingsproduct kan
              tussen poederlak en structuurlak een klein kleur- of glansgraadverschil optreden.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Label>Structuur</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STRUCTURE_OPTIONS.map((option, index) => {
                const isSelected = structure === option.id;

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 + index * 0.05 }}
                    onClick={() => setStructure(option.id)}
                    className={`
                      h-20 rounded-xl border-2 px-3 py-2 text-left flex flex-col justify-between bg-white transition-all cursor-pointer
                      ${isSelected
                        ? 'border-primary ring-2 ring-primary ring-offset-2 shadow-md'
                        : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
                      }
                    `}
                  >
                    <span className="font-medium text-sm text-gray-900">{option.label}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {option.description}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Kies de gewenste oppervlaktestructuur. Alle structuren zijn beschikbaar in dezelfde kleuren.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label>Boorposities</Label>
              {drillPositions.length > 0 && (
                <span className="text-sm font-medium text-primary">
                  {drillPositions.length} {drillPositions.length === 1 ? 'gat' : 'gaten'}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Voeg boorposities toe voor klinken, grijpers of handvaten. Gaten worden getoond als zwarte cirkels in de 3D preview.
            </p>
            
            {/* Add new drill position */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="drillSide" className="text-xs">Kant</Label>
                <select
                  id="drillSide"
                  value={newDrillSide}
                  onChange={(e) => setNewDrillSide(e.target.value as CoatingSide)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {ALL_SIDES.map(side => (
                    <option key={side} value={side}>{SIDE_LABELS[side]}</option>
                  ))}
                </select>
              </div>
            {(() => {
                // Determine which dimensions are short and long for the selected side
                let shortLabel = '';
                let longLabel = '';
                
                switch (newDrillSide) {
                  case CoatingSide.Top:
                  case CoatingSide.Bottom:
                    // Top/Bottom: short side is width, long side is length
                    shortLabel = `Vanaf korte zijkant (${activeRow.widthMm}mm)`;
                    longLabel = `Vanaf lange zijkant (${activeRow.lengthMm}mm)`;
                    break;
                  case CoatingSide.Front:
                  case CoatingSide.Back:
                    // Front/Back: short side is height, long side is length
                    shortLabel = `Vanaf korte zijkant (${activeRow.heightMm}mm)`;
                    longLabel = `Vanaf lange zijkant (${activeRow.lengthMm}mm)`;
                    break;
                  case CoatingSide.Left:
                  case CoatingSide.Right:
                    // Left/Right: short side is height, long side is width
                    shortLabel = `Vanaf korte zijkant (${activeRow.heightMm}mm)`;
                    longLabel = `Vanaf lange zijkant (${activeRow.widthMm}mm)`;
                    break;
                }
                
                return (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="drillPos1" className="text-xs">Positie 1 (cm)</Label>
                      <Input
                        id="drillPos1"
                        type="number"
                        value={newDrillPos1}
                        onChange={(e) => setNewDrillPos1(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">{shortLabel}</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="drillPos2" className="text-xs">Positie 2 (cm)</Label>
                      <Input
                        id="drillPos2"
                        type="number"
                        value={newDrillPos2}
                        onChange={(e) => setNewDrillPos2(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">{longLabel}</p>
                    </div>
                  </>
                );
              })()}
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddDrillPosition}
                  disabled={!newDrillPos1 || !newDrillPos2}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Toevoegen
                </Button>
              </div>
            </div>

            {/* List of drill positions */}
            {drillPositions.length > 0 && (
              <div className="space-y-2">
                {drillPositions.map((drill) => (
                  <div
                    key={drill.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-sm">{SIDE_LABELS[drill.side]}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({drill.position1Cm} cm, {drill.position2Cm} cm)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDrillPosition(drill.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>3D Preview</CardTitle>
              <CardDescription>
                Bekijk uw MDF plaat in 3D met de gekozen instellingen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Mdf3DPreview
                lengthMm={activeRow.lengthMm}
                widthMm={activeRow.widthMm}
                heightMm={activeRow.heightMm}
                coatingSides={[]}
                selectedColor={selectedColor}
                drillPositions={drillPositions}
                structure={structure}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
