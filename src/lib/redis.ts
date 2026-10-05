import Redis from 'ioredis';

// In-memory fallback map for environments where Redis container is not yet spun up
const inMemoryStore = new Map<string, { value: string; expiresAt?: number }>();

class FallbackRedis {
  async get(key: string): Promise<string | null> {
    const item = inMemoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      inMemoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && duration) {
      expiresAt = Date.now() + duration * 1000;
    }
    inMemoryStore.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const deleted = inMemoryStore.delete(key);
    return deleted ? 1 : 0;
  }

  async decr(key: string): Promise<number> {
    const current = parseInt((await this.get(key)) || '0', 10);
    const next = current - 1;
    await this.set(key, next.toString());
    return next;
  }

  async incr(key: string): Promise<number> {
    const current = parseInt((await this.get(key)) || '0', 10);
    const next = current + 1;
    await this.set(key, next.toString());
    return next;
  }
}

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | FallbackRedis | undefined;
};

let client: Redis | FallbackRedis;

try {
  if (process.env.REDIS_URL) {
    const redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't hang indefinitely if Redis isn't running
      enableReadyCheck: false,
      lazyConnect: true,
    });

    redis.on('error', () => {
      // Gracefully silent in dev fallback
    });

    client = redis;
  } else {
    client = new FallbackRedis();
  }
} catch {
  client = new FallbackRedis();
}

export const redis = globalForRedis.redisClient ?? client;

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redisClient = redis;
}
