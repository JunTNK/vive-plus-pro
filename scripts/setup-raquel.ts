import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Ver todos los programas
  const programas = await prisma.programa.findMany();
  console.log("Programas existentes:");
  programas.forEach(p => console.log(`  - ${p.nombre}`));

  // Buscar a Raquel
  let raquel = await prisma.adultoMayor.findFirst({
    where: { nombre: "Raquel" }
  });

  if (!raquel) {
    // Crear a Raquel
    raquel = await prisma.adultoMayor.create({
      data: {
        nombre: "Raquel",
        apellido: "Rivera Ortíz",
        fechaNacimiento: new Date("1946-11-09"),
        genero: "femenino",
        direccion: "Puerto Rico",
        condicionesSalud: "Adulto mayor de 78 años, requiere supervisión y apoyo parcial",
        observaciones: "Programa Vive+ Activo y Integral Enfocado. Duración: 60 min.",
        activo: true
      }
    });
    console.log("\n✅ Raquel creada:", raquel.id);
  } else {
    console.log("\n✅ Raquel ya existe:", raquel.id);
  }

  // Buscar o crear el programa
  let programa = await prisma.programa.findFirst({
    where: { nombre: "Vive+ Activo y Integral Enfocado" }
  });

  if (!programa) {
    programa = await prisma.programa.create({
      data: {
        nombre: "Vive+ Activo y Integral Enfocado",
        descripcion: "Programa personalizado con progresión gradual para adultos mayores. Incluye ejercicios de equilibrio, flexibilidad, fuerza suave, respiración y atención dividida.",
        objetivo: "Mejorar equilibrio, flexibilidad, fuerza suave, respiración y atención dividida",
        duracionSemanas: 8,
        sesionesPorSemana: 2,
        intensidad: "suave",
        categoria: "bienestar",
        actividades: "Calentamiento, Flexión de tobillos, Calentamiento de hombros, Estiramiento de tronco, Balanceo de piernas, Caminata consciente, Sentadillas desde silla, Enfriamiento",
        condicionesAdecuadas: "Adultos mayores 75+, Riesgo moderado",
        contraindicaciones: "Dolor agudo, Mareo severo",
        activo: true
      }
    });
    console.log("✅ Programa creado:", programa.id);
  } else {
    console.log("✅ Programa ya existe:", programa.id);
  }

  // Asignar programa a Raquel (actualizar)
  await prisma.adultoMayor.update({
    where: { id: raquel.id },
    data: { programaId: programa.id }
  });
  console.log("✅ Programa asignado a Raquel");

  // Crear actividades si no tiene
  const actividadesExistentes = await prisma.actividad.count({
    where: { adultoMayorId: raquel.id }
  });

  if (actividadesExistentes === 0) {
    const actividades = [
      { titulo: "Calentamiento: Respiración + Rotaciones", duracion: 10, tipoActividad: "ejercicio" },
      { titulo: "Flexión de tobillos", duracion: 5, tipoActividad: "ejercicio" },
      { titulo: "Calentamiento de hombros", duracion: 5, tipoActividad: "ejercicio" },
      { titulo: "Estiramiento de tronco lateral", duracion: 10, tipoActividad: "ejercicio" },
      { titulo: "Pausa: Agua y descanso", duracion: 2, tipoActividad: "otra" },
      { titulo: "Balanceo de piernas", duracion: 8, tipoActividad: "ejercicio" },
      { titulo: "Caminata consciente", duracion: 10, tipoActividad: "caminata" },
      { titulo: "Sentadillas desde silla", duracion: 5, tipoActividad: "ejercicio" }
    ];

    for (const act of actividades) {
      await prisma.actividad.create({
        data: {
          adultoMayorId: raquel.id,
          titulo: act.titulo,
          duracion: act.duracion,
          tipoActividad: act.tipoActividad,
          intensidad: "baja",
          fecha: new Date()
        }
      });
    }
    console.log("✅ 8 actividades creadas");
  } else {
    console.log(`✅ Ya tiene ${actividadesExistentes} actividades`);
  }

  // Crear nota si no tiene
  const notasExistentes = await prisma.nota.count({
    where: { adultoMayorId: raquel.id }
  });

  if (notasExistentes === 0) {
    await prisma.nota.create({
      data: {
        adultoMayorId: raquel.id,
        titulo: "Plan de Trabajo - 27 de septiembre 2025",
        contenido: `Plan de Trabajo: "Vive+ Activo y Integral Enfocado"

DETALLES:
- Duración total: 60 minutos
- Materiales: Silla resistente, libro de colorear en acuarela, pinceles, pinturas, tenis antideslizantes
- Objetivos: Mejorar equilibrio, flexibilidad, fuerza suave, respiración y atención dividida

CRONOGRAMA:
1. Calentamiento (10 min)
2. Flexión de tobillos (5 min)
3. Calentamiento de hombros (5 min)
4. Estiramiento de tronco (10 min)
5. Pausa (2 min)
6. Balanceo de piernas (8 min)
7. Caminata consciente (10 min)
8. Sentadillas desde silla (5 min)
9. Enfriamiento (5 min)`,
        tipo: "importante"
      }
    });
    console.log("✅ Nota creada");
  } else {
    console.log(`✅ Ya tiene ${notasExistentes} notas`);
  }

  // Mostrar resumen final
  const raquelFinal = await prisma.adultoMayor.findFirst({
    where: { nombre: "Raquel" },
    include: {
      _count: { select: { visitas: true, actividades: true, notas: true } },
      programa: true
    }
  });

  console.log("\n========================================");
  console.log("RESUMEN FINAL - DOÑA RAQUEL");
  console.log("========================================");
  console.log(`Nombre: ${raquelFinal?.nombre} ${raquelFinal?.apellido}`);
  console.log(`Estado: ${raquelFinal?.activo ? 'Activo' : 'Inactivo'}`);
  console.log(`Actividades registradas: ${raquelFinal?._count.actividades}`);
  console.log(`Notas: ${raquelFinal?._count.notas}`);
  console.log(`Programa asignado: ${raquelFinal?.programa?.nombre || 'Ninguno'}`);
  console.log("========================================");
}

main().catch(console.error).finally(() => prisma.$disconnect());
