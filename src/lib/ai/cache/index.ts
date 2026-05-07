import { AIResponse, CacheEntry } from '../types';

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 3600000; // 1 hour
const MAX_CACHE_SIZE = 500;

function evictExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}

function evictOldest() {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  for (const [key, entry] of cache) {
    if (entry.createdAt < oldestTime) {
      oldestTime = entry.createdAt;
      oldestKey = key;
    }
  }
  if (oldestKey) {
    cache.delete(oldestKey);
  }
}

export function getCache(key: string): AIResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  entry.hits++;
  return entry.response;
}

export function setCache(key: string, response: AIResponse, ttl = DEFAULT_TTL): void {
  // Evict expired entries first
  if (cache.size >= MAX_CACHE_SIZE * 0.8) {
    evictExpired();
  }

  // If still at capacity, evict oldest
  if (cache.size >= MAX_CACHE_SIZE) {
    evictOldest();
  }

  cache.set(key, { key, response, createdAt: Date.now(), expiresAt: Date.now() + ttl, hits: 0 });
}

export function clearCache(): void { cache.clear(); }
export function getCacheSize(): number { return cache.size; }
export function getCacheStats() {
  let totalHits = 0;
  let totalEntries = 0;
  const now = Date.now();
  for (const [, entry] of cache) {
    if (now <= entry.expiresAt) {
      totalEntries++;
      totalHits += entry.hits;
    }
  }
  return { size: cache.size, activeEntries: totalEntries, totalHits };
}
