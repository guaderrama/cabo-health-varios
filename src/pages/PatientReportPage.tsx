import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Analysis, Report } from '@/lib/supabase';
import { ArrowLeft, Download, FileText, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function PatientReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadReportData();
    }
  }, [id]);

  async function loadReportData() {
    setLoading(true);
    try {
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (analysisError) throw analysisError;
      setAnalysis(analysisData);

      if (analysisData) {
        const { data: reportData } = await supabase
          .from('reports')
          .select('*')
          .eq('analysis_id', analysisData.id)
          .maybeSingle();

        setReport(reportData);
      }
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analysis || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Reporte no encontrado</p>
      </div>
    );
  }

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low':
        return 'text-success bg-success-light';
      case 'medium':
        return 'text-warning-dark bg-warning-light';
      case 'high':
        return 'text-danger-dark bg-danger-light';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle2 className="w-16 h-16" />;
      case 'medium':
        return <AlertTriangle className="w-16 h-16" />;
      case 'high':
        return <AlertCircle className="w-16 h-16" />;
      default:
        return <FileText className="w-16 h-16" />;
    }
  };

  const getRiskText = (level?: string) => {
    switch (level) {
      case 'low':
        return 'Riesgo Bajo';
      case 'medium':
        return 'Riesgo Moderado';
      case 'high':
        return 'Riesgo Alto';
      default:
        return 'Sin Clasificar';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Mi Portal
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resultados de Análisis</h1>
            <p className="text-gray-600">
              Fecha: {new Date(analysis.uploaded_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          {analysis.pdf_url && (
            <a
              href={analysis.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Download className="w-5 h-5" />
              Descargar PDF Original
            </a>
          )}
        </div>

        {/* Indicador de Riesgo */}
        <div className={`rounded-lg p-8 mb-6 ${getRiskColor(report.risk_level)}`}>
          <div className="flex items-center justify-center mb-4">
            {getRiskIcon(report.risk_level)}
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            {getRiskText(report.risk_level)}
          </h2>
          <p className="text-center">
            Según la revisión médica de sus análisis de laboratorio
          </p>
        </div>

        {/* Análisis de IA */}
        {report.ai_analysis && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              Análisis Automatizado
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {report.ai_analysis}
              </p>
            </div>
          </div>
        )}

        {/* Notas del Médico */}
        {report.doctor_notes && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-success" />
              Revisión Médica
            </h2>
            <div className="bg-primary-50 border-l-4 border-primary-600 rounded-lg p-6">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {report.doctor_notes}
              </p>
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        {report.recommendations && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-warning" />
              Recomendaciones
            </h2>
            <div className="bg-warning-light border-l-4 border-warning rounded-lg p-6">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {report.recommendations}
              </p>
            </div>
          </div>
        )}

        {/* Información Adicional */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Estado:</span>{' '}
              <span className="text-success font-medium">Revisado y Aprobado</span>
            </div>
            <div>
              <span className="font-medium">Fecha de Revisión:</span>{' '}
              {analysis.reviewed_at
                ? new Date(analysis.reviewed_at).toLocaleDateString('es-ES')
                : 'N/A'}
            </div>
            {report.model_used && (
              <div className="col-span-2">
                <span className="font-medium">Modelo de IA:</span> {report.model_used}
              </div>
            )}
          </div>
        </div>

        {/* Nota Legal */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Este reporte ha sido revisado por un profesional médico. Los resultados y recomendaciones
            deben ser discutidos con su médico tratante. No utilice esta información como único
            criterio para decisiones médicas importantes.
          </p>
        </div>
      </div>
    </div>
  );
}