// Export all queries
export * from './queries/analysisQueries';
export * from './queries/budgetQueries';
export * from './queries/statisticsQueries';
export * from './queries/cacheQueries';

// Export all mutations
export * from './mutations/analysisMutations';
export * from './mutations/budgetMutations';
export * from './mutations/statisticsMutations';
export * from './mutations/cacheMutations';

// TypeScript interfaces for GraphQL operations
export interface AnalyzeTextInput {
  textContent: string;
  url?: string;
}

export interface AnalyzeTextResponse {
  success: boolean;
  analysis?: Analysis;
  error?: string;
  cached: boolean;
}

export interface Analysis {
  id: string;
  textContent: string;
  url?: string;
  isFake: boolean;
  confidence: number;
  explanation: string;
  suspiciousPhrases: string[];
  recommendations: string;
  modelUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisStats {
  totalAnalyses: number;
  fakeCount: number;
  realCount: number;
  avgConfidence: number;
}

export interface BudgetTracking {
  id: string;
  monthYear: string;
  totalUsed: number;
  totalRemaining: number;
  percentageUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStatus {
  exceeded: boolean;
  currentBudget?: BudgetTracking;
  percentageUsed: number;
  threshold: number;
}

export interface BudgetSummary {
  currentMonth?: BudgetTracking;
  monthlyTrend: BudgetTracking[];
  totalSpent: number;
  averageMonthlySpend: number;
  projectedAnnualCost: number;
}

export interface Statistics {
  id: string;
  totalAnalyses: number;
  fakeNewsCount: number;
  legitimateNewsCount: number;
  averageConfidence: number;
  lastUpdated: string;
}

export interface StatisticsSummary {
  totalAnalyses: number;
  fakeNewsCount: number;
  legitimateNewsCount: number;
  averageConfidence: number;
  fakeNewsPercentage: number;
  lastUpdated: string;
}

export interface DashboardStats {
  totalAnalyses: number;
  fakeNewsCount: number;
  legitimateNewsCount: number;
  averageConfidence: number;
  fakeNewsPercentage: number;
  currentMonthSpent: number;
  budgetRemaining: number;
  budgetPercentageUsed: number;
  detectionAccuracy: number;
  averageResponseTime: number;
  analysesLast24Hours: number;
  analysesLastWeek: number;
  lastUpdated: string;
}

export interface CacheStats {
  redisConnected: boolean;
  totalKeys: number;
  memoryUsage: string;
  cacheHitRate: number;
}

export interface CacheHealth {
  healthy: boolean;
  connected: boolean;
  totalKeys: number;
  memoryUsage: string;
}

export interface CachedAnalysis {
  text: string;
  url?: string;
  isFake: boolean;
  confidence: number;
  explanation: string;
  suspiciousPhrases: string[];
  recommendations: string;
  modelUsed: string;
  cachedAt: string;
}

export interface CacheHitRate {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: string;
}
