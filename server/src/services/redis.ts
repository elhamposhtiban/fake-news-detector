import { createClient } from 'redis';
import { config } from '../config';

// Create Redis client using Redis Cloud format
const redis = createClient({
  username: 'default',
  password: config.redisPassword,
  socket: {
    host: config.redisHost,
    port: config.redisPort
  }
});

// Redis connection events
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

// Connect to Redis
redis.connect().catch(console.error);

// Test Redis connection
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redis.ping();
    console.log('✅ Redis ping successful');
    return true;
  } catch (error) {
    console.error('❌ Redis ping failed:', error);
    return false;
  }
};

// Cache operations
export const cacheAnalysis = async (key: string, data: any, ttl: number = 3600): Promise<void> => {
  try {
    await redis.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const getCachedAnalysis = async (key: string): Promise<any | null> => {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

// Rate limiting
export const checkRateLimit = async (identifier: string, limit: number, timeWindow: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
  try {
    const key = `rate_limit:${identifier}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, timeWindow);
    }
    
    const ttl = await redis.ttl(key);
    const remaining = Math.max(0, limit - current);
    const resetTime = Date.now() + (ttl * 1000);
    
    return {
      allowed: current <= limit,
      remaining,
      resetTime
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // If Redis fails, allow the request (fail open)
    return { allowed: true, remaining: limit, resetTime: Date.now() + (timeWindow * 1000) };
  }
};

// Generate cache key for text analysis
export const generateAnalysisKey = (text: string, url?: string): string => {
  const crypto = require('crypto');
  const content = url ? `url:${url}` : `text:${text}`;
  return `analysis:${crypto.createHash('sha256').update(content).digest('hex')}`;
};

// Get cache statistics
export const getCacheStats = async () => {
  try {
    const info = await redis.info('memory');
    const keyspace = await redis.info('keyspace');
    const totalKeys = await redis.dbSize();
    
    return {
      redisConnected: true,
      totalKeys,
      memoryUsage: info.match(/used_memory_human:(.+)/)?.[1] || 'Unknown',
      cacheHitRate: 0, // We'll calculate this later
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      redisConnected: false,
      totalKeys: 0,
      memoryUsage: '0B',
      cacheHitRate: 0,
    };
  }
};

export default redis;
