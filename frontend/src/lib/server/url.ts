import { NextRequest } from 'next/server';

/**
 * Robust base URL resolver for Next.js API route handlers.
 * Guarantees exactly one protocol prefix and prevents 'http://http://' or 'https://https://'.
 */
export function getBaseUrl(req: NextRequest): string {
  const origin = req.headers.get('origin');
  if (origin && (origin.startsWith('http://') || origin.startsWith('https://'))) {
    // Strip any accidental double-protocol in the origin header
    return origin.replace(/^https?:\/\/(https?:\/\/)+/i, '$1').replace(/\/$/, '');
  }

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  // Remove any protocol if present on host
  const cleanHost = host.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || (cleanHost.includes('localhost') ? 'http' : 'https');

  return `${proto}://${cleanHost}`;
}

/**
 * Sanitize any string URL to ensure no double-protocol prefix exists
 */
export function cleanUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\/(https?:\/\/)+/i, '$1');
}

