import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CategorySummary {
  category: string;
  total: number;
  optimo: number;
  aceptable: number;
  suboptimo: number;
  anomalo: number;
}

export default function BiomarkerSummary({ reportId }: { reportId: string }) {
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [reportId]);

  async function loadSummary() {
    setLoading(true);
    try {
      // En una implementación real, esto vendría de la base de datos
      // Por ahora, mostrar un resumen de ejemplo
      const mockSummary: CategorySummary[] = [
        {
          category: 'Metabólico',
          total: 5,
          optimo: 3,
          aceptable: 1,
          suboptimo: 1,
          anomalo: 0,
        },
        {
          category: 'Lipídico',
          total: 6,
          optimo: 4,
          aceptable: 2,
          suboptimo: 0,
          anomalo: 0,
        },
        {
          category: 'Tiroideo',
          total: 4,
          optimo: 2,
          aceptable: 1,
          suboptimo: 1,
          anomalo: 0,
        },
      ];
      setSummary(mockSummary);
    } catch (error) {
      console.error('Error cargando resumen:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTrend = (category: CategorySummary) => {
    const optimalPercentage = (category.optimo / category.total) * 100;
    if (optimalPercentage >= 75) return 'up';
    if (optimalPercentage >= 50) return 'stable';
    return 'down';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-success" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-danger" />;
      default:
        return <Minus className="w-5 h-5 text-warning" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'Metabólico': 'Metabólico',
      'Lipídico': 'Perfil Lipídico',
      'Tiroideo': 'Función Tiroidea',
      'Nutricional': 'Nutricional',
      'Hepático': 'Función Hepática',
      'Renal': 'Función Renal',
      'Inflamatorio': 'Inflamación',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Resumen por Categoría</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4">
          {summary.map((category) => {
            const trend = getTrend(category);
            const optimalPercentage = Math.round((category.optimo / category.total) * 100);

            return (
              <div
                key={category.category}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getCategoryLabel(category.category)}
                    </h3>
                    {getTrendIcon(trend)}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {optimalPercentage}%
                    </div>
                    <div className="text-xs text-gray-500">óptimo</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total de biomarcadores:</span>
                    <span className="font-medium">{category.total}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-success-light rounded px-2 py-1 text-center">
                      <div className="font-bold text-success-dark">{category.optimo}</div>
                      <div className="text-success-dark opacity-75">Óptimo</div>
                    </div>
                    <div className="bg-warning-light rounded px-2 py-1 text-center">
                      <div className="font-bold text-warning-dark">{category.aceptable}</div>
                      <div className="text-warning-dark opacity-75">Aceptable</div>
                    </div>
                    <div className="bg-orange-100 rounded px-2 py-1 text-center">
                      <div className="font-bold text-orange-800">{category.suboptimo}</div>
                      <div className="text-orange-800 opacity-75">Subóptimo</div>
                    </div>
                    <div className="bg-danger-light rounded px-2 py-1 text-center">
                      <div className="font-bold text-danger-dark">{category.anomalo}</div>
                      <div className="text-danger-dark opacity-75">Anómalo</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-success"
                        style={{ width: `${(category.optimo / category.total) * 100}%` }}
                      ></div>
                      <div
                        className="bg-warning"
                        style={{ width: `${(category.aceptable / category.total) * 100}%` }}
                      ></div>
                      <div
                        className="bg-orange-400"
                        style={{ width: `${(category.suboptimo / category.total) * 100}%` }}
                      ></div>
                      <div
                        className="bg-danger"
                        style={{ width: `${(category.anomalo / category.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-2">Medicina Funcional</h3>
          <p className="text-sm text-primary-800">
            Los rangos óptimos están basados en medicina funcional, que busca la optimización de
            la salud más allá de la ausencia de enfermedad. Los valores en rango óptimo indican
            funcionamiento metabólico ideal.
          </p>
        </div>
      </div>
    </div>
  );
}