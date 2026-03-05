import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear programa personalizado para Raquel
  const programa = await prisma.programa.create({
    data: {
      nombre: "Vive+ Activo y Mindful",
      descripcion: "Programa personalizado para Doña Raquel con progresión gradual. Incluye ejercicios de equilibrio, flexibilidad, fuerza suave, respiración y atención dividida.",
      objetivo: "Mejorar equilibrio, flexibilidad, fuerza suave, respiración y atención dividida",
      duracionSemanas: 8,
      sesionesPorSemana: 2,
      intensidad: "suave",
      categoria: "bienestar",
      actividades: [
        "Calentamiento: Respiración de preparación + Rotaciones de muñecas",
        "Flexión de tobillos",
        "Calentamiento de hombros",
        "Estiramiento de tronco lateral + giro de cabeza suave",
        "Balanceo de piernas",
        "Caminata consciente principal",
        "Sentadillas desde silla",
        "Ejercicios de Atención Dividida + Enfriamiento"
      ],
      condicionesAdecuadas: ["Adultos mayores 75+", "Riesgo moderado", "Necesita apoyo"],
      contraindicaciones: ["Dolor agudo", "Mareo severo"],
      activo: true
    }
  });

  console.log("Programa creado:", programa.id);

  // Crear participante Raquel
  const raquel = await prisma.adultoMayor.create({
    data: {
      nombre: "Raquel",
      apellido: "Rivera Ortíz",
      fechaNacimiento: new Date("1946-11-09"),
      genero: "femenino",
      direccion: "Puerto Rico",
      estadoCognitivo: "normal",
      estadoEmocional: "estable",
      nivelIndependencia: "semidependiente",
      requiereAsistencia: "parcial",
      activo: true,
      programaId: programa.id,
      observaciones: "Programa de 60 minutos. Materiales: Silla resistente, libro de colorear en acuarela, pinceles, pinturas, tenis antideslizantes, lista de himnos suaves. Considerando que tiene 78 años, prioriza seguridad y ritmo mediano suave."
    }
  });

  console.log("Participante creada:", raquel.id);

  // Crear actividades del plan de trabajo
  const actividades = [
    {
      titulo: "Calentamiento: Respiración + Rotaciones de muñecas",
      descripcion: "De pie o sentada, pies al ancho de hombros. Inhala por nariz durante 4 segundos, retiene 1 segundo, exhala por boca durante 6 segundos (5-8 ciclos). Luego, manos en regazo, haz círculos lentos con muñecas (5-8 por dirección).",
      duracion: 10,
      tipoActividad: "ejercicio",
      intensidad: "suave",
      orden: 1
    },
    {
      titulo: "Flexión de tobillos",
      descripcion: "Sentada, espalda apoyada. Sube y baja dedos de pies (3-5 repeticiones), rota tobillos en círculos lentos. Alterna pies. Usa apoyo si tiembla. Para si hay calambres.",
      duracion: 5,
      tipoActividad: "ejercicio",
      intensidad: "suave",
      orden: 2
    },
    {
      titulo: "Calentamiento de hombros",
      descripcion: "De pie o sentada con apoyo, estira las manos a los lados a la altura de los hombros, rota hombros hacia adelante y atrás en círculos lentos (3-5 repeticiones por dirección).",
      duracion: 5,
      tipoActividad: "ejercicio",
      intensidad: "suave",
      orden: 3
    },
    {
      titulo: "Estiramiento de tronco lateral + giro de cabeza",
      descripcion: "Sentada con mano en silla, inclínate suave a un lado, mantén 2 segundos (3-5 repeticiones por lado). Luego, gira la cabeza lento a derecha/izquierda (2 segundos, 3-5 repeticiones).",
      duracion: 10,
      tipoActividad: "ejercicio",
      intensidad: "suave",
      orden: 4
    },
    {
      titulo: "Pausa 1: Agua y descanso",
      descripcion: "Descansa sentada, toma agua despacio, y seca sudor con toalla. Estira el cuello suave para relajar.",
      duracion: 2,
      tipoActividad: "otra",
      intensidad: "suave",
      orden: 5
    },
    {
      titulo: "Balanceo de piernas",
      descripcion: "Sentada frente a silla resistente, mano en respaldo para apoyo. Espalda recta, pies en suelo. Balancea una pierna adelante 3-5 veces, luego de lado. Cambia de pierna.",
      duracion: 8,
      tipoActividad: "ejercicio",
      intensidad: "suave",
      orden: 6
    },
    {
      titulo: "Caminata consciente principal",
      descripcion: "Camina en superficie plana a ritmo mediano. Enfócate en respiración (inhala/exhala 4 pasos), sensaciones en pies y entorno. Haz una pausa de 1 minuto a la mitad.",
      duracion: 10,
      tipoActividad: "ejercicio",
      intensidad: "moderada",
      orden: 7
    },
    {
      titulo: "Pausa 2: Agua y descanso",
      descripcion: "Descansa sentada, toma agua, seca sudor. Respira profundo 2-3 veces para relajarse.",
      duracion: 2,
      tipoActividad: "otra",
      intensidad: "suave",
      orden: 8
    },
    {
      titulo: "Sentadillas desde silla",
      descripcion: "Sentada al borde de silla resistente, pies al ancho de hombros. Levántate lento usando manos en rodillas, baja controlado. Haz 5-10 repeticiones.",
      duracion: 5,
      tipoActividad: "ejercicio",
      intensidad: "moderada",
      orden: 9
    },
    {
      titulo: "Ejercicios de Atención Dividida + Enfriamiento",
      descripcion: "Sentada en mesa con materiales. Colorea en acuarela, charlen de colores (¿qué te evoca el azul?), canten 1 himno suave. Termina con respiración profunda (2 ciclos: inhala 4 seg, exhala 6 seg).",
      duracion: 3,
      tipoActividad: "otra",
      intensidad: "suave",
      orden: 10
    }
  ];

  for (const act of actividades) {
    await prisma.actividad.create({
      data: {
        adultoMayorId: raquel.id,
        titulo: act.titulo,
        descripcion: act.descripcion,
        duracion: act.duracion,
        tipoActividad: act.tipoActividad,
        intensidad: act.intensidad,
        fecha: new Date(),
        notas: `Actividad ${act.orden} de 10 del plan de trabajo`
      }
    });
  }

  console.log("Actividades creadas:", actividades.length);

  // Crear una nota con el plan completo
  await prisma.nota.create({
    data: {
      adultoMayorId: raquel.id,
      titulo: "Plan de Trabajo - 27 de septiembre 2025",
      contenido: `Plan de Trabajo para Doña Raquel: "Vive+ Activo y Mindful" *Con Progresión*

Detalles del plan:
- Duración total: 60 minutos.
- Materiales: Silla resistente, libro de colorear en acuarela, pinceles, pinturas, tenis antideslizantes, lista de himnos suaves (ej. "Santo, Santo, Santo").
- Objetivos: Mejorar equilibrio, flexibilidad, fuerza suave, respiración y atención dividida.
- Precauciones: Comienza lento, usa modificaciones si hay fatiga o dolor, mantén silla cerca para apoyo. Considerando que doña Raquel tiene 78 años, prioriza seguridad y ritmo mediano suave.`,
      tipo: "plan_trabajo"
    }
  });

  console.log("Nota creada con el plan completo");
  console.log("\n✅ Doña Raquel Rivera Ortíz añadida exitosamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
