'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, Phone, MapPin, Heart, AlertCircle, Pill, 
  Stethoscope, Brain, Users as UsersIcon, FileText,
  Activity, Calendar, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Programa {
  id: string;
  nombre: string;
  categoria: string;
}

interface AdultoMayorForm {
  // Datos personales
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  telefono: string;
  email: string;
  
  // Contacto de emergencia
  contactoEmergencia: string;
  parentescoEmergencia: string;
  telefonoEmergencia: string;
  
  // Información médica
  tipoSangre: string;
  peso: string;
  talla: string;
  condicionesSalud: string;
  medicamentos: string;
  alergias: string;
  cirugias: string;
  usoAyudas: string;
  
  // Salud mental y funcionalidad
  estadoCognitivo: string;
  estadoEmocional: string;
  nivelIndependencia: string;
  requiereAsistencia: string;
  
  // Información social
  viveSolo: string;
  cuidadorPrincipal: string;
  telefonoCuidador: string;
  
  // Seguros
  seguroMedico: string;
  numeroSeguro: string;
  medicoPrimario: string;
  telefonoMedico: string;
  
  // Programa
  programaId: string;
  
  // Observaciones
  observaciones: string;
}

interface ParticipanteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAdulto: AdultoMayorFull | null;
  programas: Programa[];
  onSave: () => void;
}

interface AdultoMayorFull {
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
  observaciones?: string | null;
}

const initialForm: AdultoMayorForm = {
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  genero: '',
  direccion: '',
  telefono: '',
  email: '',
  contactoEmergencia: '',
  parentescoEmergencia: '',
  telefonoEmergencia: '',
  tipoSangre: '',
  peso: '',
  talla: '',
  condicionesSalud: '',
  medicamentos: '',
  alergias: '',
  cirugias: '',
  usoAyudas: '',
  estadoCognitivo: '',
  estadoEmocional: '',
  nivelIndependencia: '',
  requiereAsistencia: '',
  viveSolo: '',
  cuidadorPrincipal: '',
  telefonoCuidador: '',
  seguroMedico: '',
  numeroSeguro: '',
  medicoPrimario: '',
  telefonoMedico: '',
  programaId: '',
  observaciones: '',
};

export default function ParticipanteForm({ 
  open, 
  onOpenChange, 
  selectedAdulto, 
  programas,
  onSave 
}: ParticipanteFormProps) {
  const [form, setForm] = useState<AdultoMayorForm>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedAdulto) {
      setForm({
        nombre: selectedAdulto.nombre || '',
        apellido: selectedAdulto.apellido || '',
        fechaNacimiento: selectedAdulto.fechaNacimiento 
          ? new Date(selectedAdulto.fechaNacimiento).toISOString().split('T')[0] 
          : '',
        genero: selectedAdulto.genero || '',
        direccion: selectedAdulto.direccion || '',
        telefono: selectedAdulto.telefono || '',
        email: selectedAdulto.email || '',
        contactoEmergencia: selectedAdulto.contactoEmergencia || '',
        parentescoEmergencia: selectedAdulto.parentescoEmergencia || '',
        telefonoEmergencia: selectedAdulto.telefonoEmergencia || '',
        tipoSangre: selectedAdulto.tipoSangre || '',
        peso: selectedAdulto.peso?.toString() || '',
        talla: selectedAdulto.talla?.toString() || '',
        condicionesSalud: selectedAdulto.condicionesSalud || '',
        medicamentos: selectedAdulto.medicamentos || '',
        alergias: selectedAdulto.alergias || '',
        cirugias: selectedAdulto.cirugias || '',
        usoAyudas: selectedAdulto.usoAyudas || '',
        estadoCognitivo: selectedAdulto.estadoCognitivo || '',
        estadoEmocional: selectedAdulto.estadoEmocional || '',
        nivelIndependencia: selectedAdulto.nivelIndependencia || '',
        requiereAsistencia: selectedAdulto.requiereAsistencia || '',
        viveSolo: selectedAdulto.viveSolo === true ? 'si' : selectedAdulto.viveSolo === false ? 'no' : '',
        cuidadorPrincipal: selectedAdulto.cuidadorPrincipal || '',
        telefonoCuidador: selectedAdulto.telefonoCuidador || '',
        seguroMedico: selectedAdulto.seguroMedico || '',
        numeroSeguro: selectedAdulto.numeroSeguro || '',
        medicoPrimario: selectedAdulto.medicoPrimario || '',
        telefonoMedico: selectedAdulto.telefonoMedico || '',
        programaId: selectedAdulto.programaId || '',
        observaciones: selectedAdulto.observaciones || '',
      });
    } else {
      setForm(initialForm);
    }
  }, [selectedAdulto]);

  const handleSave = async () => {
    if (!form.nombre || !form.apellido || !form.fechaNacimiento || !form.direccion) {
      alert('Por favor complete los campos obligatorios: Nombre, Apellido, Fecha de Nacimiento y Dirección');
      return;
    }

    setIsSaving(true);
    try {
      const method = selectedAdulto ? 'PUT' : 'POST';
      const url = selectedAdulto 
        ? `/api/adultos-mayores/${selectedAdulto.id}`
        : '/api/adultos-mayores';

      const body = {
        ...form,
        peso: form.peso ? parseFloat(form.peso) : null,
        talla: form.talla ? parseFloat(form.talla) : null,
        viveSolo: form.viveSolo === 'si' ? true : form.viveSolo === 'no' ? false : null,
        programaId: form.programaId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onOpenChange(false);
        setForm(initialForm);
        onSave();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const updateForm = (field: keyof AdultoMayorForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#00C6D7]" />
            {selectedAdulto ? 'Editar Participante' : 'Nuevo Participante'}
          </DialogTitle>
          <DialogDescription>
            Complete la información del adulto mayor. Los campos con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personales" className="mt-4">
          <TabsList className="grid grid-cols-5 gap-1 h-auto">
            <TabsTrigger value="personales" className="text-xs py-2">
              <User className="h-3 w-3 mr-1" />
              Personales
            </TabsTrigger>
            <TabsTrigger value="medica" className="text-xs py-2">
              <Heart className="h-3 w-3 mr-1" />
              Médica
            </TabsTrigger>
            <TabsTrigger value="funcional" className="text-xs py-2">
              <Activity className="h-3 w-3 mr-1" />
              Funcional
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs py-2">
              <UsersIcon className="h-3 w-3 mr-1" />
              Social
            </TabsTrigger>
            <TabsTrigger value="programa" className="text-xs py-2">
              <Calendar className="h-3 w-3 mr-1" />
              Programa
            </TabsTrigger>
          </TabsList>

          {/* TAB: Datos Personales */}
          <TabsContent value="personales" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Nombre *
                </Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => updateForm('nombre', e.target.value)}
                  placeholder="Nombre del participante"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido" className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Apellido *
                </Label>
                <Input
                  id="apellido"
                  value={form.apellido}
                  onChange={(e) => updateForm('apellido', e.target.value)}
                  placeholder="Apellido del participante"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Fecha de Nacimiento *
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => updateForm('fechaNacimiento', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select value={form.genero} onValueChange={(v) => updateForm('genero', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Dirección *
                </Label>
                <Input
                  id="direccion"
                  value={form.direccion}
                  onChange={(e) => updateForm('direccion', e.target.value)}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={form.telefono}
                  onChange={(e) => updateForm('telefono', e.target.value)}
                  placeholder="787-123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <Card className="mt-4 border-[#00C6D7]/30 bg-[#00C6D7]/5">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#00C6D7]" />
                  Contacto de Emergencia
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre completo</Label>
                    <Input
                      value={form.contactoEmergencia}
                      onChange={(e) => updateForm('contactoEmergencia', e.target.value)}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parentesco</Label>
                    <Select value={form.parentescoEmergencia} onValueChange={(v) => updateForm('parentescoEmergencia', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hijo">Hijo/a</SelectItem>
                        <SelectItem value="esposo">Esposo/a</SelectItem>
                        <SelectItem value="hermano">Hermano/a</SelectItem>
                        <SelectItem value="nieto">Nieto/a</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono
                    </Label>
                    <Input
                      value={form.telefonoEmergencia}
                      onChange={(e) => updateForm('telefonoEmergencia', e.target.value)}
                      placeholder="787-123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Información Médica */}
          <TabsContent value="medica" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoSangre" className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" /> Tipo de Sangre
                </Label>
                <Select value={form.tipoSangre} onValueChange={(v) => updateForm('tipoSangre', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  value={form.peso}
                  onChange={(e) => updateForm('peso', e.target.value)}
                  placeholder="70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="talla">Talla (cm)</Label>
                <Input
                  id="talla"
                  type="number"
                  step="0.1"
                  value={form.talla}
                  onChange={(e) => updateForm('talla', e.target.value)}
                  placeholder="165"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-500" /> Condiciones de Salud
              </Label>
              <Textarea
                value={form.condicionesSalud}
                onChange={(e) => updateForm('condicionesSalud', e.target.value)}
                placeholder="Diabetes, hipertensión, artritis, cardiopatía, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Pill className="h-3 w-3 text-blue-500" /> Medicamentos Actuales
              </Label>
              <Textarea
                value={form.medicamentos}
                onChange={(e) => updateForm('medicamentos', e.target.value)}
                placeholder="Medicamentos que toma regularmente"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Alergias</Label>
                <Textarea
                  value={form.alergias}
                  onChange={(e) => updateForm('alergias', e.target.value)}
                  placeholder="Alergias conocidas"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Cirugías Previas</Label>
                <Textarea
                  value={form.cirugias}
                  onChange={(e) => updateForm('cirugias', e.target.value)}
                  placeholder="Cirugías importantes"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-purple-500" /> Uso de Ayudas para Movilidad
              </Label>
              <Select value={form.usoAyudas} onValueChange={(v) => updateForm('usoAyudas', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Ninguna</SelectItem>
                  <SelectItem value="baston">Bastón</SelectItem>
                  <SelectItem value="andador">Andador</SelectItem>
                  <SelectItem value="silla">Silla de ruedas</SelectItem>
                  <SelectItem value="otro">Otra ayuda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* TAB: Estado Funcional */}
          <TabsContent value="funcional" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Brain className="h-3 w-3 text-purple-500" /> Estado Cognitivo
                </Label>
                <Select value={form.estadoCognitivo} onValueChange={(v) => updateForm('estadoCognitivo', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="deterioro_leve">Deterioro Leve</SelectItem>
                    <SelectItem value="deterioro_moderado">Deterioro Moderado</SelectItem>
                    <SelectItem value="deterioro_severo">Deterioro Severo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-pink-500" /> Estado Emocional
                </Label>
                <Select value={form.estadoEmocional} onValueChange={(v) => updateForm('estadoEmocional', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estable">Estable</SelectItem>
                    <SelectItem value="ansioso">Ansioso</SelectItem>
                    <SelectItem value="deprimido">Deprimido</SelectItem>
                    <SelectItem value="aislado">Aislado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-green-500" /> Nivel de Independencia
                </Label>
                <Select value={form.nivelIndependencia} onValueChange={(v) => updateForm('nivelIndependencia', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independiente">Independiente</SelectItem>
                    <SelectItem value="semidependiente">Semi-dependiente</SelectItem>
                    <SelectItem value="dependiente">Dependiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Requiere Asistencia</Label>
                <Select value={form.requiereAsistencia} onValueChange={(v) => updateForm('requiereAsistencia', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguna">Ninguna</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="total">Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* TAB: Información Social */}
          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>¿Vive solo/a?</Label>
              <Select value={form.viveSolo} onValueChange={(v) => updateForm('viveSolo', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="si">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border-[#92D700]/30 bg-[#92D700]/5">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-[#92D700]" />
                  Cuidador Principal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del cuidador</Label>
                    <Input
                      value={form.cuidadorPrincipal}
                      onChange={(e) => updateForm('cuidadorPrincipal', e.target.value)}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono
                    </Label>
                    <Input
                      value={form.telefonoCuidador}
                      onChange={(e) => updateForm('telefonoCuidador', e.target.value)}
                      placeholder="787-123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Información de Seguro Médico
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Seguro Médico</Label>
                    <Input
                      value={form.seguroMedico}
                      onChange={(e) => updateForm('seguroMedico', e.target.value)}
                      placeholder="Medicare, MMM, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Seguro</Label>
                    <Input
                      value={form.numeroSeguro}
                      onChange={(e) => updateForm('numeroSeguro', e.target.value)}
                      placeholder="Número de identificación"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" /> Médico Primario
                    </Label>
                    <Input
                      value={form.medicoPrimario}
                      onChange={(e) => updateForm('medicoPrimario', e.target.value)}
                      placeholder="Dr./Dra. Nombre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono del Médico
                    </Label>
                    <Input
                      value={form.telefonoMedico}
                      onChange={(e) => updateForm('telefonoMedico', e.target.value)}
                      placeholder="787-123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Programa y Observaciones */}
          <TabsContent value="programa" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-[#00C6D7]" /> Asignar a Programa
              </Label>
              <Select value={form.programaId} onValueChange={(v) => updateForm('programaId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin programa asignado</SelectItem>
                  {programas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.programaId && (
              <div className="p-3 rounded-lg bg-[#00C6D7]/10 border border-[#00C6D7]/30">
                <p className="text-sm text-gray-600">
                  El participante será inscrito en el programa seleccionado. Las actividades del programa estarán disponibles en la sección de Actividades.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <FileText className="h-3 w-3" /> Observaciones Generales
              </Label>
              <Textarea
                value={form.observaciones}
                onChange={(e) => updateForm('observaciones', e.target.value)}
                placeholder="Notas adicionales sobre el participante..."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "bg-gradient-to-r from-[#00C6D7] to-[#00A8B5]",
              "hover:from-[#00A8B5] hover:to-[#0095A3]"
            )}
          >
            {isSaving ? 'Guardando...' : selectedAdulto ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
