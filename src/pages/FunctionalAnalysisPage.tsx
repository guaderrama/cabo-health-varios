import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Activity, FileText, Download } from 'lucide-react';
import BiomarkerCard from '@/components/biomarkers/BiomarkerCard';
import BiomarkerSummary from '@/components/biomarkers/BiomarkerSummary';

export default function FunctionalAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [biomarkers, setBiomarkers] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (id) {
      loadFunctionalAnalysis();
    }
  }, [id]);

  async function loadFunctionalAnalysis() {
    setLoading(true);
    try {
      // Cargar análisis
      const { data: analysisData } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (analysisData) {
        setAnalysis(analysisData);

        // Cargar reporte
        const { data: reportData } = await supabase
          .from('reports')
          .select('*')
          .eq('analysis_id', analysisData.id)
          .maybeSingle();

        setReport(reportData);

        // Cargar paciente
        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('id', analysisData.patient_id)
          .maybeSingle();

        setPatient(patientData);

        // Cargar biomarcadores de ejemplo
        // En producción, esto vendría del procesamiento del PDF
        loadExampleBiomarkers();
      }
    } catch (error) {
      console.error('Error cargando análisis funcional:', error);
    } finally {
      setLoading(false);
    }
  }

  function loadExampleBiomarkers() {
    // Datos de ejemplo basados en rangos funcionales
    const exampleBiomarkers = [
      {
        biomarker: 'Glucosa en Ayunas',
        value: 95,
        units: 'mg/dL',
        classification: 'SUBOPTIMO' as const,
        riskLevel: 'medium' as const,
        position: 'above_optimal' as const,
        message: 'Valor subóptimo. Requiere optimización para alcanzar rango funcional óptimo (75-86 mg/dL)',
        ranges: {
          optimal: { min: 75, max: 86 },
          acceptable: { min: 70, max: 99 },
          conventional: { min: 65, max: 99 },
        },
        interpretation: 'Óptimo: 75-86 mg/dL para prevención metabólica',
        description: 'Marcador clave de metabolismo de glucosa y riesgo de diabetes',
        category: 'metabolic',
      },
      {
        biomarker: 'Insulina en Ayunas',
        value: 4,
        units: 'μIU/mL',
        classification: 'OPTIMO' as const,
        riskLevel: 'low' as const,
        position: 'normal' as const,
        message: 'Valor óptimo según medicina funcional (2-5 μIU/mL)',
        ranges: {
          optimal: { min: 2, max: 5 },
          acceptable: { min: 2, max: 6 },
          conventional: { min: 2, max: 19 },
        },
        interpretation: 'Óptimo: 2-5 μIU/mL indica sensibilidad insulínica óptima',
        description: 'Marcador temprano de resistencia a la insulina',
        category: 'metabolic',
      },
      {
        biomarker: 'Colesterol Total',
        value: 190,
        units: 'mg/dL',
        classification: 'ACEPTABLE' as const,
        riskLevel: 'low' as const,
        position: 'above_optimal' as const,
        message: 'Valor aceptable pero fuera del rango óptimo. Rango óptimo: 120-180 mg/dL',
        ranges: {
          optimal: { min: 120, max: 180 },
          acceptable: { min: 120, max: 200 },
          conventional: { min: 0, max: 200 },
        },
        interpretation: 'Óptimo: <180 mg/dL para prevención cardiovascular',
        description: 'Marcador de riesgo cardiovascular',
        category: 'lipid',
      },
      {
        biomarker: 'LDL Colesterol',
        value: 65,
        units: 'mg/dL',
        classification: 'OPTIMO' as const,
        riskLevel: 'low' as const,
        position: 'normal' as const,
        message: 'Valor óptimo según medicina funcional (40-70 mg/dL)',
        ranges: {
          optimal: { min: 40, max: 70 },
          acceptable: { min: 40, max: 100 },
          conventional: { min: 0, max: 100 },
        },
        interpretation: 'Óptimo: <70 mg/dL, <55 mg/dL para alto riesgo',
        description: 'Colesterol malo - principal predictor CV',
        category: 'lipid',
      },
      {
        biomarker: 'TSH',
        value: 3.2,
        units: 'mIU/L',
        classification: 'SUBOPTIMO' as const,
        riskLevel: 'medium' as const,
        position: 'above_optimal' as const,
        message: 'Valor subóptimo. Requiere optimización para alcanzar rango funcional óptimo (0.5-2.0 mIU/L)',
        ranges: {
          optimal: { min: 0.5, max: 2.0 },
          acceptable: { min: 0.5, max: 2.5 },
          conventional: { min: 0.4, max: 4.0 },
        },
        interpretation: 'Óptimo: 0.5-2.0 mIU/L, meta terapéutica 1.0-2.0',
        description: 'Regulador principal de función tiroidea',
        category: 'thyroid',
      },
      {
        biomarker: 'Vitamina D (25-OH)',
        value: 28,
        units: 'ng/mL',
        classification: 'SUBOPTIMO' as const,
        riskLevel: 'medium' as const,
        position: 'below_optimal' as const,
        message: 'Valor subóptimo. Requiere optimización para alcanzar rango funcional óptimo (36-60 ng/mL)',
        ranges: {
          optimal: { min: 36, max: 60 },
          acceptable: { min: 30, max: 70 },
          conventional: { min: 30, max: 100 },
        },
        interpretation: 'Óptimo: 36-60 ng/mL, ideal 40-50 ng/mL',
        description: 'Vitamina D almacenada',
        category: 'nutritional',
      },
    ];

    setBiomarkers(exampleBiomarkers);
  }

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'metabolic', label: 'Metabólico' },
    { value: 'lipid', label: 'Lipídico' },
    { value: 'thyroid', label: 'Tiroideo' },
    { value: 'nutritional', label: 'Nutricional' },
    { value: 'hepatic', label: 'Hepático' },
    { value: 'renal', label: 'Renal' },
  ];

  const filteredBiomarkers =
    selectedCategory === 'all'
      ? biomarkers
      : biomarkers.filter((b) => b.category === selectedCategory);

  const counts = {
    optimo: biomarkers.filter((b) => b.classification === 'OPTIMO').length,
    aceptable: biomarkers.filter((b) => b.classification === 'ACEPTABLE').length,
    suboptimo: biomarkers.filter((b) => b.classification === 'SUBOPTIMO').length,
    anomalo: biomarkers.filter((b) => b.classification === 'ANOMALO').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Análisis Funcional Completo
            </h1>
            <p className="text-gray-600">Paciente: {patient?.name || 'Desconocido'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-success-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-success-dark">{counts.optimo}</div>
            <div className="text-sm text-success-dark opacity-75">Óptimo</div>
          </div>
          <div className="bg-warning-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-warning-dark">{counts.aceptable}</div>
            <div className="text-sm text-warning-dark opacity-75">Aceptable</div>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-800">{counts.suboptimo}</div>
            <div className="text-sm text-orange-800 opacity-75">Subóptimo</div>
          </div>
          <div className="bg-danger-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-danger-dark">{counts.anomalo}</div>
            <div className="text-sm text-danger-dark opacity-75">Anómalo</div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === cat.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Biomarcadores Analizados</h2>
          {filteredBiomarkers.map((biomarker, index) => (
            <BiomarkerCard key={index} data={biomarker} />
          ))}
        </div>

        <div className="space-y-4">
          <BiomarkerSummary reportId={id || ''} />

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Acciones
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/doctor/analysis/${id}`)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Revisar y Aprobar
              </button>
              {analysis?.pdf_url && (
                <a
                  href={analysis.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF Original
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}