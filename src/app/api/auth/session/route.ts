import { NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ authenticated: true });
}
