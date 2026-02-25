import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Google Calendar API integration
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY;

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: string;
  htmlLink?: string;
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
  error?: {
    code: number;
    message: string;
  };
}

// GET: Obtener eventos del calendario
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get('calendarId') || 'primary';
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  
  // Verificar configuración
  if (!GOOGLE_API_KEY) {
    return NextResponse.json({
      configured: false,
      message: 'Google Calendar no está configurado.',
      events: []
    });
  }

  try {
    // Construir URL para Google Calendar API
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.append('key', GOOGLE_API_KEY);
    url.searchParams.append('singleEvents', 'true');
    url.searchParams.append('orderBy', 'startTime');
    url.searchParams.append('maxResults', '50');
    
    if (start) {
      url.searchParams.append('timeMin', start);
    } else {
      url.searchParams.append('timeMin', new Date().toISOString());
    }
    
    if (end) {
      url.searchParams.append('timeMax', end);
    } else {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      url.searchParams.append('timeMax', endDate.toISOString());
    }

    const response = await fetch(url.toString());
    const data: GoogleCalendarResponse = await response.json();

    if (!response.ok) {
      console.error('Google Calendar API error:', data.error);
      return NextResponse.json({
        configured: true,
        error: true,
        message: data.error?.message || 'Error al obtener eventos',
        events: []
      });
    }

    const events = (data.items || []).map(event => ({
      id: event.id,
      summary: event.summary || 'Sin título',
      description: event.description || '',
      start: event.start.dateTime || event.start.date || '',
      end: event.end.dateTime || event.end.date || '',
      status: event.status,
      htmlLink: event.htmlLink
    }));

    return NextResponse.json({
      configured: true,
      calendarId,
      events,
      count: events.length
    });

  } catch (error) {
    console.error('Error en calendar API:', error);
    return NextResponse.json({
      configured: true,
      error: true,
      message: 'Error de conexión con Google Calendar',
      events: []
    });
  }
}

// POST: Crear evento en Google Calendar (requiere OAuth2)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { calendarId = 'primary', event } = body;

    // Verificar sesión OAuth2
    const session = await getServerSession();
    
    if (!session?.accessToken) {
      return NextResponse.json({
        success: false,
        message: 'Debes conectar tu cuenta de Google primero.',
        requiresAuth: true
      }, { status: 401 });
    }

    // Crear evento usando el token de acceso OAuth2
    const eventData = {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      reminders: event.reminders || {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Error creating calendar event:', data);
      return NextResponse.json({
        success: false,
        message: data.error?.message || 'Error al crear evento en Google Calendar',
        error: data.error
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Evento creado exitosamente',
      eventId: data.id,
      htmlLink: data.htmlLink,
      event: data
    });

  } catch (error) {
    console.error('Error en calendar API:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al procesar la solicitud'
    }, { status: 500 });
  }
}

// DELETE: Eliminar evento de Google Calendar
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const calendarId = searchParams.get('calendarId') || 'primary';

    if (!eventId) {
      return NextResponse.json({
        success: false,
        message: 'eventId es requerido'
      }, { status: 400 });
    }

    const session = await getServerSession();
    
    if (!session?.accessToken) {
      return NextResponse.json({
        success: false,
        message: 'Debes conectar tu cuenta de Google primero.',
        requiresAuth: true
      }, { status: 401 });
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: false,
        message: data.error?.message || 'Error al eliminar evento'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al procesar la solicitud'
    }, { status: 500 });
  }
}
