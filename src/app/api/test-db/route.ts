import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'DATABASE_URL no configurada',
        env: Object.keys(process.env).filter(k => k.includes('DATABASE'))
      });
    }
    
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });
    
    // Test query
    const result = await client.execute('SELECT name FROM sqlite_master WHERE type="table"');
    
    return NextResponse.json({
      status: 'connected',
      database: databaseUrl.replace(/\/\/[^@]+@/, '//***@'),
      tables: result.rows.map(r => r.name),
      hasAuthToken: !!authToken
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
