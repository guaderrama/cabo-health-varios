import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Analysis, Report } from '@/lib/supabase';
import { Upload, FileText, CheckCircle, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalysisWithReport extends Analysis {
  report?: Report;
}

export default function PatientDashboard() {
  const { userId } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (userId) {
      loadAnalyses();
    }
  }, [userId]);

  async function loadAnalyses() {
    setLoading(true);
    try {
      const { data: analysesData, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('patient_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const analysesWithReports = await Promise.all(
        (analysesData || []).map(async (analysis) => {
          const { data: reportData } = await supabase
            .from('reports')
            .select('*')
            .eq('analysis_id', analysis.id)
            .maybeSingle();

          return {
            ...analysis,
            report: reportData || undefined,
          };
        })
      );

      setAnalyses(analysesWithReports);
    } catch (error) {
      console.error('Error cargando análisis:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload() {
    if (!selectedFile || !userId) return;

    setUploading(true);
    try {
      // Convertir archivo a base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Obtener datos del paciente
      const { data: patientData } = await supabase
        .from('patients')
        .select('name, birth_date, gender')
        .eq('id', userId)
        .maybeSingle();

      // Calcular edad
      let age = 0;
      if (patientData?.birth_date) {
        const birthDate = new Date(patientData.birth_date);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
      }

      // Llamar a edge function
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: {
          pdfData: base64,
          fileName: selectedFile.name,
          patientId: userId,
          patientName: patientData?.name || 'Paciente',
          patientAge: age,
          patientGender: patientData?.gender || 'unknown',
        },
      });

      if (error) throw error;

      alert('Análisis subido exitosamente. Será revisado por su médico.');
      setSelectedFile(null);
      await loadAnalyses();
    } catch (error: any) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo: ' + (error.message || 'Por favor intente nuevamente'));
    } finally {
      setUploading(false);
    }
  }

  const approvedAnalyses = analyses.filter(a => a.status === 'approved');
  const pendingCount = analyses.filter(a => a.status === 'pending').length;

  // Datos para gráfico de tendencia (ejemplo simplificado)
  const chartData = {
    labels: approvedAnalyses.slice(0, 5).reverse().map((_, i) => `Análisis ${i + 1}`),
    datasets: [
      {
        label: 'Nivel de Riesgo',
        data: approvedAnalyses.slice(0, 5).reverse().map(a => {
          const risk = a.report?.risk_level;
          return risk === 'low' ? 1 : risk === 'medium' ? 2 : risk === 'high' ? 3 : 0;
        }),
        borderColor: 'rgb(12, 74, 110)',
        backgroundColor: 'rgba(12, 74, 110, 0.1)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 3,
        ticks: {
          callback: (value: number | string) => {
            const val = Number(value);
            return val === 1 ? 'Bajo' : val === 2 ? 'Medio' : val === 3 ? 'Alto' : '';
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mi Portal de Salud</h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium">Total Análisis</p>
              <p className="text-3xl font-bold mt-1">{analyses.length}</p>
            </div>
            <FileText className="w-12 h-12 text-primary-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-warning to-warning-dark text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">En Revisión</p>
              <p className="text-3xl font-bold mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-success to-success-dark text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completados</p>
              <p className="text-3xl font-bold mt-1">{approvedAnalyses.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Subir nuevo análisis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subir Nuevo Análisis</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition inline-block">
                  Seleccionar PDF
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
            {selectedFile && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span>
                </p>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="mt-4 bg-success text-white px-6 py-2 rounded-lg hover:bg-success-dark transition disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : 'Subir Análisis'}
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Formatos aceptados: PDF (máximo 20MB)
            </p>
          </div>
        </div>
      </div>

      {/* Tendencia */}
      {approvedAnalyses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencia de Salud</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Lista de análisis */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Mis Análisis</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aún no has subido ningún análisis</p>
            </div>
          ) : (
            analyses.map((analysis) => (
              <div key={analysis.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {analysis.pdf_filename || 'Análisis de Laboratorio'}
                      </h3>
                      {analysis.status === 'pending' && (
                        <span className="px-3 py-1 bg-warning-light text-warning-dark text-sm rounded-full">
                          En revisión
                        </span>
                      )}
                      {analysis.status === 'approved' && (
                        <span className="px-3 py-1 bg-success-light text-success-dark text-sm rounded-full">
                          Completado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.uploaded_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {analysis.status === 'approved' && analysis.report && (
                    <button
                      onClick={() => window.location.href = `/patient/report/${analysis.id}`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Ver Resultados
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}