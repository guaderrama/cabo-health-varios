import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://holtohiphaokzshtpyku.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas
export interface Doctor {
  id: string;
  email: string;
  name: string;
  specialty?: string;
  license_number?: string;
  clinic_name?: string;
  phone?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  email: string;
  name: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  created_at: string;
}

export interface Analysis {
  id: string;
  patient_id: string;
  doctor_id?: string;
  pdf_url?: string;
  pdf_filename?: string;
  extracted_text?: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  uploaded_at: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Report {
  id: string;
  analysis_id: string;
  ai_analysis?: string;
  doctor_notes?: string;
  recommendations?: string;
  risk_level?: 'low' | 'medium' | 'high';
  approved_by_doctor: boolean;
  model_used?: string;
  report_pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  user_type: 'doctor' | 'patient';
  message: string;
  type: string;
  read: boolean;
  related_analysis_id?: string;
  created_at: string;
}