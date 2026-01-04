import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection and basic operations
    const healthCheck = await dbService.healthCheck();

    const response = {
      ...healthCheck,
      service: 'database',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        service: 'database',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
