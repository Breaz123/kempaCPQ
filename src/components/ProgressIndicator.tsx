/**
 * Progress Indicator Component
 * 
 * Shows user progress through the CPQ flow with visual indicators.
 */

import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  number: number;
  label: string;
  completed: boolean;
  active: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
}

export function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-secondary/30 rounded-lg">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {step.completed ? (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                ) : step.active ? (
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <span className="text-primary font-bold">{step.number}</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted border-2 border-[#D4C4B0] flex items-center justify-center">
                    <Circle className="h-5 w-5 text-[#6B5D4F]" />
                  </div>
                )}
              </motion.div>
            </div>
            <span
              className={`text-xs mt-2 text-center ${
                step.active || step.completed
                  ? 'text-primary font-semibold'
                  : 'text-[#6B5D4F]'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 -mt-6 ${
                step.completed ? 'bg-primary' : 'bg-[#D4C4B0]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
