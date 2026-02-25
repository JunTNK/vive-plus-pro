'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dumbbell, Scale, Brain, Move, Users, Heart,
  Clock, Calendar, ChevronRight, Target, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Programa {
  id: string;
  nombre: string;
  descripcion: string;
  objetivo: string;
  duracionSemanas: number;
  sesionesPorSemana: number;
  intensidad: string;
  categoria: string;
  actividades: string;
  condicionesAdecuadas: string | null;
  contraindicaciones: string | null;
  _count?: {
    participantes: number;
  };
}

interface PlantillaActividad {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  categoria: string;
  dificultad: string;
  materiales: string | null;
  instrucciones: string | null;
  beneficios: string | null;
  precauciones: string | null;
}

const categoriaIconos: Record<string, React.ReactNode> = {
  fortalecimiento: <Dumbbell className="h-5 w-5" />,
  equilibrio: <Scale className="h-5 w-5" />,
  cognitivo: <Brain className="h-5 w-5" />,
  movilidad: <Move className="h-5 w-5" />,
  recreativo: <Users className="h-5 w-5" />,
};

const categoriaColores: Record<string, string> = {
  fortalecimiento: 'from-orange-400 to-red-500',
  equilibrio: 'from-blue-400 to-indigo-500',
  cognitivo: 'from-purple-400 to-pink-500',
  movilidad: 'from-green-400 to-emerald-500',
  recreativo: 'from-yellow-400 to-amber-500',
};

const intensidadColores: Record<string, string> = {
  baja: 'bg-green-100 text-green-800',
  moderada: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-red-100 text-red-800',
};

export default function ProgramasSection() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaActividad[]>([]);
  const [selectedPrograma, setSelectedPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progRes, plantRes] = await Promise.all([
        fetch('/api/programas'),
        fetch('/api/plantillas-actividades'),
      ]);
      
      const progData = await progRes.json();
      const plantData = await plantRes.json();
      
      setProgramas(progData);
      setPlantillas(plantData);
    } catch (error) {
      console.error('Error al cargar programas:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseJSON = (jsonStr: string | null): string[] => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00C6D7] border-t-transparent" />
      </div>
    );
  }

  if (selectedPrograma) {
    const actividadesPrograma = plantillas.filter(
      (p) => p.categoria === selectedPrograma.categoria
    );
    const actividadesLista = parseJSON(selectedPrograma.actividades);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedPrograma(null)}
            className="gap-2"
          >
            ← Volver
          </Button>
          <div>
            <h2 className="text-xl font-bold">{selectedPrograma.nombre}</h2>
            <p className="text-sm text-gray-500">{selectedPrograma.descripcion}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-[#00C6D7]/10 to-[#00C6D7]/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00C6D7]/20">
                  <Calendar className="h-5 w-5 text-[#00C6D7]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duración</p>
                  <p className="font-bold">
                    {selectedPrograma.duracionSemanas > 0 
                      ? `${selectedPrograma.duracionSemanas} semanas` 
                      : 'Continuo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#92D700]/10 to-[#92D700]/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#92D700]/20">
                  <Clock className="h-5 w-5 text-[#92D700]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sesiones por semana</p>
                  <p className="font-bold">{selectedPrograma.sesionesPorSemana} sesiones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-100 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-200">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Intensidad</p>
                  <Badge className={intensidadColores[selectedPrograma.intensidad]}>
                    {selectedPrograma.intensidad.charAt(0).toUpperCase() + selectedPrograma.intensidad.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#00C6D7]" />
              Objetivo del Programa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{selectedPrograma.objetivo}</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-green-700">
                <Heart className="h-4 w-4" />
                Condiciones Adecuadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {selectedPrograma.condicionesAdecuadas || 'No especificado'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Contraindicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {selectedPrograma.contraindicaciones || 'No especificado'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actividades del Programa</CardTitle>
            <CardDescription>Ejercicios y actividades incluidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {actividadesLista.map((actividad, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#00C6D7] text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm">{actividad}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plantillas de Actividades Disponibles</CardTitle>
            <CardDescription>Actividades preconfiguradas para este programa</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {actividadesPrograma.length > 0 ? (
                  actividadesPrograma.map((plantilla) => (
                    <div
                      key={plantilla.id}
                      className="p-4 rounded-lg border hover:border-[#00C6D7] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{plantilla.nombre}</h4>
                          <p className="text-sm text-gray-500 mt-1">{plantilla.descripcion}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{plantilla.duracionMinutos} min</Badge>
                          <Badge className={
                            plantilla.dificultad === 'facil' 
                              ? 'bg-green-100 text-green-800' 
                              : plantilla.dificultad === 'moderado'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }>
                            {plantilla.dificultad}
                          </Badge>
                        </div>
                      </div>
                      {plantilla.beneficios && (
                        <div className="mt-2 text-xs text-[#92D700]">
                          ✓ {plantilla.beneficios}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No hay plantillas disponibles para esta categoría
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="p-4 rounded-lg bg-[#00C6D7]/10 border border-[#00C6D7]/30">
          <p className="text-sm text-gray-700">
            <strong>{selectedPrograma._count?.participantes || 0}</strong> participante(s) inscrito(s) en este programa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Programas Disponibles</h2>
          <p className="text-sm text-gray-500">Programas preconfigurados para adultos mayores</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programas.map((programa) => (
          <Card
            key={programa.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:border-[#00C6D7]"
            onClick={() => setSelectedPrograma(programa)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className={cn(
                  "p-2 rounded-xl bg-gradient-to-r text-white",
                  categoriaColores[programa.categoria] || 'from-gray-400 to-gray-500'
                )}>
                  {categoriaIconos[programa.categoria] || <Heart className="h-5 w-5" />}
                </div>
                <Badge className={intensidadColores[programa.intensidad]}>
                  {programa.intensidad}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-3">{programa.nombre}</CardTitle>
              <CardDescription className="line-clamp-2">
                {programa.descripcion}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {programa.sesionesPorSemana}/sem
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {programa._count?.participantes || 0} participantes
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="outline" className="capitalize">
                  {programa.categoria}
                </Badge>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actividades Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[#00C6D7]" />
            Banco de Actividades
          </CardTitle>
          <CardDescription>
            Plantillas de actividades listas para usar en sesiones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            <div className="grid sm:grid-cols-2 gap-3">
              {plantillas.slice(0, 8).map((plantilla) => (
                <div
                  key={plantilla.id}
                  className="p-3 rounded-lg border hover:border-[#00C6D7] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{plantilla.nombre}</h4>
                    <Badge variant="outline" className="text-xs">
                      {plantilla.duracionMinutos} min
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{plantilla.descripcion}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
