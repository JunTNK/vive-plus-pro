'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleCalendarStatus {
  configured: boolean;
  connected: boolean;
  email?: string;
  error?: string;
}

export default function GoogleCalendarConnect() {
  const [status, setStatus] = useState<GoogleCalendarStatus>({
    configured: false,
    connected: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/calendar/status');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking calendar status:', error);
      setStatus({ configured: false, connected: false, error: 'Error de conexión' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    // Redirigir a Google OAuth
    window.location.href = '/api/auth/signin/google?callbackUrl=/';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[#00C6D7]" />
          <span className="ml-2 text-sm text-gray-500">Verificando Google Calendar...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Google Calendar</CardTitle>
              <CardDescription className="text-xs">
                Sincroniza visitas con tu calendario
              </CardDescription>
            </div>
          </div>
          {status.connected ? (
            <Badge className="bg-[#92D700] text-gray-900 hover:bg-[#7BB500]">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              <XCircle className="h-3 w-3 mr-1" />
              No conectado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {status.connected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-[#92D700]" />
              <span>Sincronizado como: <strong>{status.email || 'Google Account'}</strong></span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkStatus}
                className="flex-1"
              >
                Actualizar estado
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <a 
                  href="https://calendar.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver calendario
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {status.error && (
              <p className="text-sm text-red-500">{status.error}</p>
            )}
            {!status.configured ? (
              <p className="text-sm text-amber-600">
                ⚠️ Falta configurar GOOGLE_CLIENT_SECRET en el servidor
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Conecta tu cuenta de Google para sincronizar las visitas automáticamente.
              </p>
            )}
            <Button 
              onClick={handleConnect}
              disabled={!status.configured || isConnecting}
              className={cn(
                "w-full bg-gradient-to-r from-blue-500 to-cyan-500",
                "hover:from-blue-600 hover:to-cyan-600",
                "disabled:opacity-50"
              )}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Conectar con Google
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
