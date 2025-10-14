import { gql } from '@apollo/client';

// Cache Mutations
export const CACHE_ANALYSIS = gql`
  mutation CacheAnalysis($input: CacheAnalysisInput!) {
    cacheAnalysis(input: $input)
  }
`;

export const CACHE_ANALYSIS_RESULT = gql`
  mutation CacheAnalysisResult($input: CacheAnalysisResultInput!) {
    cacheAnalysisResult(input: $input)
  }
`;

export const CACHE_USER_SESSION = gql`
  mutation CacheUserSession($input: CacheUserSessionInput!) {
    cacheUserSession(input: $input)
  }
`;

export const CACHE_API_RESPONSE = gql`
  mutation CacheApiResponse($input: CacheApiResponseInput!) {
    cacheApiResponse(input: $input)
  }
`;

export const CACHE_BUDGET_DATA = gql`
  mutation CacheBudgetData($monthYear: String!, $budgetData: String!, $ttl: Int) {
    cacheBudgetData(monthYear: $monthYear, budgetData: $budgetData, ttl: $ttl)
  }
`;

export const CACHE_STATISTICS_DATA = gql`
  mutation CacheStatisticsData($statsData: String!, $ttl: Int) {
    cacheStatisticsData(statsData: $statsData, ttl: $ttl)
  }
`;

export const DELETE_CACHE_ENTRY = gql`
  mutation DeleteCacheEntry($key: String!) {
    deleteCacheEntry(key: $key)
  }
`;

export const WARM_UP_CACHE = gql`
  mutation WarmUpCache {
    warmUpCache
  }
`;
