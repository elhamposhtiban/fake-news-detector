import { z } from 'zod';
import { 
  cacheAnalysis, 
  getCachedAnalysis, 
  generateAnalysisKey, 
  getCacheStats,
  checkRateLimit 
} from '../services/redis';

// Zod schemas for validation
export const CacheKeySchema = z.string().min(1, 'Cache key is required').max(500, 'Cache key too long');
export const CacheTTLSchema = z.number().int().min(1, 'TTL must be at least 1 second').max(86400, 'TTL cannot exceed 24 hours').default(3600);
export const CacheDataSchema = z.any(); // Can cache any data type

export const AnalysisCacheSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  url: z.string().url('Invalid URL format').optional(),
  ttl: CacheTTLSchema.optional()
});

export const RateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(1000, 'Limit too high'),
  timeWindow: z.number().int().min(1, 'Time window must be at least 1 second').max(86400, 'Time window too long')
});

export const CacheStatsSchema = z.object({
  redisConnected: z.boolean(),
  totalKeys: z.number().int().min(0),
  memoryUsage: z.string(),
  cacheHitRate: z.number().min(0).max(100)
});

// TypeScript interfaces derived from Zod schemas
export type CacheData = any;
export type AnalysisCacheInput = z.infer<typeof AnalysisCacheSchema>;
export type RateLimitInput = z.infer<typeof RateLimitSchema>;
export type CacheStats = z.infer<typeof CacheStatsSchema>;

export class CacheModel {
  // Cache any data with a key
  static async set(key: string, data: unknown, ttl: number = 3600): Promise<void> {
    const validatedKey = CacheKeySchema.parse(key);
    const validatedTTL = CacheTTLSchema.parse(ttl);
    
    await cacheAnalysis(validatedKey, data, validatedTTL);
  }

  // Get cached data by key
  static async get(key: string): Promise<CacheData | null> {
    const validatedKey = CacheKeySchema.parse(key);
    return await getCachedAnalysis(validatedKey);
  }

  // Cache analysis result
  static async cacheAnalysis(params: AnalysisCacheInput): Promise<string> {
    const { text, url, ttl = 3600 } = AnalysisCacheSchema.parse(params);
    
    const cacheKey = generateAnalysisKey(text, url);
    const analysisData = {
      text,
      url,
      cached_at: new Date().toISOString(),
      ttl
    };
    
    await this.set(cacheKey, analysisData, ttl);
    return cacheKey;
  }

  // Get cached analysis
  static async getCachedAnalysis(text: string, url?: string): Promise<CacheData | null> {
    const cacheKey = generateAnalysisKey(text, url);
    return await this.get(cacheKey);
  }

  // Check if analysis is cached
  static async isAnalysisCached(text: string, url?: string): Promise<boolean> {
    const cached = await this.getCachedAnalysis(text, url);
    return cached !== null;
  }

  // Cache analysis result with OpenAI response
  static async cacheAnalysisResult(params: {
    text: string;
    url?: string;
    analysisResult: {
      is_fake: boolean;
      confidence: number;
      explanation: string;
      suspicious_phrases: string[];
      recommendations: string;
      model_used: string;
    };
    ttl?: number;
  }): Promise<string> {
    const { text, url, analysisResult, ttl = 3600 } = params;
    
    const cacheKey = generateAnalysisKey(text, url);
    const cacheData = {
      ...analysisResult,
      text,
      url,
      cached_at: new Date().toISOString(),
      ttl
    };
    
    await this.set(cacheKey, cacheData, ttl);
    return cacheKey;
  }

  // Get cached analysis result
  static async getCachedAnalysisResult(text: string, url?: string): Promise<{
    is_fake: boolean;
    confidence: number;
    explanation: string;
    suspicious_phrases: string[];
    recommendations: string;
    model_used: string;
    cached_at: string;
  } | null> {
    const cached = await this.getCachedAnalysis(text, url);
    return cached;
  }

  // Delete cache entry
  static async delete(key: string): Promise<boolean> {
    const validatedKey = CacheKeySchema.parse(key);
    // Note: Redis doesn't have a direct delete method in our current setup
    // We can set the key with a very short TTL to effectively delete it
    await this.set(validatedKey, null, 1);
    return true;
  }

  // Clear all cache entries (use with caution)
  static async clearAll(): Promise<void> {
    // This would require implementing a flush method in Redis service
    // For now, we'll throw an error to prevent accidental clearing
    throw new Error('Clear all cache not implemented for safety reasons');
  }

  // Get cache statistics
  static async getStats(): Promise<CacheStats> {
    const stats = await getCacheStats();
    return CacheStatsSchema.parse(stats);
  }

  // Check rate limit
  static async checkRateLimit(params: RateLimitInput): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const { identifier, limit, timeWindow } = RateLimitSchema.parse(params);
    return await checkRateLimit(identifier, limit, timeWindow);
  }

  // Cache user session data
  static async cacheUserSession(userId: string, sessionData: unknown, ttl: number = 1800): Promise<void> {
    const sessionKey = `session:${userId}`;
    await this.set(sessionKey, sessionData, ttl);
  }

  // Get user session data
  static async getUserSession(userId: string): Promise<CacheData | null> {
    const sessionKey = `session:${userId}`;
    return await this.get(sessionKey);
  }

  // Cache API response
  static async cacheApiResponse(endpoint: string, params: Record<string, any>, response: unknown, ttl: number = 300): Promise<string> {
    const cacheKey = `api:${endpoint}:${JSON.stringify(params)}`;
    await this.set(cacheKey, response, ttl);
    return cacheKey;
  }

  // Get cached API response
  static async getCachedApiResponse(endpoint: string, params: Record<string, any>): Promise<CacheData | null> {
    const cacheKey = `api:${endpoint}:${JSON.stringify(params)}`;
    return await this.get(cacheKey);
  }

  // Cache budget data
  static async cacheBudgetData(monthYear: string, budgetData: unknown, ttl: number = 3600): Promise<void> {
    const budgetKey = `budget:${monthYear}`;
    await this.set(budgetKey, budgetData, ttl);
  }

  // Get cached budget data
  static async getCachedBudgetData(monthYear: string): Promise<CacheData | null> {
    const budgetKey = `budget:${monthYear}`;
    return await this.get(budgetKey);
  }

  // Cache statistics data
  static async cacheStatisticsData(statsData: unknown, ttl: number = 600): Promise<void> {
    const statsKey = 'statistics:latest';
    await this.set(statsKey, statsData, ttl);
  }

  // Get cached statistics data
  static async getCachedStatisticsData(): Promise<CacheData | null> {
    const statsKey = 'statistics:latest';
    return await this.get(statsKey);
  }

  // Check cache health
  static async checkHealth(): Promise<{
    healthy: boolean;
    connected: boolean;
    totalKeys: number;
    memoryUsage: string;
  }> {
    try {
      const stats = await this.getStats();
      return {
        healthy: stats.redisConnected,
        connected: stats.redisConnected,
        totalKeys: stats.totalKeys,
        memoryUsage: stats.memoryUsage
      };
    } catch (error) {
      return {
        healthy: false,
        connected: false,
        totalKeys: 0,
        memoryUsage: 'Unknown'
      };
    }
  }

  // Get cache hit rate for analysis
  static async getAnalysisCacheHitRate(): Promise<{
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    hitRate: number;
  }> {
    // This would require implementing hit/miss tracking
    // For now, return placeholder data
    return {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0
    };
  }

  // Warm up cache with frequently accessed data
  static async warmUpCache(): Promise<void> {
    // Cache common analysis patterns
    const commonPatterns = [
      'Breaking news',
      'Scientists discover',
      'New study shows',
      'Experts warn',
      'Government announces'
    ];

    for (const pattern of commonPatterns) {
      await this.cacheAnalysis({ text: pattern, ttl: 7200 });
    }
  }
}
