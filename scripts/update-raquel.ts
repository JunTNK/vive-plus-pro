import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Ver todos los programas
  const programas = await prisma.programa.findMany();
  console.log("Programas encontrados:", programas.length);
  
  // Buscar el programa de Raquel
  const programaRaquel = programas.find(p => p.nombre.includes("Vive+") || p.nombre.includes("Mindful"));
  if (programaRaquel) {
    console.log("Programa encontrado:", programaRaquel.nombre);
    
    // Actualizar el nombre
    await prisma.programa.update({
      where: { id: programaRaquel.id },
      data: { nombre: "Vive+ Activo y Integral Enfocado" }
    });
    console.log("✅ Programa actualizado a: Vive+ Activo y Integral Enfocado");
  }

  // Verificar datos de Raquel
  const raquel = await prisma.adultoMayor.findFirst({
    where: { nombre: "Raquel" },
    include: {
      _count: { select: { visitas: true, actividades: true, notas: true } }
    }
  });

  if (raquel) {
    console.log("\n=== DOÑA RAQUEL ===");
    console.log(`Nombre: ${raquel.nombre} ${raquel.apellido}`);
    console.log(`Fecha Nacimiento: ${raquel.fechaNacimiento}`);
    console.log(`Estado: ${raquel.activo ? 'Activo' : 'Inactivo'}`);
    console.log(`Actividades: ${raquel._count.actividades}`);
    console.log(`Notas: ${raquel._count.notas}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
