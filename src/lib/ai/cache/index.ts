import { AIResponse, CacheEntry } from '../types';

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 3600000; // 1 hour

export function getCache(key: string): AIResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  entry.hits++;
  return entry.response;
}

export function setCache(key: string, response: AIResponse, ttl = DEFAULT_TTL): void {
  cache.set(key, { key, response, createdAt: Date.now(), expiresAt: Date.now() + ttl, hits: 0 });
}

export function clearCache(): void { cache.clear(); }
export function getCacheSize(): number { return cache.size; }
