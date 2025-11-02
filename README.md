# 🏥 Cabo Health - Plataforma Médica

Una plataforma médica completa para análisis de biomarcadores y gestión de pacientes, desarrollada con React, TypeScript y Supabase.

## ✨ Características

- **👨‍⚕️ Dashboard para Médicos**: Gestión completa de análisis de pacientes
- **👤 Portal de Pacientes**: Subida de archivos médicos y seguimiento de resultados
- **🤖 Análisis IA**: Integración con GROQ para análisis inteligente de biomarcadores
- **📊 Gestión de Datos**: Base de datos robusta con Supabase
- **🔒 Autenticación Segura**: Sistema de autenticación multi-rol
- **📱 Diseño Responsivo**: Interfaz moderna y adaptable

## 🚀 Tecnologías

- **Frontend**: React 18.3 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **AI**: GROQ API (llama-3.3-70b-versatile)
- **Charts**: Chart.js + Recharts
- **Formularios**: React Hook Form + Zod
- **Routing**: React Router Dom

## 🏗️ Arquitectura

### Estructura del Proyecto
```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Componentes de autenticación
│   ├── biomarkers/     # Componentes de biomarcadores
│   ├── common/         # Componentes comunes
│   ├── doctor/         # Componentes específicos para médicos
│   └── patient/        # Componentes específicos para pacientes
├── contexts/           # Context providers (Auth, etc.)
├── hooks/              # Custom hooks
├── lib/                # Utilidades y configuraciones
└── pages/              # Páginas de la aplicación
```

### Backend (Supabase)
- **Edge Functions**: `process-pdf`, `classify-biomarker`, `generate-report`
- **Database**: PostgreSQL con RLS
- **Storage**: Para archivos PDF médicos
- **Auth**: Autenticación JWT

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- pnpm
- Cuenta de Supabase
- Clave API de GROQ

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd cabo-health
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
GROQ_API_KEY=tu_groq_api_key
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key (opcional)
```

### 4. Ejecutar en desarrollo
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Construir para producción
```bash
pnpm build
```

## 📋 Funcionalidades Principales

### Para Médicos
- ✅ Registro y autenticación especializada
- ✅ Dashboard con lista de análisis de pacientes
- ✅ Filtros por estado (pendiente, aprobado, rechazado)
- ✅ Revisión detallada de análisis
- ✅ Análisis funcional con IA
- ✅ Descarga de reportes en PDF
- ✅ Visualización de biomarcadores con alertas de riesgo

### Para Pacientes
- ✅ Registro con datos médicos
- ✅ Portal personal seguro
- ✅ Subida de archivos PDF médicos
- ✅ Seguimiento del estado de análisis
- ✅ Visualización de resultados y reportes
- ✅ Notificaciones de estado

### Análisis con IA
- ✅ Procesamiento automático de PDFs médicos
- ✅ Clasificación inteligente de biomarcadores
- ✅ Generación de reportes médicos con IA
- ✅ Análisis de riesgo automatizado

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo
pnpm build           # Construir para producción
pnpm preview         # Vista previa de la build

# Calidad de código
pnpm lint            # Ejecutar ESLint
pnpm clean           # Limpiar dependencias y cache

# Gestión de dependencias
pnpm install-deps    # Instalar dependencias con cache
```

## 🌐 URLs Importantes

- **Frontend**: https://jxhuqjo1k4pr.space.minimax.io
- **Supabase**: https://holtohiphaokzshtpyku.supabase.co

## 📚 Documentación Adicional

- [Guía de Supabase](./docs/supabase-setup.md)
- [Configuración de Edge Functions](./docs/edge-functions.md)
- [Variables de Entorno](./.env.example)

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

Desarrollado por el equipo de Cabo Health

## 🔗 Enlaces Útiles

- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [GROQ API](https://groq.com)

---

**Nota**: Esta es una aplicación médica. Asegúrate de cumplir con todas las regulaciones de privacidad y seguridad de datos médicos antes del despliegue en producción.