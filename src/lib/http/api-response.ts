import { NextResponse } from 'next/server';

export function success<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function failure(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ error, ...(details === undefined ? {} : { details }) }, { status });
}
