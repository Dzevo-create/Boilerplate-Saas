/**
 * Health Check API Route
 * 
 * Returns the health status of the application.
 * Useful for monitoring and load balancer health checks.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
}

