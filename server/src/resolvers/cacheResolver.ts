import { GraphQLResolveInfo } from 'graphql';
import { CacheModel } from '../models/CacheModel';

// GraphQL Types
export const cacheTypeDefs = `
  type CacheStats {
    redisConnected: Boolean!
    totalKeys: Int!
    memoryUsage: String!
    cacheHitRate: Float!
  }

  type CacheHealth {
    healthy: Boolean!
    connected: Boolean!
    totalKeys: Int!
    memoryUsage: String!
  }

  type CacheHitRate {
    totalRequests: Int!
    cacheHits: Int!
    cacheMisses: Int!
    hitRate: Float!
  }

  type CachedAnalysis {
    text: String!
    url: String
    isFake: Boolean!
    confidence: Float!
    explanation: String!
    suspiciousPhrases: [String!]!
    recommendations: String!
    modelUsed: String!
    cachedAt: String!
  }

  input CacheAnalysisInput {
    text: String!
    url: String
    ttl: Int
  }

  input CacheUserSessionInput {
    userId: String!
    sessionData: String!
    ttl: Int
  }

  input CacheApiResponseInput {
    endpoint: String!
    params: String!
    response: String!
    ttl: Int
  }

  input RateLimitInput {
    identifier: String!
    limit: Int!
    timeWindow: Int!
  }

  type RateLimitResult {
    allowed: Boolean!
    remaining: Int!
    resetTime: String!
  }

  type Query {
    # Get cache statistics
    getCacheStats: CacheStats!
    
    # Get cache health status
    getCacheHealth: CacheHealth!
    
    # Get cached analysis
    getCachedAnalysis(text: String!, url: String): CachedAnalysis
    
    # Check if analysis is cached
    isAnalysisCached(text: String!, url: String): Boolean!
    
    # Get user session data
    getUserSession(userId: String!): String
    
    # Get cached API response
    getCachedApiResponse(endpoint: String!, params: String!): String
    
    # Get cached budget data
    getCachedBudgetData(monthYear: String!): String
    
    # Get cached statistics data
    getCachedStatisticsData: String
    
    # Get cache hit rate for analysis
    getAnalysisCacheHitRate: CacheHitRate!
    
    # Check rate limit
    checkRateLimit(input: RateLimitInput!): RateLimitResult!
  }

  type Mutation {
    # Cache analysis result
    cacheAnalysis(input: CacheAnalysisInput!): String!
    
    # Cache analysis result with full data
    cacheAnalysisResult(input: CacheAnalysisResultInput!): String!
    
    # Cache user session
    cacheUserSession(input: CacheUserSessionInput!): Boolean!
    
    # Cache API response
    cacheApiResponse(input: CacheApiResponseInput!): String!
    
    # Cache budget data
    cacheBudgetData(monthYear: String!, budgetData: String!, ttl: Int): Boolean!
    
    # Cache statistics data
    cacheStatisticsData(statsData: String!, ttl: Int): Boolean!
    
    # Delete cache entry
    deleteCacheEntry(key: String!): Boolean!
    
    # Warm up cache with common data
    warmUpCache: Boolean!
  }

  input CacheAnalysisResultInput {
    text: String!
    url: String
    analysisResult: AnalysisResultInput!
    ttl: Int
  }

  input AnalysisResultInput {
    isFake: Boolean!
    confidence: Float!
    explanation: String!
    suspiciousPhrases: [String!]!
    recommendations: String!
    modelUsed: String!
  }
`;

// Resolver functions
export const cacheResolvers = {
  Query: {
    // Get cache statistics
    getCacheStats: async () => {
      try {
        const stats = await CacheModel.getStats();
        return {
          redisConnected: stats.redisConnected,
          totalKeys: stats.totalKeys,
          memoryUsage: stats.memoryUsage,
          cacheHitRate: stats.cacheHitRate
        };
      } catch (error: any) {
        throw new Error(`Failed to get cache stats: ${error.message}`);
      }
    },

    // Get cache health status
    getCacheHealth: async () => {
      try {
        const health = await CacheModel.checkHealth();
        return {
          healthy: health.healthy,
          connected: health.connected,
          totalKeys: health.totalKeys,
          memoryUsage: health.memoryUsage
        };
      } catch (error: any) {
        throw new Error(`Failed to get cache health: ${error.message}`);
      }
    },

    // Get cached analysis
    getCachedAnalysis: async (_: any, { text, url }: { text: string; url?: string }) => {
      try {
        const cached = await CacheModel.getCachedAnalysisResult(text, url);
        
        if (!cached) {
          return null;
        }

        return {
          text: text,
          url: url,
          isFake: cached.is_fake,
          confidence: cached.confidence,
          explanation: cached.explanation,
          suspiciousPhrases: cached.suspicious_phrases,
          recommendations: cached.recommendations,
          modelUsed: cached.model_used,
          cachedAt: cached.cached_at
        };
      } catch (error: any) {
        throw new Error(`Failed to get cached analysis: ${error.message}`);
      }
    },

    // Check if analysis is cached
    isAnalysisCached: async (_: any, { text, url }: { text: string; url?: string }) => {
      try {
        return await CacheModel.isAnalysisCached(text, url);
      } catch (error: any) {
        throw new Error(`Failed to check if analysis is cached: ${error.message}`);
      }
    },

    // Get user session data
    getUserSession: async (_: any, { userId }: { userId: string }) => {
      try {
        const session = await CacheModel.getUserSession(userId);
        return session;
      } catch (error: any) {
        throw new Error(`Failed to get user session: ${error.message}`);
      }
    },

    // Get cached API response
    getCachedApiResponse: async (_: any, { endpoint, params }: { endpoint: string; params: string }) => {
      try {
        const parsedParams = JSON.parse(params);
        const response = await CacheModel.getCachedApiResponse(endpoint, parsedParams);
        return response;
      } catch (error: any) {
        throw new Error(`Failed to get cached API response: ${error.message}`);
      }
    },

    // Get cached budget data
    getCachedBudgetData: async (_: any, { monthYear }: { monthYear: string }) => {
      try {
        const budgetData = await CacheModel.getCachedBudgetData(monthYear);
        return budgetData;
      } catch (error: any) {
        throw new Error(`Failed to get cached budget data: ${error.message}`);
      }
    },

    // Get cached statistics data
    getCachedStatisticsData: async () => {
      try {
        const statsData = await CacheModel.getCachedStatisticsData();
        return statsData;
      } catch (error: any) {
        throw new Error(`Failed to get cached statistics data: ${error.message}`);
      }
    },

    // Get cache hit rate for analysis
    getAnalysisCacheHitRate: async () => {
      try {
        const hitRate = await CacheModel.getAnalysisCacheHitRate();
        return {
          totalRequests: hitRate.totalRequests,
          cacheHits: hitRate.cacheHits,
          cacheMisses: hitRate.cacheMisses,
          hitRate: hitRate.hitRate
        };
      } catch (error: any) {
        throw new Error(`Failed to get cache hit rate: ${error.message}`);
      }
    },

    // Check rate limit
    checkRateLimit: async (_: any, { input }: { input: { identifier: string; limit: number; timeWindow: number } }) => {
      try {
        const result = await CacheModel.checkRateLimit(input);
        return {
          allowed: result.allowed,
          remaining: result.remaining,
          resetTime: new Date(result.resetTime).toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to check rate limit: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Cache analysis result
    cacheAnalysis: async (_: any, { input }: { input: { text: string; url?: string; ttl?: number } }) => {
      try {
        const cacheKey = await CacheModel.cacheAnalysis({
          text: input.text,
          url: input.url,
          ttl: input.ttl
        });
        return cacheKey;
      } catch (error: any) {
        throw new Error(`Failed to cache analysis: ${error.message}`);
      }
    },

    // Cache analysis result with full data
    cacheAnalysisResult: async (_: any, { input }: { input: any }) => {
      try {
        const cacheKey = await CacheModel.cacheAnalysisResult({
          text: input.text,
          url: input.url,
          analysisResult: {
            is_fake: input.analysisResult.isFake,
            confidence: input.analysisResult.confidence,
            explanation: input.analysisResult.explanation,
            suspicious_phrases: input.analysisResult.suspiciousPhrases,
            recommendations: input.analysisResult.recommendations,
            model_used: input.analysisResult.modelUsed
          },
          ttl: input.ttl
        });
        return cacheKey;
      } catch (error: any) {
        throw new Error(`Failed to cache analysis result: ${error.message}`);
      }
    },

    // Cache user session
    cacheUserSession: async (_: any, { input }: { input: { userId: string; sessionData: string; ttl?: number } }) => {
      try {
        await CacheModel.cacheUserSession(input.userId, input.sessionData, input.ttl || 1800);
        return true;
      } catch (error: any) {
        throw new Error(`Failed to cache user session: ${error.message}`);
      }
    },

    // Cache API response
    cacheApiResponse: async (_: any, { input }: { input: { endpoint: string; params: string; response: string; ttl?: number } }) => {
      try {
        const parsedParams = JSON.parse(input.params);
        const cacheKey = await CacheModel.cacheApiResponse(input.endpoint, parsedParams, input.response, input.ttl || 300);
        return cacheKey;
      } catch (error: any) {
        throw new Error(`Failed to cache API response: ${error.message}`);
      }
    },

    // Cache budget data
    cacheBudgetData: async (_: any, { monthYear, budgetData, ttl = 3600 }: { monthYear: string; budgetData: string; ttl?: number }) => {
      try {
        await CacheModel.cacheBudgetData(monthYear, budgetData, ttl);
        return true;
      } catch (error: any) {
        throw new Error(`Failed to cache budget data: ${error.message}`);
      }
    },

    // Cache statistics data
    cacheStatisticsData: async (_: any, { statsData, ttl = 600 }: { statsData: string; ttl?: number }) => {
      try {
        await CacheModel.cacheStatisticsData(statsData, ttl);
        return true;
      } catch (error: any) {
        throw new Error(`Failed to cache statistics data: ${error.message}`);
      }
    },

    // Delete cache entry
    deleteCacheEntry: async (_: any, { key }: { key: string }) => {
      try {
        return await CacheModel.delete(key);
      } catch (error: any) {
        throw new Error(`Failed to delete cache entry: ${error.message}`);
      }
    },

    // Warm up cache with common data
    warmUpCache: async () => {
      try {
        await CacheModel.warmUpCache();
        return true;
      } catch (error: any) {
        throw new Error(`Failed to warm up cache: ${error.message}`);
      }
    }
  }
};
