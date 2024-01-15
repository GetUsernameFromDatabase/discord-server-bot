/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MemoryCache,
  MemoryConfig,
  MemoryStore,
  createCache,
  memoryStore,
} from 'cache-manager';

/**
 * Initializes cache wrapper with {@link memoryStore}
 */
export function makeMemoryStoreCacheWrapper(config?: MemoryConfig) {
  return new CacheWrapper(memoryStore(), config);
}

/** Wrapper for cache-manager -- mostly for autocomplete */
export class CacheWrapper<TypeMap extends Record<string, any>> {
  cache: MemoryCache;
  constructor(store: MemoryStore, config?: MemoryConfig) {
    this.cache = createCache(store, config);
  }

  get<KEY extends keyof TypeMap & string>(key: KEY) {
    return this.cache.get<TypeMap[KEY]>(key);
  }

  set<KEY extends keyof TypeMap & string>(
    key: KEY,
    value: TypeMap[KEY],
    ttl?: number
  ) {
    return this.cache.set(key, value, ttl);
  }
}
