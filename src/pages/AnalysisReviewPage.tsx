import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Analysis, Report } from '@/lib/supabase';
import { ArrowLeft, Check, FileText } from 'lucide-react';

export default function AnalysisReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [doctorNotes, setDoctorNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (id) {
      loadAnalysisData();
    }
  }, [id]);

  async function loadAnalysisData() {
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

        if (reportData) {
          setReport(reportData);
          setDoctorNotes(reportData.doctor_notes || '');
          setRecommendations(reportData.recommendations || '');
          setRiskLevel(reportData.risk_level as 'low' | 'medium' | 'high' || 'medium');
        }

        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('id', analysisData.patient_id)
          .maybeSingle();

        setPatient(patientData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!report) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          reportId: report.id,
          doctorNotes,
          recommendations,
          riskLevel,
        },
      });

      if (error) throw error;

      alert('Análisis aprobado y enviado al paciente');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error aprobando análisis:', error);
      alert('Error al aprobar: ' + (error.message || 'Por favor intente nuevamente'));
    } finally {
      setSubmitting(false);
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
        <p className="text-gray-600">Análisis no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Revisión de Análisis</h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Paciente</h3>
            <p className="text-lg font-semibold">{patient?.name || 'Desconocido'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Subida</h3>
            <p className="text-lg">
              {new Date(analysis.uploaded_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
            <p className="text-lg">{patient?.email || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Archivo</h3>
            <a
              href={analysis.pdf_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {analysis.pdf_filename}
            </a>
          </div>
        </div>

        <div className="border-t pt-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Análisis de IA</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 whitespace-pre-wrap">
              {report.ai_analysis || 'Análisis no disponible'}
            </p>
            {report.model_used && (
              <p className="text-sm text-gray-500 mt-4">
                Modelo utilizado: {report.model_used}
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Revisión Médica</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Riesgo
              </label>
              <div className="flex gap-4">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRiskLevel(level)}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      riskLevel === level
                        ? level === 'low'
                          ? 'bg-success text-white'
                          : level === 'medium'
                          ? 'bg-warning text-white'
                          : 'bg-danger text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {level === 'low' ? 'Bajo' : level === 'medium' ? 'Medio' : 'Alto'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas del Médico
              </label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Agregue sus observaciones y comentarios profesionales..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recomendaciones
              </label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Indique las recomendaciones médicas, dieta, estilo de vida, pruebas de seguimiento..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting || !doctorNotes || !recommendations}
            className="flex items-center gap-2 px-6 py-3 bg-success text-white rounded-lg hover:bg-success-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            {submitting ? 'Aprobando...' : 'Aprobar y Enviar al Paciente'}
          </button>
        </div>
      </div>
    </div>
  );
}