import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando configuraciones iniciales...');

  const configuracionesIniciales = [
    {
      clave: 'GOOGLE_CLIENT_ID',
      valor: '688355758410-hfmcpp5b7uind2cv7okvbttrbeppqo90.apps.googleusercontent.com',
      descripcion: 'ID de cliente de Google OAuth para integración con Google Calendar',
      categoria: 'google',
      esSecreto: false
    },
    {
      clave: 'GOOGLE_CLIENT_SECRET',
      valor: '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',
      descripcion: 'Secreto de cliente de Google OAuth',
      categoria: 'google',
      esSecreto: true
    },
    {
      clave: 'GOOGLE_REDIRECT_URI',
      valor: 'https://vivepluspro.vercel.app/api/calendar/callback',
      descripcion: 'URL de redirección para OAuth de Google',
      categoria: 'google',
      esSecreto: false
    },
    {
      clave: 'DATABASE_URL',
      valor: 'file:./dev.db',
      descripcion: 'URL de conexión a la base de datos SQLite',
      categoria: 'database',
      esSecreto: false
    },
    {
      clave: 'NEXTAUTH_SECRET',
      valor: 'vive-plus-pro-secret-key-2024',
      descripcion: 'Clave secreta para NextAuth.js',
      categoria: 'auth',
      esSecreto: true
    },
    {
      clave: 'NEXTAUTH_URL',
      valor: 'https://vivepluspro.vercel.app',
      descripcion: 'URL base para NextAuth.js',
      categoria: 'auth',
      esSecreto: false
    }
  ];

  for (const config of configuracionesIniciales) {
    const existente = await prisma.configuracion.findUnique({
      where: { clave: config.clave }
    });

    if (!existente) {
      await prisma.configuracion.create({
        data: config
      });
      console.log(`✅ Creada: ${config.clave}`);
    } else {
      console.log(`⏭️  Ya existe: ${config.clave}`);
    }
  }

  console.log('✨ Configuraciones iniciales completadas');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
