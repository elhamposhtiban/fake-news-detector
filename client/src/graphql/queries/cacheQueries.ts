import { gql } from '@apollo/client';

// Cache Queries
export const GET_CACHE_STATS = gql`
  query GetCacheStats {
    getCacheStats {
      redisConnected
      totalKeys
      memoryUsage
      cacheHitRate
    }
  }
`;

export const GET_CACHE_HEALTH = gql`
  query GetCacheHealth {
    getCacheHealth {
      healthy
      connected
      totalKeys
      memoryUsage
    }
  }
`;

export const GET_CACHED_ANALYSIS = gql`
  query GetCachedAnalysis($text: String!, $url: String) {
    getCachedAnalysis(text: $text, url: $url) {
      text
      url
      isFake
      confidence
      explanation
      suspiciousPhrases
      recommendations
      modelUsed
      cachedAt
    }
  }
`;

export const IS_ANALYSIS_CACHED = gql`
  query IsAnalysisCached($text: String!, $url: String) {
    isAnalysisCached(text: $text, url: $url)
  }
`;

export const GET_USER_SESSION = gql`
  query GetUserSession($userId: String!) {
    getUserSession(userId: $userId)
  }
`;

export const GET_CACHED_API_RESPONSE = gql`
  query GetCachedApiResponse($endpoint: String!, $params: String!) {
    getCachedApiResponse(endpoint: $endpoint, params: $params)
  }
`;

export const GET_CACHED_BUDGET_DATA = gql`
  query GetCachedBudgetData($monthYear: String!) {
    getCachedBudgetData(monthYear: $monthYear)
  }
`;

export const GET_CACHED_STATISTICS_DATA = gql`
  query GetCachedStatisticsData {
    getCachedStatisticsData
  }
`;

export const GET_ANALYSIS_CACHE_HIT_RATE = gql`
  query GetAnalysisCacheHitRate {
    getAnalysisCacheHitRate {
      totalRequests
      cacheHits
      cacheMisses
      hitRate
    }
  }
`;

export const CHECK_RATE_LIMIT = gql`
  query CheckRateLimit($input: RateLimitInput!) {
    checkRateLimit(input: $input) {
      allowed
      remaining
      resetTime
    }
  }
`;
