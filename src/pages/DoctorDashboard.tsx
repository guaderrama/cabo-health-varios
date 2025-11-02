import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Analysis, Report } from '@/lib/supabase';
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalysisWithReport extends Analysis {
  report?: Report;
  patient?: { name: string; email: string };
}

export default function DoctorDashboard() {
  const { userId } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadAnalyses();
    }
  }, [userId, filter]);

  async function loadAnalyses() {
    setLoading(true);
    try {
      let query = supabase
        .from('analyses')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      } else if (filter === 'approved') {
        query = query.eq('status', 'approved');
      }

      const { data: analysesData, error } = await query;

      if (error) throw error;

      // Cargar reportes y pacientes
      const analysesWithDetails = await Promise.all(
        (analysesData || []).map(async (analysis) => {
          const { data: reportData } = await supabase
            .from('reports')
            .select('*')
            .eq('analysis_id', analysis.id)
            .maybeSingle();

          const { data: patientData } = await supabase
            .from('patients')
            .select('name, email')
            .eq('id', analysis.patient_id)
            .maybeSingle();

          return {
            ...analysis,
            report: reportData || undefined,
            patient: patientData || undefined,
          };
        })
      );

      setAnalyses(analysesWithDetails);
    } catch (error) {
      console.error('Error cargando análisis:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      pending: { color: 'bg-warning text-warning-dark', text: 'Pendiente', icon: Clock },
      processing: { color: 'bg-primary-100 text-primary-700', text: 'Procesando', icon: Clock },
      approved: { color: 'bg-success text-success-dark', text: 'Aprobado', icon: CheckCircle },
      rejected: { color: 'bg-danger text-danger-dark', text: 'Rechazado', icon: AlertCircle },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  }

  function getRiskBadge(riskLevel?: string) {
    if (!riskLevel) return null;
    
    const badges = {
      low: { color: 'bg-success-light text-success-dark', text: 'Bajo' },
      medium: { color: 'bg-warning-light text-warning-dark', text: 'Medio' },
      high: { color: 'bg-danger-light text-danger-dark', text: 'Alto' },
    };
    
    const badge = badges[riskLevel as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Análisis de Pacientes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'approved'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Aprobados
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay análisis</h3>
          <p className="text-gray-600">
            {filter === 'pending' ? 'No hay análisis pendientes de revisión' : 'No hay análisis para mostrar'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {analysis.patient?.name || 'Paciente Desconocido'}
                    </h3>
                    {getStatusBadge(analysis.status)}
                    {analysis.report?.risk_level && getRiskBadge(analysis.report.risk_level)}
                  </div>
                  <p className="text-sm text-gray-600">{analysis.patient?.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Subido: {new Date(analysis.uploaded_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/doctor/functional/${analysis.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Análisis Funcional
                  </button>
                  <button
                    onClick={() => navigate(`/doctor/analysis/${analysis.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Revisar
                  </button>
                  {analysis.pdf_url && (
                    <a
                      href={analysis.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </a>
                  )}
                </div>
              </div>

              {analysis.pdf_filename && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FileText className="w-4 h-4" />
                  {analysis.pdf_filename}
                </div>
              )}

              {analysis.report?.ai_analysis && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {analysis.report.ai_analysis.substring(0, 200)}...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}