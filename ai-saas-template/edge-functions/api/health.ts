const startTime = Date.now();

export async function GET(req: Request) {
  const uptimeMs = Date.now() - startTime;

  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeMs / 1000)}s`,
    region: (req.headers.get('x-edge-region') || req.headers.get('cf-ray') || 'unknown'),
    version: process.env.APP_VERSION || '0.1.0',
    checks: {
      memory: getMemoryStatus(),
      environment: checkEnvironment(),
    },
  };

  const isHealthy = healthCheck.checks.environment.status === 'ok';

  return new Response(JSON.stringify(healthCheck), {
    status: isHealthy ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': isHealthy ? 'healthy' : 'degraded',
    },
  });
}

function getMemoryStatus() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const mem = process.memoryUsage();
    return {
      status: 'ok' as const,
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    };
  }
  return { status: 'ok' as const, note: 'memory info unavailable in edge runtime' };
}

function checkEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    status: missing.length === 0 ? ('ok' as const) : ('degraded' as const),
    ...(missing.length > 0 && { missingVars: missing }),
  };
}
