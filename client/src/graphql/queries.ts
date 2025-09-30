import { gql } from '@apollo/client';

// GraphQL Queries
export const ANALYZE_TEXT = gql`
  mutation AnalyzeText($input: AnalyzeInput!) {
    analyzeText(input: $input) {
      isFake
      confidence
      explanation
      suspiciousPhrases
      recommendations
    }
  }
`;

export const GET_BUDGET_STATUS = gql`
  query GetBudgetStatus {
    budgetStatus {
      used
      remaining
      percentage
    }
  }
`;


export const GET_STATISTICS = gql`
  query GetStatistics {
    statistics {
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
    }
  }
`;

export const GET_CACHE_STATUS = gql`
  query GetCacheStatus {
    cacheStatus {
      redisConnected
      cacheHitRate
      totalKeys
      memoryUsage
    }
  }
`;

// GraphQL Types
export interface AnalyzeInput {
  text?: string;
  url?: string;
}

export interface AnalysisResult {
  isFake: boolean;
  confidence: number;
  explanation: string;
  suspiciousPhrases: string[];
  recommendations: string;
}

export interface BudgetStatus {
  used: number;
  remaining: number;
  percentage: number;
}

export interface Statistics {
  totalAnalyses: number;
  fakeNewsCount: number;
  legitimateNewsCount: number;
  averageConfidence: number;
}

export interface CacheStatus {
  redisConnected: boolean;
  cacheHitRate: number;
  totalKeys: number;
  memoryUsage: string;
}
