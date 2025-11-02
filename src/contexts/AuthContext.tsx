import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userRole: 'doctor' | 'patient' | null;
  userId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role: 'doctor' | 'patient', additionalData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'doctor' | 'patient' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario inicial
    async function loadUser() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          await loadUserRole(user.id);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          await loadUserRole(currentUser.id);
        } else {
          setUserRole(null);
          setUserId(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserRole(authUserId: string) {
    // Buscar en tabla de doctores
    const { data: doctorData } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle();

    if (doctorData) {
      setUserRole('doctor');
      setUserId(doctorData.id);
      return;
    }

    // Buscar en tabla de pacientes
    const { data: patientData } = await supabase
      .from('patients')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle();

    if (patientData) {
      setUserRole('patient');
      setUserId(patientData.id);
      return;
    }

    setUserRole(null);
    setUserId(null);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }

  async function signUp(email: string, password: string, role: 'doctor' | 'patient', additionalData: any) {
    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      return { error };
    }

    // Insertar en tabla correspondiente
    const table = role === 'doctor' ? 'doctors' : 'patients';
    const { error: insertError } = await supabase
      .from(table)
      .insert({
        id: data.user.id,
        email,
        ...additionalData
      });

    if (insertError) {
      return { error: insertError };
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setUserId(null);
  }

  return (
    <AuthContext.Provider value={{ user, userRole, userId, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}