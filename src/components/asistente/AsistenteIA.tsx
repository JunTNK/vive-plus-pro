'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, X, Send, Bot, User, Loader2, 
  HeartPulse, Activity, Calendar, Users, Home,
  Lightbulb, Sparkles, Plus, FileText, Edit,
  CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionButton[];
  data?: Record<string, unknown>;
}

interface ActionButton {
  label: string;
  action: string;
  params: Record<string, unknown>;
  icon?: string;
}

interface AsistenteIAProps {
  contexto?: string;
  datos?: Record<string, unknown>;
  onAccion?: (accion: string, params: Record<string, unknown>) => void;
}

interface ContextoConfig {
  titulo: string;
  icono: React.ReactNode;
  color: string;
  sugerencias: string[];
  tips: string[];
}

const CONTEXTOS: Record<string, ContextoConfig> = {
  dashboard: {
    titulo: 'Panel Principal',
    icono: <Home className="h-4 w-4" />,
    color: 'from-[#00C6D7] to-[#00A8B5]',
    sugerencias: [
      'Mostrar participantes',
      'Resumen del sistema',
      'Crear nuevo participante'
    ],
    tips: ['Revisa las visitas programadas para hoy']
  },
  adultos: {
    titulo: 'Gestión de Participantes',
    icono: <Users className="h-4 w-4" />,
    color: 'from-[#00C6D7] to-[#00A8B5]',
    sugerencias: [
      'Crear nuevo participante',
      'Ver lista de participantes',
      'Buscar participante'
    ],
    tips: ['Completa todos los campos para mejores recomendaciones']
  },
  evaluaciones: {
    titulo: 'Evaluaciones ECOSAFE',
    icono: <HeartPulse className="h-4 w-4" />,
    color: 'from-[#00C6D7] to-[#00A8B5]',
    sugerencias: [
      'Nueva evaluación',
      'Valores de referencia',
      'Informe de participante'
    ],
    tips: ['Escala de riesgo: 1-3 Muy Alto, 4-6 Alto, 7-9 Moderado, 10-12 Bajo']
  },
  visitas: {
    titulo: 'Calendario de Visitas',
    icono: <Calendar className="h-4 w-4" />,
    color: 'from-[#92D700] to-[#7BB500]',
    sugerencias: [
      'Ver visitas pendientes',
      'Programar nueva visita',
      'Sincronizar con Google'
    ],
    tips: ['Programa visitas con al menos 24h de anticipación']
  },
  actividades: {
    titulo: 'Actividades Recreativas',
    icono: <Activity className="h-4 w-4" />,
    color: 'from-[#92D700] to-[#7BB500]',
    sugerencias: [
      'Registrar nueva actividad',
      'Ver actividades recientes',
      'Sugerir actividades para memoria'
    ],
    tips: ['Adapta las actividades según las condiciones del participante']
  },
  programas: {
    titulo: 'Programas de Bienestar',
    icono: <Activity className="h-4 w-4" />,
    color: 'from-purple-500 to-pink-500',
    sugerencias: [
      'Ver programas disponibles',
      'Crear nuevo programa',
      'Asignar programa a participante'
    ],
    tips: ['Personaliza los programas según las necesidades de cada participante']
  }
};

// Función para parsear comandos naturales
function parsearComando(mensaje: string): { accion: string; params: Record<string, unknown> } | null {
  const msg = mensaje.toLowerCase();
  
  // Crear participante con datos
  const crearMatch = mensaje.match(/crear\s+(?:participante\s+)?(\w+)\s+(\w+),?\s*(?:fecha\s+)?(\d{4}-\d{2}-\d{2})?,?\s*(femenino|masculino)?,?\s*(?:vive\s+en\s+)?(.+)?/i);
  if (crearMatch) {
    return {
      accion: 'crear_participante',
      params: {
        nombre: crearMatch[1],
        apellido: crearMatch[2],
        fechaNacimiento: crearMatch[3] || new Date().toISOString().split('T')[0],
        genero: crearMatch[4] || null,
        direccion: crearMatch[5] || 'Por definir'
      }
    };
  }
  
  // Asignar programa
  const asignarMatch = mensaje.match(/asignar\s+(?:programa\s+)?["']?([^"']+)["']?\s+(?:a\s+)?(.+)/i);
  if (asignarMatch) {
    return {
      accion: 'asignar_programa_nombre',
      params: {
        programaNombre: asignarMatch[1].trim(),
        participanteNombre: asignarMatch[2].trim()
      }
    };
  }
  
  // Informe de participante
  const informeMatch = mensaje.match(/(?:informe|reporte)\s+(?:de\s+)?(.+)/i);
  if (informeMatch) {
    return {
      accion: 'informe_participante',
      params: { nombre: informeMatch[1].trim() }
    };
  }
  
  // Buscar participante
  const buscarMatch = mensaje.match(/(?:buscar|encontrar|información\s+de)\s+(.+)/i);
  if (buscarMatch && !mensaje.toLowerCase().includes('informe')) {
    return {
      accion: 'buscar_participante',
      params: { nombre: buscarMatch[1].trim() }
    };
  }
  
  return null;
}

export default function AsistenteIA({ contexto = 'dashboard', datos, onAccion }: AsistenteIAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const contextoActual = CONTEXTOS[contexto] || CONTEXTOS.dashboard;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `**${contextoActual.titulo}** 👋\n\nSoy tu asistente inteligente para Vive Plus Pro. Puedo:\n\n• Gestionar participantes\n• Crear actividades y programas\n• Ayudar en evaluaciones\n• Generar informes\n\n${contextoActual.tips[0]}\n\n¿En qué puedo ayudarte?`
      }]);
    }
  }, [contexto, isOpen, messages.length, contextoActual]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const ejecutarAccionDirecta = async (accion: string, params: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/asistente/accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, params, contexto })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.mensaje,
        data: data.data,
        actions: data.actions
      }]);
      
      if (onAccion && data.exito) {
        onAccion(accion, params);
      }
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Error al ejecutar la acción. Por favor intenta de nuevo.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Verificar si es un comando con datos
    const comando = parsearComando(userMessage);
    if (comando) {
      try {
        const response = await fetch('/api/asistente/accion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: comando.accion, params: comando.params, contexto })
        });
        const data = await response.json();
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.mensaje,
          data: data.data,
          actions: data.actions
        }]);
        
        if (onAccion && data.exito) {
          onAccion(comando.accion, comando.params);
        }
      } catch {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '❌ Error al procesar el comando. Intenta reformular tu mensaje.' 
        }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Flujo normal de conversación
    try {
      const response = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: userMessage, 
          contexto,
          datos,
          historial: messages.slice(-5) 
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.respuesta,
        actions: data.actions
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Error de conexión. Por favor intenta de nuevo.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const usarSugerencia = (sugerencia: string) => {
    setInput(sugerencia);
    inputRef.current?.focus();
  };

  const ejecutarAccionRapida = (accion: ActionButton) => {
    ejecutarAccionDirecta(accion.action, accion.params);
  };

  const renderMessage = (msg: Message, i: number) => (
    <div
      key={i}
      className={cn(
        "flex gap-2",
        msg.role === 'user' && "justify-end"
      )}
    >
      {msg.role === 'assistant' && (
        <div className="p-2 rounded-xl bg-[#00C6D7]/10 h-fit shrink-0">
          <Bot className="h-4 w-4 text-[#00C6D7]" />
        </div>
      )}
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            msg.role === 'user'
              ? "bg-gradient-to-r from-[#00C6D7] to-[#00A8B5] text-white"
              : "bg-gray-100 text-gray-800"
          )}
        >
          <div className="whitespace-pre-wrap">{msg.content}</div>
        </div>
        
        {/* Botones de acción */}
        {msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {msg.actions.map((action, j) => (
              <Button
                key={j}
                size="sm"
                variant="outline"
                onClick={() => ejecutarAccionRapida(action)}
                className="h-8 text-xs border-[#00C6D7]/30 hover:border-[#00C6D7] hover:bg-[#00C6D7]/5"
              >
                {action.icon === 'plus' && <Plus className="h-3 w-3 mr-1" />}
                {action.icon === 'file' && <FileText className="h-3 w-3 mr-1" />}
                {action.icon === 'edit' && <Edit className="h-3 w-3 mr-1" />}
                {action.icon === 'check' && <CheckCircle className="h-3 w-3 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      {msg.role === 'user' && (
        <div className="p-2 rounded-xl bg-[#00C6D7]/10 h-fit shrink-0">
          <User className="h-4 w-4 text-[#00C6D7]" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-24 right-4 lg:bottom-8 lg:right-8",
            "h-14 w-14 rounded-full",
            "bg-gradient-to-r from-[#00C6D7] to-[#00A8B5]",
            "hover:from-[#00A8B5] hover:to-[#0095A3]",
            "shadow-lg hover:shadow-xl",
            "transition-all duration-300 hover:scale-110",
            "flex items-center justify-center",
            "z-[100]",
            "animate-pulse"
          )}
          aria-label="Abrir asistente"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Panel del asistente */}
      {isOpen && (
        <div 
          className={cn(
            "fixed flex flex-col",
            "bg-white shadow-2xl",
            "border-2 border-[#00C6D7]/30 rounded-2xl overflow-hidden",
            "inset-x-4 top-4 bottom-4 h-auto",
            "lg:inset-x-auto lg:inset-y-auto",
            "lg:bottom-8 lg:right-8 lg:top-auto lg:left-auto",
            "lg:w-[420px] lg:h-[75vh] lg:max-h-[700px]",
            "z-[100]"
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex-shrink-0 p-4 text-white flex items-center justify-between",
            `bg-gradient-to-r ${contextoActual.color}`
          )}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                {contextoActual.icono}
              </div>
              <div>
                <h3 className="font-bold text-lg">Asistente SAFE</h3>
                <p className="text-xs opacity-90">{contextoActual.titulo}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([])}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Nueva conversación"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Área de mensajes */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
            ref={scrollRef}
          >
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex gap-2">
                <div className="p-2 rounded-xl bg-[#00C6D7]/10">
                  <Bot className="h-4 w-4 text-[#00C6D7]" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Sugerencias */}
          {messages.length <= 1 && (
            <div className="flex-shrink-0 border-t border-gray-100">
              {contextoActual.tips.length > 0 && (
                <div className="px-4 py-2 bg-gradient-to-r from-[#00C6D7]/5 to-[#92D700]/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lightbulb className="h-3 w-3 text-[#92D700]" />
                    <span className="font-medium">Tip:</span>
                    <span className="text-gray-600">{contextoActual.tips[0]}</span>
                  </div>
                </div>
              )}
              
              <div className="px-4 py-2 bg-[#F1F5F7]">
                <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1 font-medium">
                  <Sparkles className="h-3 w-3 text-[#00C6D7]" />
                  Comandos rápidos:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {contextoActual.sugerencias.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => usarSugerencia(s)}
                      className="text-xs px-2.5 py-1.5 rounded-full bg-white border border-[#00C6D7]/30 hover:border-[#00C6D7] hover:bg-[#00C6D7]/5 transition-colors text-gray-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
                placeholder="Escribe tu pregunta o comando..."
                className="flex-1 h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-[#00C6D7] focus:outline-none focus:ring-2 focus:ring-[#00C6D7]/20 transition-all text-sm"
                disabled={isLoading}
              />
              <button
                onClick={enviarMensaje}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-r from-[#00C6D7] to-[#00A8B5]",
                  "hover:from-[#00A8B5] hover:to-[#0095A3]",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Send className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
