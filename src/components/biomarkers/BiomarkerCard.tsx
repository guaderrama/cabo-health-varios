import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

interface BiomarkerClassification {
  biomarker: string;
  value: number;
  units: string;
  classification: 'OPTIMO' | 'ACEPTABLE' | 'SUBOPTIMO' | 'ANOMALO';
  riskLevel: 'low' | 'medium' | 'high';
  position: 'normal' | 'below_optimal' | 'above_optimal';
  message: string;
  ranges: {
    optimal: { min: number; max: number };
    acceptable: { min: number; max: number };
    conventional: { min: number; max: number };
  };
  interpretation?: string;
  description?: string;
}

interface BiomarkerCardProps {
  data: BiomarkerClassification;
}

export default function BiomarkerCard({ data }: BiomarkerCardProps) {
  const getClassificationColor = () => {
    switch (data.classification) {
      case 'OPTIMO':
        return 'bg-success-light border-success text-success-dark';
      case 'ACEPTABLE':
        return 'bg-warning-light border-warning text-warning-dark';
      case 'SUBOPTIMO':
        return 'bg-orange-100 border-orange-400 text-orange-800';
      case 'ANOMALO':
        return 'bg-danger-light border-danger text-danger-dark';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getClassificationIcon = () => {
    switch (data.classification) {
      case 'OPTIMO':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'ACEPTABLE':
        return <AlertTriangle className="w-6 h-6" />;
      case 'SUBOPTIMO':
        return <AlertCircle className="w-6 h-6" />;
      case 'ANOMALO':
        return <XCircle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getClassificationLabel = () => {
    switch (data.classification) {
      case 'OPTIMO':
        return 'Óptimo';
      case 'ACEPTABLE':
        return 'Aceptable';
      case 'SUBOPTIMO':
        return 'Subóptimo';
      case 'ANOMALO':
        return 'Anómalo';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getClassificationColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{data.biomarker}</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {data.value} <span className="text-base font-normal">{data.units}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getClassificationIcon()}
          <span className="text-sm font-bold uppercase">{getClassificationLabel()}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="font-medium">{data.message}</p>

        {data.description && (
          <p className="text-sm opacity-90">{data.description}</p>
        )}

        <div className="mt-3 pt-3 border-t border-current opacity-75">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="font-medium mb-1">Rango Óptimo</div>
              <div className="font-semibold">
                {data.ranges.optimal.min}-{data.ranges.optimal.max}
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Rango Aceptable</div>
              <div className="font-semibold">
                {data.ranges.acceptable.min}-{data.ranges.acceptable.max}
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Rango Convencional</div>
              <div className="font-semibold">
                {data.ranges.conventional.min}-{data.ranges.conventional.max}
              </div>
            </div>
          </div>
        </div>

        {data.interpretation && (
          <div className="mt-3 pt-3 border-t border-current opacity-75">
            <p className="text-xs italic">{data.interpretation}</p>
          </div>
        )}
      </div>
    </div>
  );
}