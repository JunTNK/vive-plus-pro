// Google Calendar Integration for Vive Plus Pro
// API Key: Solo permite lectura de calendarios públicos
// Para escritura se requiere OAuth2

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  status?: string;
  htmlLink?: string;
}

export interface GoogleCalendarConfig {
  apiKey?: string;
  calendarId?: string;
}

// Obtener configuración desde variables de entorno
export function getGoogleCalendarConfig(): GoogleCalendarConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY,
    calendarId: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || 'primary',
  };
}

// Verificar si la integración está configurada
export function isGoogleCalendarConfigured(): boolean {
  const config = getGoogleCalendarConfig();
  return !!config.apiKey;
}

// Formatear fecha para Google Calendar API (ISO string)
export function formatDateTimeForCalendar(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate.toISOString();
}

// Obtener eventos del calendario
export async function getCalendarEvents(
  startDate?: Date,
  endDate?: Date
): Promise<{ events: CalendarEvent[]; error?: string }> {
  const config = getGoogleCalendarConfig();
  
  if (!config.apiKey) {
    return { 
      events: [], 
      error: 'Google Calendar no está configurado' 
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('calendarId', config.calendarId || 'primary');
    
    if (startDate) {
      params.append('start', startDate.toISOString());
    }
    if (endDate) {
      params.append('end', endDate.toISOString());
    }

    const response = await fetch(`/api/calendar/events?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      return { events: [], error: data.message };
    }

    return { events: data.events || [] };

  } catch (error) {
    console.error('Error obteniendo eventos de calendarios:', error);
    return { events: [], error: 'Error de conexión' };
  }
}

// Obtener eventos de hoy
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const { events } = await getCalendarEvents(today, tomorrow);
  return events;
}

// Obtener eventos de la semana
export async function getWeekEvents(): Promise<CalendarEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const { events } = await getCalendarEvents(today, nextWeek);
  return events;
}

// Formatear evento para mostrar
export function formatEventTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatEventDate(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

// Nota: Para crear/actualizar/eliminar eventos se requiere OAuth2
// La API Key solo permite lectura de calendarios públicos
// Para implementar escritura:
// 1. Crear proyecto en Google Cloud Console
// 2. Habilitar Google Calendar API
// 3. Configurar OAuth2 consent screen
// 4. Implementar flujo de autenticación
