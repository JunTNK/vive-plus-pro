'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
const AsistenteIA = dynamic(() => import('@/components/asistente/AsistenteIA'), { ssr: false });
const GoogleCalendarConnect = dynamic(() => import('@/components/GoogleCalendarConnect'), { ssr: false });
const ParticipanteForm = dynamic(() => import('@/components/ParticipanteForm'), { ssr: false });
const ProgramasSection = dynamic(() => import('@/components/ProgramasSection'), { ssr: false });
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Calendar, Activity, FileText, Plus, Search, 
  Home, Phone, AlertCircle, Clock, MapPin, Edit, Trash2,
  Heart, BookOpen, Music, Gamepad, Sparkles,
  CheckCircle2, XCircle, Timer, Dumbbell, Brain, Loader2, Download, Share2, FileImage, TrendingUp, Shield, BarChart3, LineChart, GitCompare
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Tipos
interface Programa {
  id: string;
  nombre: string;
  categoria: string;
}

interface AdultoMayor {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date | string;
  genero?: string | null;
  direccion: string;
  telefono?: string | null;
  email?: string | null;
  contactoEmergencia?: string | null;
  parentescoEmergencia?: string | null;
  telefonoEmergencia?: string | null;
  tipoSangre?: string | null;
  peso?: number | null;
  talla?: number | null;
  imc?: number | null;
  condicionesSalud?: string | null;
  medicamentos?: string | null;
  alergias?: string | null;
  cirugias?: string | null;
  usoAyudas?: string | null;
  estadoCognitivo?: string | null;
  estadoEmocional?: string | null;
  nivelIndependencia?: string | null;
  requiereAsistencia?: string | null;
  viveSolo?: boolean | null;
  cuidadorPrincipal?: string | null;
  telefonoCuidador?: string | null;
  seguroMedico?: string | null;
  numeroSeguro?: string | null;
  medicoPrimario?: string | null;
  telefonoMedico?: string | null;
  programaId?: string | null;
  fechaUltimaEvaluacion?: Date | string | null;
  puntajeRiesgo?: number | null;
  observaciones?: string | null;
  activo: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    visitas: number;
    actividades: number;
    notas: number;
  };
  programa?: Programa | null;
}

interface Visita {
  id: string;
  adultoMayorId: string;
  fecha: Date | string;
  duracion: number;
  tipoVisita: string;
  estado: string;
  observaciones: string | null;
  adultoMayor?: {
    id: string;
    nombre: string;
    apellido: string;
    direccion: string;
    telefono: string | null;
  };
}

interface Actividad {
  id: string;
  adultoMayorId: string;
  fecha: Date | string;
  tipoActividad: string;
  titulo: string;
  descripcion: string | null;
  duracion: number | null;
  notas: string | null;
  adultoMayor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

interface Nota {
  id: string;
  adultoMayorId: string;
  fecha: Date | string;
  titulo: string;
  contenido: string;
  tipo: string;
  adultoMayor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

interface Evaluacion {
  id: string;
  adultoMayorId: string;
  fecha: Date | string;
  equilibrioEstatico: number | null;
  levantarseSentarse: number | null;
  flexionTronco: number | null;
  flexionesBrazo: number | null;
  juntarManosEspalda: string | null;
  levantarseCaminar: number | null;
  marcha2Minutos: number | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  frecuenciaCardiaca: number | null;
  puntajeTotal: number | null;
  clasificacionRiesgo: string | null;
  observaciones: string | null;
  recomendaciones: string | null;
  adultoMayor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

interface Estadisticas {
  resumen: {
    totalAdultos: number;
    adultosActivos: number;
    totalVisitas: number;
    visitasPendientes: number;
    totalActividades: number;
    visitasHoy: number;
  };
  proximasVisitas: Visita[];
  ultimasActividades: Actividad[];
  actividadesPorTipo: { tipo: string; cantidad: number }[];
  visitasPorEstado: { estado: string; cantidad: number }[];
}

// Utilidades
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const calcularEdad = (fechaNacimiento: Date | string) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

const getTipoVisitaLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    rutinaria: 'Rutinaria',
    seguimiento: 'Seguimiento',
    urgente: 'Urgente',
    recreativa: 'Recreativa'
  };
  return tipos[tipo] || tipo;
};

const getTipoActividadIcon = (tipo: string) => {
  const iconos: Record<string, React.ReactNode> = {
    ejercicio: <Heart className="h-4 w-4" />,
    manualidad: <Sparkles className="h-4 w-4" />,
    lectura: <BookOpen className="h-4 w-4" />,
    musica: <Music className="h-4 w-4" />,
    juego: <Gamepad className="h-4 w-4" />,
    otra: <Activity className="h-4 w-4" />
  };
  return iconos[tipo] || <Activity className="h-4 w-4" />;
};

const getTipoActividadLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    ejercicio: 'Ejercicio',
    manualidad: 'Manualidad',
    lectura: 'Lectura',
    musica: 'Música',
    juego: 'Juego',
    otra: 'Otra'
  };
  return tipos[tipo] || tipo;
};

const getEstadoBadge = (estado: string) => {
  const estilos: Record<string, string> = {
    programada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  const labels: Record<string, string> = {
    programada: 'Programada',
    completada: 'Completada',
    cancelada: 'Cancelada'
  };
  return (
    <Badge variant="outline" className={estilos[estado] || ''}>
      {labels[estado] || estado}
    </Badge>
  );
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adultosMayores, setAdultosMayores] = useState<AdultoMayor[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdulto, setSelectedAdulto] = useState<AdultoMayor | null>(null);
  
  // Estados de diálogos
  const [adultoDialogOpen, setAdultoDialogOpen] = useState(false);
  const [visitaDialogOpen, setVisitaDialogOpen] = useState(false);
  const [actividadDialogOpen, setActividadDialogOpen] = useState(false);
  const [notaDialogOpen, setNotaDialogOpen] = useState(false);
  const [evaluacionDialogOpen, setEvaluacionDialogOpen] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  
  // Estado para análisis IA
  const [analizandoIA, setAnalizandoIA] = useState<string | null>(null);
  const [informeIA, setInformeIA] = useState<{ [key: string]: string }>({});
  
  // Estado para editar evaluación
  const [editandoEvaluacion, setEditandoEvaluacion] = useState<Evaluacion | null>(null);
  const [evaluacionDetalleOpen, setEvaluacionDetalleOpen] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState<string | null>(null);
  
  // Estado para planes de ejercicio y predicción
  const [generandoPlan, setGenerandoPlan] = useState<string | null>(null);
  const [generandoPrediccion, setGenerandoPrediccion] = useState<string | null>(null);
  const [planGenerado, setPlanGenerado] = useState<{ [key: string]: string }>({});
  const [prediccionGenerada, setPrediccionGenerada] = useState<{ [key: string]: any }>({});
  const [evaluacionesParticipante, setEvaluacionesParticipante] = useState<{ [key: string]: Evaluacion[] }>({});
  
  // Estados para gráficos de progreso y comparativa
  const [progresoDialogOpen, setProgresoDialogOpen] = useState(false);
  const [comparativaDialogOpen, setComparativaDialogOpen] = useState(false);
  const [participanteSeleccionadoProgreso, setParticipanteSeleccionadoProgreso] = useState<AdultoMayor | null>(null);
  const [evaluacionesParaComparar, setEvaluacionesParaComparar] = useState<Evaluacion[]>([]);
  const [cargandoProgreso, setCargandoProgreso] = useState(false);
  
  // Estado de conexión - inicializar con valores por defecto para evitar hidratación
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Efecto para detectar conexión - solo en cliente
  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      toast({ title: '🟢 Conexión restaurada', description: 'Sincronizando datos...' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      toast({ title: '🔴 Sin conexión', description: 'Trabajando en modo offline', variant: 'destructive' });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Formularios
  const [visitaForm, setVisitaForm] = useState({
    adultoMayorId: '',
    fecha: '',
    hora: '',
    duracion: 60,
    tipoVisita: 'rutinaria',
    estado: 'programada',
    observaciones: ''
  });
  
  const [actividadForm, setActividadForm] = useState({
    adultoMayorId: '',
    fecha: '',
    titulo: '',
    tipoActividad: 'otra',
    descripcion: '',
    duracion: '',
    notas: ''
  });
  
  const [notaForm, setNotaForm] = useState({
    adultoMayorId: '',
    titulo: '',
    contenido: '',
    tipo: 'general'
  });
  
  // Estado para evaluación guiada ECOSAFE
  const [evaluacionStep, setEvaluacionStep] = useState(0); // 0: seleccionar, 1-7: pruebas, 8: observaciones, 9: finalizar
  const [evaluacionLado, setEvaluacionLado] = useState<'izquierdo' | 'derecho' | null>(null);
  const [evaluacionForm, setEvaluacionForm] = useState({
    adultoMayorId: '',
    // Pruebas ECOSAFE - Bilaterales donde aplica
    equilibrioEstaticoIzq: '',
    equilibrioEstaticoDer: '',
    levantarseSentarse: '', // No bilateral
    flexionTroncoIzq: '',
    flexionTroncoDer: '',
    flexionesBrazoIzq: '',
    flexionesBrazoDer: '',
    manosEspaldaIzq: '', // si/parcial/no
    manosEspaldaDer: '',
    levantarseCaminar1: '', // 2 intentos
    levantarseCaminar2: '',
    marcha2Minutos: '', // No bilateral
    // Signos vitales
    presionSistolica: '',
    presionDiastolica: '',
    frecuenciaCardiaca: '',
    // Observaciones
    observaciones: '',
    recomendaciones: ''
  });

  // Definición de pruebas ECOSAFE con sus características
  const pruebasECOSAFE = [
    { 
      id: 1, 
      nombre: 'Equilibrio Estático', 
      descripcion: 'Tiempo en segundos que puede mantenerse en un pie sin apoyo',
      unidad: 'segundos',
      bilateral: true,
      campoIzq: 'equilibrioEstaticoIzq',
      campoDer: 'equilibrioEstaticoDer'
    },
    { 
      id: 2, 
      nombre: 'Levantarse y Sentarse', 
      descripcion: 'Número de veces que puede levantarse y sentarse de una silla en 30 segundos',
      unidad: 'repeticiones',
      bilateral: false,
      campo: 'levantarseSentarse'
    },
    { 
      id: 3, 
      nombre: 'Flexión de Tronco', 
      descripcion: 'Distancia en cm que puede alcanzar con las manos hacia los pies sentado',
      unidad: 'cm',
      bilateral: true,
      campoIzq: 'flexionTroncoIzq',
      campoDer: 'flexionTroncoDer'
    },
    { 
      id: 4, 
      nombre: 'Flexiones de Brazo', 
      descripcion: 'Número de flexiones de brazo contra la pared en 30 segundos',
      unidad: 'repeticiones',
      bilateral: true,
      campoIzq: 'flexionesBrazoIzq',
      campoDer: 'flexionesBrazoDer'
    },
    { 
      id: 5, 
      nombre: 'Manos detrás de la Espalda', 
      descripcion: 'Capacidad de juntar las manos detrás de la espalda',
      unidad: 'evaluación',
      bilateral: true,
      campoIzq: 'manosEspaldaIzq',
      campoDer: 'manosEspaldaDer',
      opciones: ['si', 'parcial', 'no']
    },
    { 
      id: 6, 
      nombre: 'Levantarse-Caminar-Sentarse', 
      descripcion: 'Tiempo en segundos para levantarse, caminar 3 metros y volver a sentarse (2 intentos)',
      unidad: 'segundos',
      bilateral: false,
      dosIntentos: true,
      campo1: 'levantarseCaminar1',
      campo2: 'levantarseCaminar2'
    },
    { 
      id: 7, 
      nombre: 'Marcha 2 Minutos', 
      descripcion: 'Número de pasos completados en 2 minutos de marcha en el lugar',
      unidad: 'pasos',
      bilateral: false,
      campo: 'marcha2Minutos'
    }
  ];

  // Calcular progreso total
  const calcularProgreso = () => {
    let totalPasos = 1; // Selección de participante
    let pasosCompletados = evaluacionForm.adultoMayorId ? 1 : 0;
    
    pruebasECOSAFE.forEach(prueba => {
      if (prueba.bilateral) {
        totalPasos += 2; // Lado izquierdo y derecho
        if (evaluacionForm[prueba.campoIzq as keyof typeof evaluacionForm]) pasosCompletados++;
        if (evaluacionForm[prueba.campoDer as keyof typeof evaluacionForm]) pasosCompletados++;
      } else if (prueba.dosIntentos) {
        totalPasos += 2;
        if (evaluacionForm[prueba.campo1 as keyof typeof evaluacionForm]) pasosCompletados++;
        if (evaluacionForm[prueba.campo2 as keyof typeof evaluacionForm]) pasosCompletados++;
      } else {
        totalPasos += 1;
        if (evaluacionForm[prueba.campo as keyof typeof evaluacionForm]) pasosCompletados++;
      }
    });
    
    totalPasos += 1; // Observaciones
    if (evaluacionForm.observaciones || evaluacionForm.recomendaciones) pasosCompletados++;
    
    return { total: totalPasos, completados: pasosCompletados };
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [adultosRes, estadisticasRes, programasRes] = await Promise.all([
        fetch('/api/adultos-mayores'),
        fetch('/api/estadisticas'),
        fetch('/api/programas')
      ]);
      
      const adultosData = await adultosRes.json();
      const estadisticasData = await estadisticasRes.json();
      const programasData = await programasRes.json();
      
      // Asegurar que sean arrays
      setAdultosMayores(Array.isArray(adultosData) ? adultosData : []);
      setEstadisticas(estadisticasData?.resumen ? estadisticasData : null);
      setProgramas(Array.isArray(programasData) ? programasData : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setAdultosMayores([]);
      setProgramas([]);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarVisitas = async () => {
    try {
      const res = await fetch('/api/visitas');
      const data = await res.json();
      setVisitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar visitas:', error);
      setVisitas([]);
    }
  };

  const cargarActividades = async () => {
    try {
      const res = await fetch('/api/actividades');
      const data = await res.json();
      setActividades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setActividades([]);
    }
  };

  const cargarNotas = async () => {
    try {
      const res = await fetch('/api/notas');
      const data = await res.json();
      setNotas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar notas:', error);
      setNotas([]);
    }
  };

  // CRUD Adulto Mayor
  const eliminarAdultoMayor = async (id: string) => {
    try {
      const res = await fetch(`/api/adultos-mayores/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        toast({
          title: 'Eliminado',
          description: 'Adulto mayor eliminado correctamente'
        });
        cargarDatos();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el adulto mayor',
        variant: 'destructive'
      });
    }
  };

  // CRUD Visita
  const guardarVisita = async () => {
    try {
      const fechaHora = `${visitaForm.fecha}T${visitaForm.hora}`;
      const res = await fetch('/api/visitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...visitaForm,
          fecha: fechaHora
        })
      });
      
      if (res.ok) {
        toast({
          title: 'Creado',
          description: 'Visita programada correctamente'
        });
        setVisitaDialogOpen(false);
        resetVisitaForm();
        cargarDatos();
        cargarVisitas();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la visita',
        variant: 'destructive'
      });
    }
  };

  const actualizarEstadoVisita = async (id: string, estado: string) => {
    try {
      const res = await fetch(`/api/visitas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });
      
      if (res.ok) {
        toast({
          title: 'Actualizado',
          description: 'Estado de visita actualizado'
        });
        cargarDatos();
        cargarVisitas();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la visita',
        variant: 'destructive'
      });
    }
  };

  // CRUD Actividad
  const guardarActividad = async () => {
    try {
      const res = await fetch('/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actividadForm)
      });
      
      if (res.ok) {
        toast({
          title: 'Creado',
          description: 'Actividad registrada correctamente'
        });
        setActividadDialogOpen(false);
        resetActividadForm();
        cargarDatos();
        cargarActividades();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la actividad',
        variant: 'destructive'
      });
    }
  };

  // CRUD Nota
  const guardarNota = async () => {
    try {
      const res = await fetch('/api/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notaForm)
      });
      
      if (res.ok) {
        toast({
          title: 'Creado',
          description: 'Nota registrada correctamente'
        });
        setNotaDialogOpen(false);
        resetNotaForm();
        cargarNotas();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la nota',
        variant: 'destructive'
      });
    }
  };

  // Reset formularios
  const resetVisitaForm = () => {
    setVisitaForm({
      adultoMayorId: '',
      fecha: '',
      hora: '',
      duracion: 60,
      tipoVisita: 'rutinaria',
      estado: 'programada',
      observaciones: ''
    });
  };

  const resetActividadForm = () => {
    setActividadForm({
      adultoMayorId: '',
      fecha: '',
      titulo: '',
      tipoActividad: 'otra',
      descripcion: '',
      duracion: '',
      notas: ''
    });
  };

  const resetNotaForm = () => {
    setNotaForm({
      adultoMayorId: '',
      titulo: '',
      contenido: '',
      tipo: 'general'
    });
  };

  const resetEvaluacionForm = () => {
    setEvaluacionForm({
      adultoMayorId: '',
      equilibrioEstaticoIzq: '',
      equilibrioEstaticoDer: '',
      levantarseSentarse: '',
      flexionTroncoIzq: '',
      flexionTroncoDer: '',
      flexionesBrazoIzq: '',
      flexionesBrazoDer: '',
      manosEspaldaIzq: '',
      manosEspaldaDer: '',
      levantarseCaminar1: '',
      levantarseCaminar2: '',
      marcha2Minutos: '',
      presionSistolica: '',
      presionDiastolica: '',
      frecuenciaCardiaca: '',
      observaciones: '',
      recomendaciones: ''
    });
    setEvaluacionStep(0);
    setEvaluacionLado(null);
  };

  // Cargar evaluaciones
  const cargarEvaluaciones = async () => {
    try {
      const res = await fetch('/api/evaluaciones');
      const data = await res.json();
      setEvaluaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      setEvaluaciones([]);
    }
  };

  // Avanzar al siguiente paso de evaluación
  const siguientePasoEvaluacion = () => {
    if (evaluacionStep === 0 && !evaluacionForm.adultoMayorId) {
      toast({ title: 'Selecciona un participante', variant: 'destructive' });
      return;
    }
    
    const pruebaActual = pruebasECOSAFE[evaluacionStep - 1];
    
    // Si es prueba bilateral, verificar lado
    if (pruebaActual?.bilateral) {
      if (evaluacionLado === 'izquierdo') {
        // Pasar al lado derecho
        setEvaluacionLado('derecho');
        return;
      } else if (evaluacionLado === 'derecho') {
        // Pasar a siguiente prueba
        setEvaluacionLado(null);
        setEvaluacionStep(evaluacionStep + 1);
        return;
      } else {
        // Iniciar con lado izquierdo
        setEvaluacionLado('izquierdo');
        return;
      }
    }
    
    // Si tiene 2 intentos
    if (pruebaActual?.dosIntentos) {
      if (!evaluacionForm[pruebaActual.campo1 as keyof typeof evaluacionForm]) {
        toast({ title: 'Ingresa el primer intento', variant: 'destructive' });
        return;
      }
      if (!evaluacionForm[pruebaActual.campo2 as keyof typeof evaluacionForm]) {
        toast({ title: 'Ingresa el segundo intento', variant: 'destructive' });
        return;
      }
    }
    
    setEvaluacionStep(evaluacionStep + 1);
  };

  // Retroceder en la evaluación
  const anteriorPasoEvaluacion = () => {
    if (evaluacionLado === 'derecho') {
      setEvaluacionLado('izquierdo');
    } else if (evaluacionLado === 'izquierdo') {
      setEvaluacionLado(null);
    } else if (evaluacionStep > 0) {
      setEvaluacionStep(evaluacionStep - 1);
      const pruebaAnterior = pruebasECOSAFE[evaluacionStep - 2];
      if (pruebaAnterior?.bilateral) {
        setEvaluacionLado('derecho');
      }
    }
  };

  // Guardar evaluación ECOSAFE
  const guardarEvaluacion = async () => {
    if (!evaluacionForm.adultoMayorId) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un participante',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Preparar datos para enviar - calcular mejores valores para pruebas bilaterales
      const datosEnvio = {
        adultoMayorId: evaluacionForm.adultoMayorId,
        // Equilibrio: mejor de ambos lados
        equilibrioEstatico: Math.max(
          parseFloat(evaluacionForm.equilibrioEstaticoIzq) || 0,
          parseFloat(evaluacionForm.equilibrioEstaticoDer) || 0
        ) || null,
        // Levantarse sentarse
        levantarseSentarse: parseInt(evaluacionForm.levantarseSentarse) || null,
        // Flexión tronco: mejor de ambos lados
        flexionTronco: Math.max(
          parseFloat(evaluacionForm.flexionTroncoIzq) || 0,
          parseFloat(evaluacionForm.flexionTroncoDer) || 0
        ) || null,
        // Flexiones brazo: mejor de ambos lados
        flexionesBrazo: Math.max(
          parseInt(evaluacionForm.flexionesBrazoIzq) || 0,
          parseInt(evaluacionForm.flexionesBrazoDer) || 0
        ) || null,
        // Manos espalda: mejor resultado
        juntarManosEspalda: (evaluacionForm.manosEspaldaIzq === 'si' || evaluacionForm.manosEspaldaDer === 'si') 
          ? 'si' 
          : (evaluacionForm.manosEspaldaIzq === 'parcial' || evaluacionForm.manosEspaldaDer === 'parcial')
            ? 'parcial' : 'no',
        // Levantarse caminar: mejor tiempo
        levantarseCaminar: Math.min(
          parseFloat(evaluacionForm.levantarseCaminar1) || Infinity,
          parseFloat(evaluacionForm.levantarseCaminar2) || Infinity
        ) === Infinity ? null : Math.min(
          parseFloat(evaluacionForm.levantarseCaminar1) || Infinity,
          parseFloat(evaluacionForm.levantarseCaminar2) || Infinity
        ),
        // Marcha
        marcha2Minutos: parseInt(evaluacionForm.marcha2Minutos) || null,
        // Signos vitales
        presionSistolica: parseInt(evaluacionForm.presionSistolica) || null,
        presionDiastolica: parseInt(evaluacionForm.presionDiastolica) || null,
        frecuenciaCardiaca: parseInt(evaluacionForm.frecuenciaCardiaca) || null,
        // Observaciones
        observaciones: evaluacionForm.observaciones,
        recomendaciones: evaluacionForm.recomendaciones,
        // Datos crudos para reportes detallados
        datosCompletos: evaluacionForm
      };
      
      const res = await fetch('/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnvio)
      });
      
      if (res.ok) {
        const evaluacion = await res.json();
        toast({
          title: '✅ Evaluación Guardada',
          description: `Puntaje: ${evaluacion.puntajeTotal}/21 - Riesgo: ${evaluacion.clasificacionRiesgo}`
        });
        setEvaluacionDialogOpen(false);
        resetEvaluacionForm();
        cargarEvaluaciones();
        cargarDatos();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la evaluación',
        variant: 'destructive'
      });
    }
  };

  // Analizar evaluación con IA
  const analizarConIA = async (evaluacionId: string, participanteId: string) => {
    setAnalizandoIA(evaluacionId);
    
    try {
      const res = await fetch('/api/analisis-evaluacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluacionId, participanteId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setInformeIA(prev => ({ ...prev, [evaluacionId]: data.informe }));
        toast({
          title: '✅ Análisis IA Completado',
          description: 'El informe ha sido generado y guardado'
        });
        // Recargar evaluaciones para obtener las recomendaciones actualizadas
        cargarEvaluaciones();
      } else {
        throw new Error('Error en el análisis');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el análisis con IA',
        variant: 'destructive'
      });
    } finally {
      setAnalizandoIA(null);
    }
  };

  // Eliminar evaluación
  const eliminarEvaluacion = async (id: string) => {
    try {
      const res = await fetch(`/api/evaluaciones/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        toast({
          title: 'Eliminada',
          description: 'Evaluación eliminada correctamente'
        });
        cargarEvaluaciones();
        cargarDatos();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la evaluación',
        variant: 'destructive'
      });
    }
  };

  // Cargar evaluación para editar
  const cargarEvaluacionParaEditar = async (evaluacion: Evaluacion) => {
    setEditandoEvaluacion(evaluacion);
    setEvaluacionForm({
      adultoMayorId: evaluacion.adultoMayorId,
      equilibrioEstaticoIzq: evaluacion.equilibrioEstatico?.toString() || '',
      equilibrioEstaticoDer: evaluacion.equilibrioEstatico?.toString() || '',
      levantarseSentarse: evaluacion.levantarseSentarse?.toString() || '',
      flexionTroncoIzq: evaluacion.flexionTronco?.toString() || '',
      flexionTroncoDer: evaluacion.flexionTronco?.toString() || '',
      flexionesBrazoIzq: evaluacion.flexionesBrazo?.toString() || '',
      flexionesBrazoDer: evaluacion.flexionesBrazo?.toString() || '',
      manosEspaldaIzq: evaluacion.juntarManosEspalda || '',
      manosEspaldaDer: evaluacion.juntarManosEspalda || '',
      levantarseCaminar1: evaluacion.levantarseCaminar?.toString() || '',
      levantarseCaminar2: evaluacion.levantarseCaminar?.toString() || '',
      marcha2Minutos: evaluacion.marcha2Minutos?.toString() || '',
      presionSistolica: evaluacion.presionSistolica?.toString() || '',
      presionDiastolica: evaluacion.presionDiastolica?.toString() || '',
      frecuenciaCardiaca: evaluacion.frecuenciaCardiaca?.toString() || '',
      observaciones: evaluacion.observaciones || '',
      recomendaciones: evaluacion.recomendaciones || ''
    });
    setEvaluacionDialogOpen(true);
  };

  // Actualizar evaluación existente
  const actualizarEvaluacion = async () => {
    if (!editandoEvaluacion) return;
    
    try {
      const datosEnvio = {
        adultoMayorId: evaluacionForm.adultoMayorId,
        equilibrioEstatico: Math.max(
          parseFloat(evaluacionForm.equilibrioEstaticoIzq) || 0,
          parseFloat(evaluacionForm.equilibrioEstaticoDer) || 0
        ) || null,
        levantarseSentarse: parseInt(evaluacionForm.levantarseSentarse) || null,
        flexionTronco: Math.max(
          parseFloat(evaluacionForm.flexionTroncoIzq) || 0,
          parseFloat(evaluacionForm.flexionTroncoDer) || 0
        ) || null,
        flexionesBrazo: Math.max(
          parseInt(evaluacionForm.flexionesBrazoIzq) || 0,
          parseInt(evaluacionForm.flexionesBrazoDer) || 0
        ) || null,
        juntarManosEspalda: (evaluacionForm.manosEspaldaIzq === 'si' || evaluacionForm.manosEspaldaDer === 'si') 
          ? 'si' 
          : (evaluacionForm.manosEspaldaIzq === 'parcial' || evaluacionForm.manosEspaldaDer === 'parcial')
            ? 'parcial' : 'no',
        levantarseCaminar: Math.min(
          parseFloat(evaluacionForm.levantarseCaminar1) || Infinity,
          parseFloat(evaluacionForm.levantarseCaminar2) || Infinity
        ) === Infinity ? null : Math.min(
          parseFloat(evaluacionForm.levantarseCaminar1) || Infinity,
          parseFloat(evaluacionForm.levantarseCaminar2) || Infinity
        ),
        marcha2Minutos: parseInt(evaluacionForm.marcha2Minutos) || null,
        presionSistolica: parseInt(evaluacionForm.presionSistolica) || null,
        presionDiastolica: parseInt(evaluacionForm.presionDiastolica) || null,
        frecuenciaCardiaca: parseInt(evaluacionForm.frecuenciaCardiaca) || null,
        observaciones: evaluacionForm.observaciones,
        recomendaciones: evaluacionForm.recomendaciones
      };
      
      const res = await fetch(`/api/evaluaciones/${editandoEvaluacion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnvio)
      });
      
      if (res.ok) {
        const evaluacion = await res.json();
        toast({
          title: '✅ Evaluación Actualizada',
          description: `Puntaje: ${evaluacion.puntajeTotal}/21 - Riesgo: ${evaluacion.clasificacionRiesgo}`
        });
        setEvaluacionDialogOpen(false);
        setEditandoEvaluacion(null);
        resetEvaluacionForm();
        cargarEvaluaciones();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la evaluación',
        variant: 'destructive'
      });
    }
  };

  // Exportar evaluación a PDF/HTML
  const exportarPDF = async (evaluacion: Evaluacion) => {
    setExportandoPDF(evaluacion.id);
    try {
      const res = await fetch('/api/exportar-evaluacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluacionId: evaluacion.id, formato: 'pdf' })
      });
      
      if (res.ok) {
        const data = await res.json();
        generarPDFDescarga(data.datos, evaluacion);
        toast({ title: '✅ PDF Generado', description: 'El informe ha sido descargado' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo generar el PDF', variant: 'destructive' });
    } finally {
      setExportandoPDF(null);
    }
  };

  // Generar PDF real con jspdf
  const generarPDFDescarga = async (datos: any, evaluacion: Evaluacion) => {
    // Importar jspdf dinámicamente
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Colores
    const turquesa = [0, 198, 215] as [number, number, number];
    const verdeLima = [146, 215, 0] as [number, number, number];
    const grisOscuro = [51, 51, 51] as [number, number, number];
    const grisClaro = [245, 245, 245] as [number, number, number];
    
    // Header con gradiente
    doc.setFillColor(...turquesa);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Vive Plus Pro', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Evaluación Funcional ECOSAFE PIVE 2020', pageWidth / 2, 25, { align: 'center' });
    
    // Datos del participante
    let y = 50;
    doc.setFillColor(...turquesa);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.roundedRect(14, y - 8, pageWidth - 28, 12, 2, 2, 'F');
    doc.text('Datos del Participante', 20, y);
    
    y += 15;
    doc.setTextColor(...grisOscuro);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const participante = datos.participante;
    const evaluacionData = datos.evaluacion;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${participante.nombre}`, 50, y);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Edad:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${participante.edad} años`, 130, y);
    
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Género:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(participante.genero || 'N/A', 45, y);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(evaluacionData.fecha, 130, y);
    
    // Score box
    y += 18;
    doc.setFillColor(...grisClaro);
    doc.roundedRect(50, y, 110, 35, 5, 5, 'F');
    
    doc.setTextColor(...turquesa);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PUNTAJE TOTAL', pageWidth / 2, y + 12, { align: 'center' });
    
    doc.setFontSize(28);
    doc.text(`${evaluacionData.puntajeTotal || 0}/21`, pageWidth / 2, y + 28, { align: 'center' });
    
    // Badge de riesgo
    const riesgo = evaluacionData.clasificacionRiesgo || 'moderado';
    const riesgoColors: Record<string, [number, number, number]> = {
      bajo: [40, 167, 69],
      moderado: [255, 193, 7],
      alto: [253, 126, 20],
      muy_alto: [220, 53, 69]
    };
    const riesgoLabels: Record<string, string> = {
      bajo: 'BAJO',
      moderado: 'MODERADO',
      alto: 'ALTO',
      muy_alto: 'MUY ALTO'
    };
    
    doc.setFillColor(...(riesgoColors[riesgo] || riesgoColors.moderado));
    doc.roundedRect(75, y + 40, 60, 10, 3, 3, 'F');
    doc.setTextColor(riesgo === 'moderado' ? 0 : 255, riesgo === 'moderado' ? 0 : 255, riesgo === 'moderado' ? 0 : 255);
    doc.setFontSize(9);
    doc.text(`RIESGO ${riesgoLabels[riesgo] || 'MODERADO'}`, pageWidth / 2, y + 47, { align: 'center' });
    
    // Pruebas ECOSAFE
    y += 65;
    doc.setFillColor(...turquesa);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.roundedRect(14, y - 8, pageWidth - 28, 12, 2, 2, 'F');
    doc.text('Resultados de las Pruebas ECOSAFE', 20, y);
    
    y += 12;
    const pruebas = [
      ['1. Equilibrio Estático', evaluacionData.pruebas.equilibrioEstatico],
      ['2. Levantarse/Sentarse', evaluacionData.pruebas.levantarseSentarse],
      ['3. Flexión de Tronco', evaluacionData.pruebas.flexionTronco],
      ['4. Flexiones de Brazo', evaluacionData.pruebas.flexionesBrazo],
      ['5. Manos tras Espalda', evaluacionData.pruebas.manosEspalda],
      ['6. Levantarse-Caminar', evaluacionData.pruebas.levantarseCaminar],
      ['7. Marcha 2 Minutos', evaluacionData.pruebas.marcha2Minutos]
    ];
    
    pruebas.forEach(([nombre, d]: [string, any]) => {
      doc.setFillColor(...grisClaro);
      doc.rect(20, y - 4, pageWidth - 40, 10, 'F');
      
      doc.setTextColor(...grisOscuro);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(nombre, 25, y + 2);
      
      doc.setTextColor(...turquesa);
      doc.setFont('helvetica', 'bold');
      const valor = d.valor ? `${d.valor} ${d.unidad}` : 'N/A';
      doc.text(valor, 120, y + 2);
      
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(d.interpretacion || '-', 165, y + 2);
      
      y += 12;
    });
    
    // Signos Vitales
    y += 5;
    doc.setFillColor(...turquesa);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.roundedRect(14, y - 8, pageWidth - 28, 12, 2, 2, 'F');
    doc.text('Signos Vitales', 20, y);
    
    y += 12;
    doc.setFillColor(...grisClaro);
    doc.rect(20, y - 4, 80, 12, 'F');
    doc.rect(110, y - 4, 80, 12, 'F');
    
    doc.setTextColor(...grisOscuro);
    doc.setFontSize(9);
    doc.text('Presión Arterial', 25, y + 2);
    doc.setFont('helvetica', 'bold');
    doc.text(`${evaluacionData.signosVitales.presionSistolica || '-'}/${evaluacionData.signosVitales.presionDiastolica || '-'} mmHg`, 25, y + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Frec. Cardíaca', 115, y + 2);
    doc.setFont('helvetica', 'bold');
    doc.text(`${evaluacionData.signosVitales.frecuenciaCardiaca || '-'} lpm`, 115, y + 8);
    
    // Observaciones y Recomendaciones
    y += 25;
    
    if (evaluacionData.observaciones) {
      doc.setFillColor(...turquesa);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.roundedRect(14, y - 8, pageWidth - 28, 10, 2, 2, 'F');
      doc.text('Observaciones', 20, y);
      
      y += 8;
      doc.setFillColor(...grisClaro);
      doc.rect(14, y - 4, pageWidth - 28, 20, 'F');
      doc.setTextColor(...grisOscuro);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      const obsLines = doc.splitTextToSize(evaluacionData.observaciones, pageWidth - 40);
      doc.text(obsLines.slice(0, 3), 20, y + 3);
      y += 25;
    }
    
    if (evaluacionData.recomendaciones) {
      // Nueva página si es necesario
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFillColor(...verdeLima);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.roundedRect(14, y - 8, pageWidth - 28, 10, 2, 2, 'F');
      doc.text('Recomendaciones IA', 20, y);
      
      y += 8;
      doc.setFillColor(248, 249, 250);
      doc.rect(14, y - 4, pageWidth - 28, 30, 'F');
      doc.setTextColor(...grisOscuro);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      const recLines = doc.splitTextToSize(evaluacionData.recomendaciones, pageWidth - 40);
      doc.text(recLines.slice(0, 5), 20, y + 3);
    }
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Generado por Vive Plus Pro • ECOSAFE PIVE 2020', pageWidth / 2, footerY, { align: 'center' });
    doc.text(new Date().toLocaleDateString('es-PR'), pageWidth / 2, footerY + 5, { align: 'center' });
    
    // Descargar
    doc.save(`Evaluacion_${participante.nombre.replace(/\s+/g, '_')}.pdf`);
  };

  // Exportar como imagen
  const exportarImagen = async (evaluacion: Evaluacion) => {
    setExportandoPDF(evaluacion.id);
    try {
      const res = await fetch('/api/exportar-evaluacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluacionId: evaluacion.id, formato: 'imagen' })
      });
      
      if (res.ok) {
        const data = await res.json();
        generarImagenDescarga(data.datos);
        toast({ title: '✅ Imagen Generada', description: 'La imagen ha sido descargada' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo generar la imagen', variant: 'destructive' });
    } finally {
      setExportandoPDF(null);
    }
  };

  // Generar imagen usando Canvas
  const generarImagenDescarga = (datos: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;
    
    // Fondo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#00C6D7');
    gradient.addColorStop(1, '#92D700');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🩺 Vive Plus Pro', canvas.width / 2, 35);
    ctx.font = '14px Arial';
    ctx.fillText('Evaluación Funcional ECOSAFE PIVE 2020', canvas.width / 2, 60);
    
    // Participante
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('📋 Participante', 30, 120);
    ctx.font = '16px Arial';
    ctx.fillText(`${datos.participante.nombre} • ${datos.participante.edad} años • ${datos.evaluacion.fecha}`, 30, 150);
    
    // Score
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(200, 180, 400, 90);
    ctx.fillStyle = '#00C6D7';
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('PUNTAJE TOTAL', canvas.width / 2, 210);
    ctx.font = 'bold 42px Arial';
    ctx.fillText(`${datos.evaluacion.puntajeTotal || 0}/21`, canvas.width / 2, 260);
    
    // Pruebas
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('💪 Pruebas ECOSAFE', 30, 310);
    
    const pruebas = [
      ['Equilibrio Estático', datos.evaluacion.pruebas.equilibrioEstatico],
      ['Levantarse/Sentarse', datos.evaluacion.pruebas.levantarseSentarse],
      ['Flexión de Tronco', datos.evaluacion.pruebas.flexionTronco],
      ['Flexiones de Brazo', datos.evaluacion.pruebas.flexionesBrazo],
      ['Manos tras Espalda', datos.evaluacion.pruebas.manosEspalda],
      ['Levantarse-Caminar', datos.evaluacion.pruebas.levantarseCaminar],
      ['Marcha 2 Minutos', datos.evaluacion.pruebas.marcha2Minutos]
    ];
    
    let y = 350;
    pruebas.forEach(([nombre, d]: [string, any]) => {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(30, y - 15, 740, 30);
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.fillText(nombre as string, 40, y + 3);
      ctx.fillStyle = '#00C6D7';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`${d.valor || 'N/A'} ${d.unidad}`, 350, y + 3);
      ctx.fillStyle = '#666';
      ctx.fillText(d.interpretacion, 550, y + 3);
      y += 40;
    });
    
    // Signos vitales
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('❤️ Signos Vitales', 30, y + 20);
    ctx.font = '14px Arial';
    ctx.fillText(`PA: ${datos.evaluacion.signosVitales.presionSistolica || '-'}/${datos.evaluacion.signosVitales.presionDiastolica || '-'} mmHg    FC: ${datos.evaluacion.signosVitales.frecuenciaCardiaca || '-'} lpm`, 40, y + 50);
    
    // Footer
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillText('Vive Plus Pro • ECOSAFE PIVE 2020 • ' + new Date().toLocaleDateString('es-PR'), canvas.width / 2, canvas.height - 20);
    
    // Descargar
    const link = document.createElement('a');
    link.download = `Evaluacion_${datos.participante.nombre.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Generar Plan de Ejercicio Personalizado con IA
  const generarPlanEjercicio = async (evaluacion: Evaluacion) => {
    setGenerandoPlan(evaluacion.id);
    try {
      const res = await fetch('/api/generar-plan-ejercicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          evaluacionId: evaluacion.id, 
          participanteId: evaluacion.adultoMayorId,
          duracionSemanas: 4
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPlanGenerado(prev => ({ ...prev, [evaluacion.id]: data.plan }));
        toast({ title: '✅ Plan Generado', description: 'El plan de ejercicio ha sido creado y guardado' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo generar el plan', variant: 'destructive' });
    } finally {
      setGenerandoPlan(null);
    }
  };

  // Generar Predicción de Riesgo de Caídas
  const generarPrediccionCaidas = async (evaluacion: Evaluacion) => {
    setGenerandoPrediccion(evaluacion.id);
    try {
      const res = await fetch('/api/prediccion-caidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participanteId: evaluacion.adultoMayorId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPrediccionGenerada(prev => ({ ...prev, [evaluacion.id]: data }));
        toast({ 
          title: '✅ Análisis Completado', 
          description: `Riesgo de caídas: ${data.nivelRiesgo.toUpperCase()} (${data.scoreRiesgo}%)` 
        });
      } else {
        const error = await res.json();
        toast({ title: 'Info', description: error.mensaje || 'Se necesitan más evaluaciones', variant: 'default' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo generar la predicción', variant: 'destructive' });
    } finally {
      setGenerandoPrediccion(null);
    }
  };

  // Cargar evaluaciones históricas de un participante
  const cargarEvaluacionesParticipante = async (participanteId: string) => {
    try {
      const res = await fetch(`/api/evaluaciones?participanteId=${participanteId}`);
      const data = await res.json();
      setEvaluacionesParticipante(prev => ({ ...prev, [participanteId]: data }));
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
    }
  };

  // Abrir modal de progreso de un participante
  const abrirProgresoParticipante = async (evaluacion: Evaluacion) => {
    setCargandoProgreso(true);
    setProgresoDialogOpen(true);
    
    // Buscar el participante
    const participante = adultosMayores.find(a => a.id === evaluacion.adultoMayorId);
    setParticipanteSeleccionadoProgreso(participante || null);
    
    // Cargar evaluaciones históricas
    try {
      const res = await fetch(`/api/evaluaciones?participanteId=${evaluacion.adultoMayorId}`);
      const data = await res.json();
      const evalsOrdenadas = (Array.isArray(data) ? data : []).sort(
        (a: Evaluacion, b: Evaluacion) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
      setEvaluacionesParticipante(prev => ({ ...prev, [evaluacion.adultoMayorId]: evalsOrdenadas }));
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
    } finally {
      setCargandoProgreso(false);
    }
  };

  // Agregar/quitar evaluación para comparar
  const toggleEvaluacionComparar = (evaluacion: Evaluacion) => {
    setEvaluacionesParaComparar(prev => {
      const existe = prev.find(e => e.id === evaluacion.id);
      if (existe) {
        return prev.filter(e => e.id !== evaluacion.id);
      }
      if (prev.length >= 3) {
        toast({ title: 'Máximo 3 evaluaciones', description: 'Solo puedes comparar hasta 3 evaluaciones', variant: 'default' });
        return prev;
      }
      return [...prev, evaluacion];
    });
  };

  // Abrir modal de comparativa
  const abrirComparativa = () => {
    if (evaluacionesParaComparar.length < 2) {
      toast({ title: 'Selecciona 2 o 3 evaluaciones', description: 'Necesitas al menos 2 evaluaciones para comparar', variant: 'default' });
      return;
    }
    setComparativaDialogOpen(true);
  };

  // Editar adulto mayor
  const editarAdultoMayor = (adulto: AdultoMayor) => {
    setSelectedAdulto(adulto);
    setAdultoDialogOpen(true);
  };

  // Filtro de búsqueda
  const adultosFiltrados = adultosMayores.filter(a => 
    `${a.nombre} ${a.apellido} ${a.direccion}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cargar datos cuando cambie el tab
  useEffect(() => {
    if (activeTab === 'visitas') {
      cargarVisitas();
    } else if (activeTab === 'actividades') {
      cargarActividades();
      cargarNotas();
    } else if (activeTab === 'evaluaciones') {
      cargarEvaluaciones();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F7]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Vive Plus" 
                className="h-10 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Vive Plus Pro
                </h1>
                <p className="text-xs text-gray-500">
                  Metodología SAFE
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {estadisticas && (
                <Badge className="bg-gradient-to-r from-[#92D700] to-[#7BB500] text-gray-900 font-medium">
                  {estadisticas.resumen.adultosActivos} beneficiarios activos
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {mounted && showOfflineBanner && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium animate-pulse">
          🔴 Sin conexión a internet - Los datos se sincronizarán cuando vuelva la conexión
        </div>
      )}
      
      {/* Connection Status Badge - solo renderizar en cliente */}
      {mounted && (
        <div className="fixed bottom-20 right-4 z-40">
          <Badge className={`${isOnline ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Badge>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </TabsTrigger>
            <TabsTrigger value="adultos" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Adultos</span>
            </TabsTrigger>
            <TabsTrigger value="evaluaciones" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Evaluaciones</span>
            </TabsTrigger>
            <TabsTrigger value="programas" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Programas</span>
            </TabsTrigger>
            <TabsTrigger value="visitas" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Visitas</span>
            </TabsTrigger>
            <TabsTrigger value="actividades" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Actividades</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00C6D7] border-t-transparent" />
              </div>
            ) : estadisticas ? (
              <>
                {/* Header del Dashboard - Visible en móvil */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">📊 Dashboard</h2>
                    <p className="text-sm text-gray-500">Resumen general del programa</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-[#00C6D7] to-[#00A8B5] text-white px-3 py-1">
                      {new Date().toLocaleDateString('es-PR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Badge>
                  </div>
                </div>
                
                {/* Tarjetas de resumen - Mejorado para móvil */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-[#00C6D7] to-[#00A8B5] text-white border-0 shadow-lg col-span-1">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Total</p>
                          <p className="text-xl sm:text-2xl font-bold">{estadisticas.resumen.totalAdultos}</p>
                        </div>
                        <Users className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-[#92D700] to-[#7BB500] text-gray-900 border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-80">Activos</p>
                          <p className="text-xl sm:text-2xl font-bold">{estadisticas.resumen.adultosActivos}</p>
                        </div>
                        <Heart className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-[#00C6D7]/80 to-cyan-600 text-white border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Visitas</p>
                          <p className="text-xl sm:text-2xl font-bold">{estadisticas.resumen.totalVisitas}</p>
                        </div>
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-80">Pendientes</p>
                          <p className="text-xl sm:text-2xl font-bold">{estadisticas.resumen.visitasPendientes}</p>
                        </div>
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-[#92D700]/80 to-lime-500 text-gray-900 border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-80">Actividades</p>
                          <p className="text-xl sm:text-2xl font-bold">{estadisticas.resumen.totalActividades}</p>
                        </div>
                        <Activity className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-rose-400 to-pink-500 text-white border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Hoy</p>
                          <p className="text-xl sm:text-2xl font-bold">{estadisticas.resumen.visitasHoy}</p>
                        </div>
                        <Timer className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Google Calendar Connect */}
                <GoogleCalendarConnect />

                {/* Próximas visitas y actividades recientes */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Próximas visitas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#00C6D7]" />
                        Próximas Visitas
                      </CardTitle>
                      <CardDescription>
                        Visitas programadas para los próximos 7 días
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {estadisticas.proximasVisitas.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No hay visitas programadas</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-64">
                          <div className="space-y-3">
                            {estadisticas.proximasVisitas.map((visita) => (
                              <div 
                                key={visita.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-[#00C6D7]/5 hover:bg-[#00C6D7]/10 transition-colors"
                              >
                                <div className="flex-shrink-0 w-12 text-center">
                                  <div className="text-lg font-bold text-[#00C6D7]">
                                    {new Date(visita.fecha).getDate()}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(visita.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">
                                      {visita.adultoMayor?.nombre} {visita.adultoMayor?.apellido}
                                    </p>
                                    {getEstadoBadge(visita.estado)}
                                  </div>
                                  <p className="text-sm text-gray-500 truncate">
                                    <MapPin className="h-3 w-3 inline mr-1" />
                                    {visita.adultoMayor?.direccion}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {getTipoVisitaLabel(visita.tipoVisita)} • {visita.duracion} min
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actividades recientes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                        Actividades Recientes
                      </CardTitle>
                      <CardDescription>
                        Últimas actividades recreativas realizadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {estadisticas.ultimasActividades.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No hay actividades registradas</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-64">
                          <div className="space-y-3">
                            {estadisticas.ultimasActividades.map((actividad) => (
                              <div 
                                key={actividad.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                              >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                                  {getTipoActividadIcon(actividad.tipoActividad)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{actividad.titulo}</p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {actividad.adultoMayor?.nombre} {actividad.adultoMayor?.apellido}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatDate(actividad.fecha)} • {getTipoActividadLabel(actividad.tipoActividad)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Accesos rápidos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Accesos Rápidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button 
                        className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-[#00C6D7] to-[#00A8B5] hover:from-[#00A8B5] hover:to-[#0095A3]"
                        onClick={() => {
                          setSelectedAdulto(null);
                          setAdultoDialogOpen(true);
                        }}
                      >
                        <Users className="h-6 w-6" />
                        <span>Nuevo Adulto</span>
                      </Button>
                      
                      <Button 
                        className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                        onClick={() => setVisitaDialogOpen(true)}
                      >
                        <Calendar className="h-6 w-6" />
                        <span>Programar Visita</span>
                      </Button>
                      
                      <Button 
                        className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={() => setActividadDialogOpen(true)}
                      >
                        <Activity className="h-6 w-6" />
                        <span>Nueva Actividad</span>
                      </Button>
                      
                      <Button 
                        className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        onClick={() => setNotaDialogOpen(true)}
                      >
                        <FileText className="h-6 w-6" />
                        <span>Nueva Nota</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>

          {/* Adultos Mayores */}
          <TabsContent value="adultos" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => {
                  setSelectedAdulto(null);
                  setAdultoDialogOpen(true);
                }} 
                className="bg-gradient-to-r from-[#00C6D7] to-[#00A8B5] hover:from-[#00A8B5] hover:to-[#0095A3]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Participante
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adultosFiltrados.map((adulto) => (
                <Card key={adulto.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-[#00C6D7] to-[#00A8B5]">
                        <AvatarFallback className="text-white font-bold">
                          {adulto.nombre[0]}{adulto.apellido[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">
                            {adulto.nombre} {adulto.apellido}
                          </h3>
                          <Badge variant={adulto.activo ? 'default' : 'secondary'}>
                            {adulto.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {calcularEdad(adulto.fechaNacimiento)} años
                          {adulto.genero && ` • ${adulto.genero === 'masculino' ? 'M' : 'F'}`}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{adulto.direccion}</span>
                        </div>
                        {adulto.telefono && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            <span>{adulto.telefono}</span>
                          </div>
                        )}
                        {adulto.programa && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {adulto.programa.nombre}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {adulto.condicionesSalud && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 line-clamp-2">
                            {adulto.condicionesSalud}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>{adulto._count?.visitas || 0} visitas</span>
                        <span>•</span>
                        <span>{adulto._count?.actividades || 0} actividades</span>
                      </div>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editarAdultoMayor(adulto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar participante?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará a {adulto.nombre} {adulto.apellido} y todos sus registros asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => eliminarAdultoMayor(adulto.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {adultosFiltrados.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No hay participantes</h3>
                <p className="text-gray-500">Comienza agregando tu primer beneficiario</p>
              </div>
            )}
          </TabsContent>

          {/* Evaluaciones */}
          <TabsContent value="evaluaciones" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Evaluaciones Funcionales ECOSAFE PIVE 2020</h2>
              <Button 
                onClick={() => setEvaluacionDialogOpen(true)} 
                className="bg-gradient-to-r from-[#00C6D7] to-[#00A8B5] hover:from-[#00A8B5] hover:to-[#0095A3]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Evaluación
              </Button>
            </div>

            {/* Lista de evaluaciones recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#00C6D7]" />
                  Evaluaciones Realizadas
                </CardTitle>
                <CardDescription>
                  Historial de evaluaciones funcionales
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluaciones.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay evaluaciones registradas</p>
                    <Button 
                      onClick={() => setEvaluacionDialogOpen(true)}
                      variant="outline" 
                      className="mt-4"
                    >
                      Realizar primera evaluación
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Barra de acciones de comparativa */}
                    {evaluacionesParaComparar.length > 0 && (
                      <div className="mb-4 p-3 bg-[#00C6D7]/10 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitCompare className="h-5 w-5 text-[#00C6D7]" />
                          <span className="text-sm font-medium">
                            {evaluacionesParaComparar.length} evaluación(es) seleccionada(s)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEvaluacionesParaComparar([])}
                          >
                            Limpiar
                          </Button>
                          <Button 
                            size="sm"
                            onClick={abrirComparativa}
                            className="bg-[#00C6D7] hover:bg-[#00A8B5]"
                          >
                            Comparar
                          </Button>
                        </div>
                      </div>
                    )}
                    <ScrollArea className="h-[40vh]">
                      <div className="space-y-3">
                        {evaluaciones.map((evaluacion) => {
                          const estaSeleccionada = evaluacionesParaComparar.find(e => e.id === evaluacion.id);
                          return (
                          <div 
                            key={evaluacion.id} 
                            className={`p-4 rounded-lg border transition-colors ${estaSeleccionada ? 'border-[#00C6D7] bg-[#00C6D7]/5' : 'hover:border-[#00C6D7]'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                {/* Checkbox para comparar */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleEvaluacionComparar(evaluacion)}
                                  className={`h-6 w-6 p-0 ${estaSeleccionada ? 'bg-[#00C6D7] border-[#00C6D7]' : ''}`}
                                  title="Seleccionar para comparar"
                                >
                                  {estaSeleccionada && <CheckCircle2 className="h-4 w-4 text-white" />}
                                </Button>
                                <div>
                                  <p className="font-medium">{evaluacion.adultoMayor?.nombre} {evaluacion.adultoMayor?.apellido}</p>
                                  <p className="text-sm text-gray-500">{formatDate(evaluacion.fecha)}</p>
                                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                                    {evaluacion.equilibrioEstatico && <span>Eq: {evaluacion.equilibrioEstatico}s</span>}
                                    {evaluacion.levantarseSentarse && <span>• LS: {evaluacion.levantarseSentarse}</span>}
                                    {evaluacion.marcha2Minutos && <span>• Marcha: {evaluacion.marcha2Minutos}</span>}
                                  </div>
                                </div>
                              </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              {evaluacion.puntajeTotal && (
                                <Badge className="text-lg font-bold">
                                  {evaluacion.puntajeTotal}/21
                                </Badge>
                              )}
                              {evaluacion.clasificacionRiesgo && (
                                <Badge className={`
                                  ${evaluacion.clasificacionRiesgo === 'bajo' ? 'bg-green-100 text-green-800' : ''}
                                  ${evaluacion.clasificacionRiesgo === 'moderado' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${evaluacion.clasificacionRiesgo === 'alto' ? 'bg-orange-100 text-orange-800' : ''}
                                  ${evaluacion.clasificacionRiesgo === 'muy_alto' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                  Riesgo {evaluacion.clasificacionRiesgo.replace('_', ' ')}
                                </Badge>
                              )}
                              {/* Botones de acción */}
                              <div className="flex gap-1 mt-1 flex-wrap justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => exportarPDF(evaluacion)}
                                  disabled={exportandoPDF === evaluacion.id}
                                  className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                                  title="Exportar PDF"
                                >
                                  {exportandoPDF === evaluacion.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => generarPlanEjercicio(evaluacion)}
                                  disabled={generandoPlan === evaluacion.id}
                                  className="h-8 w-8 p-0 text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                  title="Generar Plan de Ejercicio"
                                >
                                  {generandoPlan === evaluacion.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dumbbell className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => generarPrediccionCaidas(evaluacion)}
                                  disabled={generandoPrediccion === evaluacion.id}
                                  className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                  title="Predicción de Caídas"
                                >
                                  {generandoPrediccion === evaluacion.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => exportarImagen(evaluacion)}
                                  disabled={exportandoPDF === evaluacion.id}
                                  className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                                  title="Exportar Imagen"
                                >
                                  <FileImage className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => abrirProgresoParticipante(evaluacion)}
                                  className="h-8 w-8 p-0 text-cyan-500 hover:text-cyan-700 hover:bg-cyan-50"
                                  title="Ver Progreso"
                                >
                                  <TrendingUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => cargarEvaluacionParaEditar(evaluacion)}
                                  className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar evaluación?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción eliminará la evaluación de {evaluacion.adultoMayor?.nombre} {evaluacion.adultoMayor?.apellido}
                                        del {formatDate(evaluacion.fecha)}. No se puede deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={() => eliminarEvaluacion(evaluacion.id)}
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botón Analizar con IA y sección de informe */}
                          <div className="mt-3 pt-3 border-t">
                            {!informeIA[evaluacion.id] && !evaluacion.recomendaciones && (
                              <Button
                                onClick={() => analizarConIA(evaluacion.id, evaluacion.adultoMayorId)}
                                disabled={analizandoIA === evaluacion.id}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                              >
                                {analizandoIA === evaluacion.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analizando con IA...
                                  </>
                                ) : (
                                  <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Analizar con IA
                                  </>
                                )}
                              </Button>
                            )}
                            
                            {(informeIA[evaluacion.id] || evaluacion.recomendaciones) && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                  <Brain className="h-4 w-4" />
                                  Análisis IA Disponible
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                                  {informeIA[evaluacion.id] || evaluacion.recomendaciones}
                                </div>
                              </div>
                            )}
                            
                            {/* Plan de Ejercicio Generado */}
                            {planGenerado[evaluacion.id] && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                                  <Dumbbell className="h-4 w-4" />
                                  Plan de Ejercicio Generado
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-y-auto border border-amber-200">
                                  {planGenerado[evaluacion.id]}
                                </div>
                              </div>
                            )}
                            
                            {/* Predicción de Caídas */}
                            {prediccionGenerada[evaluacion.id] && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-rose-600 font-medium">
                                    <Shield className="h-4 w-4" />
                                    Riesgo de Caídas
                                  </div>
                                  <Badge className={`
                                    ${prediccionGenerada[evaluacion.id].nivelRiesgo === 'bajo' ? 'bg-green-100 text-green-800' : ''}
                                    ${prediccionGenerada[evaluacion.id].nivelRiesgo === 'moderado' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${prediccionGenerada[evaluacion.id].nivelRiesgo === 'alto' ? 'bg-orange-100 text-orange-800' : ''}
                                    ${prediccionGenerada[evaluacion.id].nivelRiesgo === 'muy_alto' ? 'bg-red-100 text-red-800' : ''}
                                  `}>
                                    {prediccionGenerada[evaluacion.id].scoreRiesgo}% - {prediccionGenerada[evaluacion.id].nivelRiesgo?.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="p-3 bg-rose-50 rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto border border-rose-200">
                                  {prediccionGenerada[evaluacion.id].analisis}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        );
                        })}
                    </div>
                  </ScrollArea>
                </>
                )}
              </CardContent>
            </Card>

            {/* Información de las pruebas */}
            <Card>
              <CardHeader>
                <CardTitle>Batería de 7 Pruebas ECOSAFE PIVE 2020</CardTitle>
                <CardDescription>
                  Sistema de evaluación funcional para adultos mayores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { nombre: 'Equilibrio Estático', desc: 'Tiempo en un pie con apoyo', categoria: 'equilibrio' },
                    { nombre: 'Levantarse/Sentarse', desc: 'Repeticiones en 30 segundos', categoria: 'fuerza' },
                    { nombre: 'Flexión de Tronco', desc: 'Flexibilidad de espalda y piernas', categoria: 'flexibilidad' },
                    { nombre: 'Flexiones de Brazo', desc: 'Fuerza de tren superior', categoria: 'fuerza' },
                    { nombre: 'Manos tras Espalda', desc: 'Flexibilidad de hombros', categoria: 'flexibilidad' },
                    { nombre: 'Levantarse-Caminar-Sentarse', desc: 'Agilidad y equilibrio dinámico', categoria: 'agilidad' },
                    { nombre: 'Marcha 2 Minutos', desc: 'Resistencia aeróbica', categoria: 'resistencia' },
                  ].map((prueba, i) => (
                    <div key={i} className="p-4 rounded-lg border hover:border-[#00C6D7] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00C6D7]/10 flex items-center justify-center text-[#00C6D7] font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{prueba.nombre}</h4>
                          <p className="text-sm text-gray-500">{prueba.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 rounded-lg bg-[#92D700]/10 border border-[#92D700]/30">
                  <h4 className="font-medium mb-2">Escala de Clasificación de Riesgo</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="p-2 rounded bg-red-100 text-red-800 text-center">
                      <strong>1-3</strong> Muy Alto
                    </div>
                    <div className="p-2 rounded bg-orange-100 text-orange-800 text-center">
                      <strong>4-6</strong> Alto
                    </div>
                    <div className="p-2 rounded bg-yellow-100 text-yellow-800 text-center">
                      <strong>7-9</strong> Moderado
                    </div>
                    <div className="p-2 rounded bg-green-100 text-green-800 text-center">
                      <strong>10-12</strong> Bajo
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programas */}
          <TabsContent value="programas" className="space-y-6">
            <ProgramasSection />
          </TabsContent>

          {/* Visitas */}
          <TabsContent value="visitas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestión de Visitas</h2>
              <Button 
                onClick={() => setVisitaDialogOpen(true)} 
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Visita
              </Button>
            </div>

            <GoogleCalendarConnect />

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh]">
                  <div className="divide-y">
                    {visitas.map((visita) => (
                      <div 
                        key={visita.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-14 text-center py-1 bg-[#00C6D7]/10 rounded-lg">
                            <div className="text-lg font-bold text-[#00C6D7]">
                              {new Date(visita.fecha).getDate()}
                            </div>
                            <div className="text-xs text-[#00C6D7]/70">
                              {new Date(visita.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {visita.adultoMayor?.nombre} {visita.adultoMayor?.apellido}
                              </h4>
                              {getEstadoBadge(visita.estado)}
                              <Badge variant="outline">
                                {getTipoVisitaLabel(visita.tipoVisita)}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(visita.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {visita.duracion} min
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {visita.adultoMayor?.direccion}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {visita.estado === 'programada' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => actualizarEstadoVisita(visita.id, 'completada')}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => actualizarEstadoVisita(visita.id, 'cancelada')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {visitas.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No hay visitas registradas</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actividades */}
          <TabsContent value="actividades" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Actividades Recreativas</h2>
              <Button 
                onClick={() => setActividadDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Actividad
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {actividades.map((actividad) => (
                <Card key={actividad.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        {getTipoActividadIcon(actividad.tipoActividad)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{actividad.titulo}</h4>
                        <p className="text-sm text-gray-500">
                          {actividad.adultoMayor?.nombre} {actividad.adultoMayor?.apellido}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{formatDate(actividad.fecha)}</span>
                          <span>•</span>
                          <span>{getTipoActividadLabel(actividad.tipoActividad)}</span>
                          {actividad.duracion && (
                            <>
                              <span>•</span>
                              <span>{actividad.duracion} min</span>
                            </>
                          )}
                        </div>
                        {actividad.descripcion && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {actividad.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {actividades.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay actividades registradas</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-gray-500 border-t bg-white">
        <p>Vive Plus Pro © 2024 • Metodología SAFE • ECOSAFE PIVE 2020</p>
      </footer>

      {/* Dialogs */}
      
      {/* Participante Form */}
      <ParticipanteForm
        open={adultoDialogOpen}
        onOpenChange={setAdultoDialogOpen}
        selectedAdulto={selectedAdulto}
        programas={programas}
        onSave={() => {
          cargarDatos();
          setSelectedAdulto(null);
        }}
      />

      {/* Dialog Visita */}
      <Dialog open={visitaDialogOpen} onOpenChange={setVisitaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programar Visita</DialogTitle>
            <DialogDescription>
              Completa la información para programar una nueva visita
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Participante</Label>
              <Select 
                value={visitaForm.adultoMayorId} 
                onValueChange={(v) => setVisitaForm(prev => ({ ...prev, adultoMayorId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar participante" />
                </SelectTrigger>
                <SelectContent>
                  {adultosMayores.filter(a => a.activo).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nombre} {a.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input 
                  type="date" 
                  value={visitaForm.fecha}
                  onChange={(e) => setVisitaForm(prev => ({ ...prev, fecha: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input 
                  type="time" 
                  value={visitaForm.hora}
                  onChange={(e) => setVisitaForm(prev => ({ ...prev, hora: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duración (min)</Label>
                <Input 
                  type="number" 
                  value={visitaForm.duracion}
                  onChange={(e) => setVisitaForm(prev => ({ ...prev, duracion: parseInt(e.target.value) || 60 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Visita</Label>
                <Select 
                  value={visitaForm.tipoVisita} 
                  onValueChange={(v) => setVisitaForm(prev => ({ ...prev, tipoVisita: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rutinaria">Rutinaria</SelectItem>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="recreativa">Recreativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea 
                value={visitaForm.observaciones}
                onChange={(e) => setVisitaForm(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVisitaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={guardarVisita}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              Programar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Actividad */}
      <Dialog open={actividadDialogOpen} onOpenChange={setActividadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Actividad</DialogTitle>
            <DialogDescription>
              Registra una nueva actividad recreativa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Participante</Label>
              <Select 
                value={actividadForm.adultoMayorId} 
                onValueChange={(v) => setActividadForm(prev => ({ ...prev, adultoMayorId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar participante" />
                </SelectTrigger>
                <SelectContent>
                  {adultosMayores.filter(a => a.activo).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nombre} {a.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título de la Actividad</Label>
              <Input 
                value={actividadForm.titulo}
                onChange={(e) => setActividadForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Nombre de la actividad"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input 
                  type="date" 
                  value={actividadForm.fecha}
                  onChange={(e) => setActividadForm(prev => ({ ...prev, fecha: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={actividadForm.tipoActividad} 
                  onValueChange={(v) => setActividadForm(prev => ({ ...prev, tipoActividad: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ejercicio">Ejercicio</SelectItem>
                    <SelectItem value="manualidad">Manualidad</SelectItem>
                    <SelectItem value="lectura">Lectura</SelectItem>
                    <SelectItem value="musica">Música</SelectItem>
                    <SelectItem value="juego">Juego</SelectItem>
                    <SelectItem value="otra">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duración (min)</Label>
              <Input 
                type="number" 
                value={actividadForm.duracion}
                onChange={(e) => setActividadForm(prev => ({ ...prev, duracion: e.target.value }))}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea 
                value={actividadForm.descripcion}
                onChange={(e) => setActividadForm(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Detalles de la actividad..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActividadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={guardarActividad}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nota */}
      <Dialog open={notaDialogOpen} onOpenChange={setNotaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Nota</DialogTitle>
            <DialogDescription>
              Añade una nota de seguimiento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Participante</Label>
              <Select 
                value={notaForm.adultoMayorId} 
                onValueChange={(v) => setNotaForm(prev => ({ ...prev, adultoMayorId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar participante" />
                </SelectTrigger>
                <SelectContent>
                  {adultosMayores.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nombre} {a.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input 
                value={notaForm.titulo}
                onChange={(e) => setNotaForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Asunto de la nota"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={notaForm.tipo} 
                onValueChange={(v) => setNotaForm(prev => ({ ...prev, tipo: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="salud">Salud</SelectItem>
                  <SelectItem value="emocional">Emocional</SelectItem>
                  <SelectItem value="familiar">Familiar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contenido</Label>
              <Textarea 
                value={notaForm.contenido}
                onChange={(e) => setNotaForm(prev => ({ ...prev, contenido: e.target.value }))}
                placeholder="Escribe la nota..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={guardarNota}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Evaluación ECOSAFE Guiada */}
      <Dialog open={evaluacionDialogOpen} onOpenChange={(open) => {
        setEvaluacionDialogOpen(open);
        if (!open) resetEvaluacionForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#00C6D7]" />
                Evaluación Funcional ECOSAFE PIVE 2020
              </div>
              {evaluacionForm.adultoMayorId && (
                <Badge variant="outline" className="text-xs">
                  {adultosMayores.find(a => a.id === evaluacionForm.adultoMayorId)?.nombre} {' '}
                  {adultosMayores.find(a => a.id === evaluacionForm.adultoMayorId)?.apellido}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Sistema de evaluación guiada paso a paso
            </DialogDescription>
          </DialogHeader>
          
          {/* Barra de Progreso */}
          <div className="flex-shrink-0 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progreso</span>
              <span className="font-medium">{calcularProgreso().completados}/{calcularProgreso().total} pasos</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00C6D7] to-[#92D700] transition-all duration-300"
                style={{ width: `${(calcularProgreso().completados / calcularProgreso().total) * 100}%` }}
              />
            </div>
            {/* Mini badges de pruebas */}
            <div className="flex gap-1 flex-wrap">
              {pruebasECOSAFE.map((p, i) => {
                const completado = p.bilateral 
                  ? (evaluacionForm[p.campoIzq as keyof typeof evaluacionForm] && evaluacionForm[p.campoDer as keyof typeof evaluacionForm])
                  : p.dosIntentos
                    ? (evaluacionForm[p.campo1 as keyof typeof evaluacionForm] && evaluacionForm[p.campo2 as keyof typeof evaluacionForm])
                    : !!evaluacionForm[p.campo as keyof typeof evaluacionForm];
                return (
                  <div 
                    key={p.id}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${evaluacionStep === i + 1 ? 'ring-2 ring-[#00C6D7] ring-offset-1' : ''}
                      ${completado ? 'bg-[#92D700] text-gray-900' : 'bg-gray-200 text-gray-500'}
                    `}
                  >
                    {p.id}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contenido Principal con Scroll */}
          <div className="flex-1 overflow-y-auto min-h-0 py-4">
            {/* STEP 0: Selección de Participante */}
            {evaluacionStep === 0 && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#00C6D7]/10 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-[#00C6D7]" />
                  </div>
                  <h3 className="text-lg font-semibold">Selecciona el Participante</h3>
                  <p className="text-sm text-gray-500 mt-1">Elige la persona que será evaluada</p>
                </div>
                
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {adultosMayores.filter(a => a.activo).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setEvaluacionForm(prev => ({ ...prev, adultoMayorId: a.id }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all
                        ${evaluacionForm.adultoMayorId === a.id 
                          ? 'border-[#00C6D7] bg-[#00C6D7]/5' 
                          : 'border-gray-200 hover:border-[#00C6D7]/50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#00C6D7] text-white">
                            {a.nombre[0]}{a.apellido[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{a.nombre} {a.apellido}</p>
                          <p className="text-sm text-gray-500">{calcularEdad(a.fechaNacimiento)} años • {a.genero === 'masculino' ? 'Masculino' : 'Femenino'}</p>
                        </div>
                        {evaluacionForm.adultoMayorId === a.id && (
                          <CheckCircle2 className="h-5 w-5 text-[#00C6D7] ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Signos Vitales */}
                {evaluacionForm.adultoMayorId && (
                  <div className="space-y-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Signos Vitales (opcional)
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">P. Sistólica</Label>
                        <Input 
                          type="number" 
                          value={evaluacionForm.presionSistolica}
                          onChange={(e) => setEvaluacionForm(prev => ({ ...prev, presionSistolica: e.target.value }))}
                          placeholder="120"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">P. Diastólica</Label>
                        <Input 
                          type="number" 
                          value={evaluacionForm.presionDiastolica}
                          onChange={(e) => setEvaluacionForm(prev => ({ ...prev, presionDiastolica: e.target.value }))}
                          placeholder="80"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">F. Cardíaca</Label>
                        <Input 
                          type="number" 
                          value={evaluacionForm.frecuenciaCardiaca}
                          onChange={(e) => setEvaluacionForm(prev => ({ ...prev, frecuenciaCardiaca: e.target.value }))}
                          placeholder="72"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEPS 1-7: Pruebas ECOSAFE */}
            {evaluacionStep >= 1 && evaluacionStep <= 7 && (() => {
              const prueba = pruebasECOSAFE[evaluacionStep - 1];
              if (!prueba) return null;
              
              return (
                <div className="space-y-6">
                  {/* Header de la prueba */}
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#00C6D7] text-white flex items-center justify-center mb-4 text-2xl font-bold">
                      {prueba.id}
                    </div>
                    <h3 className="text-lg font-semibold">{prueba.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">{prueba.descripcion}</p>
                  </div>

                  {/* Badge lateral si es bilateral */}
                  {prueba.bilateral && (
                    <div className="flex justify-center gap-4 mb-4">
                      <Badge 
                        className={`px-4 py-2 text-sm transition-all ${evaluacionLado === 'izquierdo' 
                          ? 'bg-orange-500 text-white scale-110' 
                          : evaluacionForm[prueba.campoIzq as keyof typeof evaluacionForm] 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        ← Lado Izquierdo {evaluacionForm[prueba.campoIzq as keyof typeof evaluacionForm] && '✓'}
                      </Badge>
                      <Badge 
                        className={`px-4 py-2 text-sm transition-all ${evaluacionLado === 'derecho' 
                          ? 'bg-blue-500 text-white scale-110' 
                          : evaluacionForm[prueba.campoDer as keyof typeof evaluacionForm] 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        Lado Derecho → {evaluacionForm[prueba.campoDer as keyof typeof evaluacionForm] && '✓'}
                      </Badge>
                    </div>
                  )}

                  {/* Input de la prueba */}
                  <div className="max-w-md mx-auto space-y-4">
                    {/* Prueba Bilateral */}
                    {prueba.bilateral && evaluacionLado && (
                      <div className="p-6 rounded-xl border-2 border-dashed transition-all"
                        style={{ borderColor: evaluacionLado === 'izquierdo' ? '#f97316' : '#3b82f6' }}
                      >
                        <div className="text-center mb-4">
                          <Badge className={evaluacionLado === 'izquierdo' ? 'bg-orange-500' : 'bg-blue-500'}>
                            Evaluando: Lado {evaluacionLado === 'izquierdo' ? 'Izquierdo' : 'Derecho'}
                          </Badge>
                        </div>
                        
                        {prueba.opciones ? (
                          <div className="grid grid-cols-3 gap-2">
                            {prueba.opciones.map((op: string) => (
                              <button
                                key={op}
                                onClick={() => setEvaluacionForm(prev => ({ 
                                  ...prev, 
                                  [evaluacionLado === 'izquierdo' ? prueba.campoIzq : prueba.campoDer]: op 
                                }))}
                                className={`p-3 rounded-lg border-2 transition-all font-medium
                                  ${evaluacionForm[(evaluacionLado === 'izquierdo' ? prueba.campoIzq : prueba.campoDer) as keyof typeof evaluacionForm] === op 
                                    ? 'border-[#00C6D7] bg-[#00C6D7]/10 text-[#00C6D7]' 
                                    : 'border-gray-200 hover:border-[#00C6D7]/50'
                                  }`}
                              >
                                {op === 'si' ? '✓ Sí' : op === 'parcial' ? '~ Parcial' : '✗ No'}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <Input 
                              type="number"
                              step={prueba.unidad === 'cm' ? '0.1' : undefined}
                              value={evaluacionForm[(evaluacionLado === 'izquierdo' ? prueba.campoIzq : prueba.campoDer) as keyof typeof evaluacionForm]}
                              onChange={(e) => setEvaluacionForm(prev => ({ 
                                ...prev, 
                                [evaluacionLado === 'izquierdo' ? prueba.campoIzq : prueba.campoDer]: e.target.value 
                              }))}
                              className="w-32 text-center text-2xl font-bold"
                              placeholder="0"
                            />
                            <span className="text-lg text-gray-500">{prueba.unidad}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prueba con 2 intentos */}
                    {prueba.dosIntentos && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border-2 border-dashed border-purple-400 bg-purple-50">
                          <Label className="text-sm font-medium text-purple-700">Intento 1</Label>
                          <div className="flex items-center gap-3 mt-2">
                            <Input 
                              type="number"
                              step="0.1"
                              value={evaluacionForm[prueba.campo1 as keyof typeof evaluacionForm]}
                              onChange={(e) => setEvaluacionForm(prev => ({ ...prev, [prueba.campo1]: e.target.value }))}
                              className="w-32 text-center text-xl font-bold"
                              placeholder="0"
                            />
                            <span className="text-gray-500">{prueba.unidad}</span>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border-2 border-dashed border-purple-400 bg-purple-50">
                          <Label className="text-sm font-medium text-purple-700">Intento 2</Label>
                          <div className="flex items-center gap-3 mt-2">
                            <Input 
                              type="number"
                              step="0.1"
                              value={evaluacionForm[prueba.campo2 as keyof typeof evaluacionForm]}
                              onChange={(e) => setEvaluacionForm(prev => ({ ...prev, [prueba.campo2]: e.target.value }))}
                              className="w-32 text-center text-xl font-bold"
                              placeholder="0"
                            />
                            <span className="text-gray-500">{prueba.unidad}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Prueba simple */}
                    {!prueba.bilateral && !prueba.dosIntentos && (
                      <div className="p-6 rounded-xl border-2 border-dashed border-[#00C6D7] bg-[#00C6D7]/5">
                        <div className="flex items-center justify-center gap-3">
                          <Input 
                            type="number"
                            value={evaluacionForm[prueba.campo as keyof typeof evaluacionForm]}
                            onChange={(e) => setEvaluacionForm(prev => ({ ...prev, [prueba.campo]: e.target.value }))}
                            className="w-32 text-center text-2xl font-bold"
                            placeholder="0"
                          />
                          <span className="text-lg text-gray-500">{prueba.unidad}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* STEP 8: Observaciones */}
            {evaluacionStep === 8 && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#92D700] text-gray-900 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">Observaciones Finales</h3>
                  <p className="text-sm text-gray-500 mt-1">Añade notas y recomendaciones</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea 
                      value={evaluacionForm.observaciones}
                      onChange={(e) => setEvaluacionForm(prev => ({ ...prev, observaciones: e.target.value }))}
                      placeholder="Observaciones durante la evaluación..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recomendaciones</Label>
                    <Textarea 
                      value={evaluacionForm.recomendaciones}
                      onChange={(e) => setEvaluacionForm(prev => ({ ...prev, recomendaciones: e.target.value }))}
                      placeholder="Recomendaciones basadas en los resultados..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Resumen de resultados */}
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <h4 className="font-semibold mb-3">Resumen de la Evaluación</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {pruebasECOSAFE.map(p => {
                      const valor = p.bilateral
                        ? `${evaluacionForm[p.campoIzq as keyof typeof evaluacionForm] || '-'}/${evaluacionForm[p.campoDer as keyof typeof evaluacionForm] || '-'}`
                        : p.dosIntentos
                          ? `${evaluacionForm[p.campo1 as keyof typeof evaluacionForm] || '-'}/${evaluacionForm[p.campo2 as keyof typeof evaluacionForm] || '-'}`
                          : evaluacionForm[p.campo as keyof typeof evaluacionForm] || '-';
                      return (
                        <div key={p.id} className="flex justify-between">
                          <span className="text-gray-500">{p.id}. {p.nombre.substring(0, 15)}...</span>
                          <span className="font-medium">{valor} {p.unidad}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer con navegación */}
          <div className="flex-shrink-0 border-t pt-4 flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={anteriorPasoEvaluacion}
              disabled={evaluacionStep === 0}
            >
              ← Anterior
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all
                    ${evaluacionStep === i ? 'bg-[#00C6D7] w-4' : 'bg-gray-300'}
                  `}
                />
              ))}
            </div>
            
            {evaluacionStep < 8 ? (
              <Button 
                onClick={siguientePasoEvaluacion}
                className="bg-gradient-to-r from-[#00C6D7] to-[#00A8B5]"
              >
                Siguiente →
              </Button>
            ) : (
              <Button 
                onClick={guardarEvaluacion}
                className="bg-gradient-to-r from-[#92D700] to-[#7BB500] text-gray-900"
              >
                <Heart className="h-4 w-4 mr-2" />
                Guardar Evaluación
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Asistente IA */}
      <AsistenteIA contexto={activeTab} datos={estadisticas || undefined} />
      
      {/* Modal de Progreso del Participante */}
      <Dialog open={progresoDialogOpen} onOpenChange={setProgresoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00C6D7]" />
              Progreso del Participante
            </DialogTitle>
            <DialogDescription>
              {participanteSeleccionadoProgreso?.nombre} {participanteSeleccionadoProgreso?.apellido} - Evolución de evaluaciones
            </DialogDescription>
          </DialogHeader>
          
          {cargandoProgreso ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00C6D7]" />
            </div>
          ) : (
            <>
              {participanteSeleccionadoProgreso && evaluacionesParticipante[participanteSeleccionadoProgreso.id]?.length > 1 ? (
                <div className="space-y-6">
                  {/* Gráfico de Evolución del Puntaje */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Evolución del Puntaje Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={evaluacionesParticipante[participanteSeleccionadoProgreso.id].map((e: Evaluacion) => ({
                            fecha: formatDate(e.fecha),
                            puntaje: e.puntajeTotal || 0,
                            riesgo: e.clasificacionRiesgo === 'bajo' ? 1 : e.clasificacionRiesgo === 'moderado' ? 2 : e.clasificacionRiesgo === 'alto' ? 3 : 4
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 21]} tick={{ fontSize: 10 }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                              formatter={(value: number) => [`${value}/21`, 'Puntaje']}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="puntaje" 
                              name="Puntaje Total"
                              stroke="#00C6D7" 
                              strokeWidth={3}
                              dot={{ fill: '#00C6D7', strokeWidth: 2, r: 5 }}
                              activeDot={{ r: 8 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Gráfico de Radar - Comparativa de Pruebas */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Perfil Funcional (Última Evaluación)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={() => {
                            const ultima = evaluacionesParticipante[participanteSeleccionadoProgreso.id].slice(-1)[0];
                            return [
                              { prueba: 'Equilibrio', valor: Math.min((ultima.equilibrioEstatico || 0) / 30 * 100, 100) },
                              { prueba: 'Fuerza Piernas', valor: Math.min((ultima.levantarseSentarse || 0) / 15 * 100, 100) },
                              { prueba: 'Flexibilidad', valor: Math.min((ultima.flexionTronco || 0) / 10 * 100 + 50, 100) },
                              { prueba: 'Fuerza Brazos', valor: Math.min((ultima.flexionesBrazo || 0) / 15 * 100, 100) },
                              { prueba: 'Movilidad', valor: Math.max(0, 100 - (ultima.levantarseCaminar || 20) * 3) },
                              { prueba: 'Resistencia', valor: Math.min((ultima.marcha2Minutos || 0) / 150 * 100, 100) }
                            ];
                          }}>
                            <PolarGrid stroke="#e0e0e0" />
                            <PolarAngleAxis dataKey="prueba" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                            <Radar name="Capacidad %" stroke="#92D700" fill="#92D700" fillOpacity={0.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Gráfico de Barras - Comparativa por Prueba */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Comparativa de Pruebas en el Tiempo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={evaluacionesParticipante[participanteSeleccionadoProgreso.id].map((e: Evaluacion) => ({
                            fecha: formatDate(e.fecha),
                            'Eq. Estático': e.equilibrioEstatico || 0,
                            'Lz/Sent': e.levantarseSentarse || 0,
                            'Flex. Tronco': e.flexionTronco || 0,
                            'Flex. Brazo': e.flexionesBrazo || 0,
                            'Marcha': Math.round((e.marcha2Minutos || 0) / 10)
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Bar dataKey="Eq. Estático" fill="#00C6D7" />
                            <Bar dataKey="Lz/Sent" fill="#92D700" />
                            <Bar dataKey="Flex. Tronco" fill="#f59e0b" />
                            <Bar dataKey="Flex. Brazo" fill="#8b5cf6" />
                            <Bar dataKey="Marcha" fill="#ec4899" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Tabla de Historial */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Historial de Evaluaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Fecha</th>
                              <th className="text-center p-2">Puntaje</th>
                              <th className="text-center p-2">Riesgo</th>
                              <th className="text-center p-2">Eq.</th>
                              <th className="text-center p-2">L/S</th>
                              <th className="text-center p-2">Flex.</th>
                              <th className="text-center p-2">Brazo</th>
                              <th className="text-center p-2">L-C</th>
                              <th className="text-center p-2">Marcha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {evaluacionesParticipante[participanteSeleccionadoProgreso.id].map((e: Evaluacion) => (
                              <tr key={e.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{formatDate(e.fecha)}</td>
                                <td className="text-center p-2 font-bold text-[#00C6D7]">{e.puntajeTotal}/21</td>
                                <td className="text-center p-2">
                                  <Badge className={`
                                    ${e.clasificacionRiesgo === 'bajo' ? 'bg-green-100 text-green-800' : ''}
                                    ${e.clasificacionRiesgo === 'moderado' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${e.clasificacionRiesgo === 'alto' ? 'bg-orange-100 text-orange-800' : ''}
                                    ${e.clasificacionRiesgo === 'muy_alto' ? 'bg-red-100 text-red-800' : ''}
                                    text-xs
                                  `}>
                                    {e.clasificacionRiesgo}
                                  </Badge>
                                </td>
                                <td className="text-center p-2">{e.equilibrioEstatico || '-'}</td>
                                <td className="text-center p-2">{e.levantarseSentarse || '-'}</td>
                                <td className="text-center p-2">{e.flexionTronco || '-'}</td>
                                <td className="text-center p-2">{e.flexionesBrazo || '-'}</td>
                                <td className="text-center p-2">{e.levantarseCaminar || '-'}</td>
                                <td className="text-center p-2">{e.marcha2Minutos || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Se necesitan al menos 2 evaluaciones para mostrar el progreso</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de Comparativa de Evaluaciones */}
      <Dialog open={comparativaDialogOpen} onOpenChange={setComparativaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-[#00C6D7]" />
              Comparativa de Evaluaciones
            </DialogTitle>
            <DialogDescription>
              Comparación lado a lado de evaluaciones seleccionadas
            </DialogDescription>
          </DialogHeader>
          
          {evaluacionesParaComparar.length >= 2 && (
            <div className="space-y-6">
              {/* Resumen de Participantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evaluacionesParaComparar.map((e, idx) => (
                  <Card key={e.id} className="relative">
                    <div className="absolute top-2 right-2">
                      <Badge className={idx === 0 ? 'bg-[#00C6D7]' : idx === 1 ? 'bg-[#92D700]' : 'bg-purple-500'}>
                        #{idx + 1}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{e.adultoMayor?.nombre} {e.adultoMayor?.apellido}</CardTitle>
                      <CardDescription>{formatDate(e.fecha)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#00C6D7]">{e.puntajeTotal}/21</div>
                        <Badge className={`
                          mt-2 ${e.clasificacionRiesgo === 'bajo' ? 'bg-green-100 text-green-800' : ''}
                          ${e.clasificacionRiesgo === 'moderado' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${e.clasificacionRiesgo === 'alto' ? 'bg-orange-100 text-orange-800' : ''}
                          ${e.clasificacionRiesgo === 'muy_alto' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          Riesgo {e.clasificacionRiesgo}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Gráfico Comparativo */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Comparativa de Pruebas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { 
                          prueba: 'Equilibrio',
                          [evaluacionesParaComparar[0]?.id]: evaluacionesParaComparar[0]?.equilibrioEstatico || 0,
                          [evaluacionesParaComparar[1]?.id]: evaluacionesParaComparar[1]?.equilibrioEstatico || 0,
                          [evaluacionesParaComparar[2]?.id]: evaluacionesParaComparar[2]?.equilibrioEstatico || 0,
                        },
                        { 
                          prueba: 'Lz/Sent',
                          [evaluacionesParaComparar[0]?.id]: evaluacionesParaComparar[0]?.levantarseSentarse || 0,
                          [evaluacionesParaComparar[1]?.id]: evaluacionesParaComparar[1]?.levantarseSentarse || 0,
                          [evaluacionesParaComparar[2]?.id]: evaluacionesParaComparar[2]?.levantarseSentarse || 0,
                        },
                        { 
                          prueba: 'Flex. Tronco',
                          [evaluacionesParaComparar[0]?.id]: evaluacionesParaComparar[0]?.flexionTronco || 0,
                          [evaluacionesParaComparar[1]?.id]: evaluacionesParaComparar[1]?.flexionTronco || 0,
                          [evaluacionesParaComparar[2]?.id]: evaluacionesParaComparar[2]?.flexionTronco || 0,
                        },
                        { 
                          prueba: 'Flex. Brazo',
                          [evaluacionesParaComparar[0]?.id]: evaluacionesParaComparar[0]?.flexionesBrazo || 0,
                          [evaluacionesParaComparar[1]?.id]: evaluacionesParaComparar[1]?.flexionesBrazo || 0,
                          [evaluacionesParaComparar[2]?.id]: evaluacionesParaComparar[2]?.flexionesBrazo || 0,
                        },
                        { 
                          prueba: 'L-Caminar',
                          [evaluacionesParaComparar[0]?.id]: evaluacionesParaComparar[0]?.levantarseCaminar || 0,
                          [evaluacionesParaComparar[1]?.id]: evaluacionesParaComparar[1]?.levantarseCaminar || 0,
                          [evaluacionesParaComparar[2]?.id]: evaluacionesParaComparar[2]?.levantarseCaminar || 0,
                        },
                        { 
                          prueba: 'Marcha',
                          [evaluacionesParaComparar[0]?.id]: Math.round((evaluacionesParaComparar[0]?.marcha2Minutos || 0) / 10),
                          [evaluacionesParaComparar[1]?.id]: Math.round((evaluacionesParaComparar[1]?.marcha2Minutos || 0) / 10),
                          [evaluacionesParaComparar[2]?.id]: Math.round((evaluacionesParaComparar[2]?.marcha2Minutos || 0) / 10),
                        },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="prueba" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey={evaluacionesParaComparar[0]?.id} name={`Eval 1`} fill="#00C6D7" />
                        <Bar dataKey={evaluacionesParaComparar[1]?.id} name={`Eval 2`} fill="#92D700" />
                        {evaluacionesParaComparar[2] && <Bar dataKey={evaluacionesParaComparar[2]?.id} name={`Eval 3`} fill="#8b5cf6" />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tabla Comparativa Detallada */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Detalle de Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Prueba</th>
                          {evaluacionesParaComparar.map((e, idx) => (
                            <th key={e.id} className="text-center p-2">
                              <Badge className={idx === 0 ? 'bg-[#00C6D7]' : idx === 1 ? 'bg-[#92D700]' : 'bg-purple-500'}>
                                Eval {idx + 1}
                              </Badge>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Equilibrio Estático', key: 'equilibrioEstatico', suffix: 's' },
                          { label: 'Levantarse/Sentarse', key: 'levantarseSentarse', suffix: 'rep' },
                          { label: 'Flexión Tronco', key: 'flexionTronco', suffix: 'cm' },
                          { label: 'Flexiones Brazo', key: 'flexionesBrazo', suffix: 'rep' },
                          { label: 'Manos Espalda', key: 'juntarManosEspalda', suffix: '' },
                          { label: 'Levantarse-Caminar', key: 'levantarseCaminar', suffix: 's' },
                          { label: 'Marcha 2 Min', key: 'marcha2Minutos', suffix: 'pasos' },
                          { label: 'PA Sistólica', key: 'presionSistolica', suffix: 'mmHg' },
                          { label: 'PA Diastólica', key: 'presionDiastolica', suffix: 'mmHg' },
                          { label: 'FC', key: 'frecuenciaCardiaca', suffix: 'lpm' },
                        ].map((prueba) => (
                          <tr key={prueba.key} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{prueba.label}</td>
                            {evaluacionesParaComparar.map((e) => (
                              <td key={e.id} className="text-center p-2">
                                {e[prueba.key as keyof Evaluacion] || '-'} {e[prueba.key as keyof Evaluacion] ? prueba.suffix : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setComparativaDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Toaster */}
      <Toaster />
    </div>
  );
}
