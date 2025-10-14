import { gql } from 'apollo-server-express';

// Import all resolver type definitions
import { analysisTypeDefs } from '../resolvers/analysisResolver';
import { budgetTypeDefs } from '../resolvers/budgetResolver';
import { statisticsTypeDefs } from '../resolvers/statisticsResolver';
import { cacheTypeDefs } from '../resolvers/cacheResolver';

// Main GraphQL Schema - combines all resolvers
export const typeDefs = gql`
  # Common scalar types
  scalar Date
  scalar JSON

  # Main Query type - combines all query resolvers
  type Query {
    # Analysis Queries
    getAnalysis(id: ID!): Analysis
    getAllAnalyses(limit: Int, offset: Int): [Analysis!]!
    getAnalysesByFakeStatus(isFake: Boolean!, limit: Int): [Analysis!]!
    getAnalysesByModel(modelUsed: String!, limit: Int): [Analysis!]!
    searchAnalyses(searchTerm: String!, limit: Int): [Analysis!]!
    getRecentAnalyses(hours: Int, limit: Int): [Analysis!]!
    getAnalysisStats: AnalysisStats!

    # Budget Queries
    getBudget(id: ID!): BudgetTracking
    getAllBudgets(limit: Int, offset: Int): [BudgetTracking!]!
    getBudgetByMonthYear(monthYear: String!): BudgetTracking
    getCurrentMonthBudget: BudgetTracking
    getBudgetSummary(months: Int): BudgetSummary!
    getUsageTrend(months: Int): [UsageTrend!]!
    isBudgetExceeded(threshold: Float): BudgetStatus!

    # Statistics Queries
    getStatistics(id: ID!): Statistics
    getAllStatistics: [Statistics!]!
    getLatestStatistics: Statistics
    getStatisticsSummary: StatisticsSummary!
    getStatisticsByDateRange(input: DateRangeInput!): [Statistics!]!
    getAccuracyMetrics: AccuracyMetrics!
    getTrendData(days: Int): [TrendData!]!
    getDashboardStats: DashboardStats!

    # Cache Queries
    getCacheStats: CacheStats!
    getCacheHealth: CacheHealth!
    getCachedAnalysis(text: String!, url: String): CachedAnalysis
    isAnalysisCached(text: String!, url: String): Boolean!
    getUserSession(userId: String!): String
    getCachedApiResponse(endpoint: String!, params: String!): String
    getCachedBudgetData(monthYear: String!): String
    getCachedStatisticsData: String
    getAnalysisCacheHitRate: CacheHitRate!
    checkRateLimit(input: RateLimitInput!): RateLimitResult!
  }

  # Main Mutation type - combines all mutation resolvers
  type Mutation {
    # Analysis Mutations
    analyzeText(input: AnalyzeTextInput!): AnalyzeTextResponse!
    updateAnalysis(id: ID!, input: UpdateAnalysisInput!): Analysis
    deleteAnalysis(id: ID!): Boolean!

    # Budget Mutations
    createBudget(input: CreateBudgetInput!): BudgetTracking!
    updateBudget(id: ID!, input: UpdateBudgetInput!): BudgetTracking
    deleteBudget(id: ID!): Boolean!
    addCost(input: AddCostInput!): BudgetTracking!
    resetForNewMonth(monthYear: String!, budgetAmount: Float): BudgetTracking!

    # Statistics Mutations
    createStatistics(input: CreateStatisticsInput!): Statistics!
    updateStatistics(id: ID!, input: UpdateStatisticsInput!): Statistics
    deleteStatistics(id: ID!): Boolean!
    recalculateStatistics: Statistics!
    initializeStatistics: Statistics!

    # Cache Mutations
    cacheAnalysis(input: CacheAnalysisInput!): String!
    cacheAnalysisResult(input: CacheAnalysisResultInput!): String!
    cacheUserSession(input: CacheUserSessionInput!): Boolean!
    cacheApiResponse(input: CacheApiResponseInput!): String!
    cacheBudgetData(monthYear: String!, budgetData: String!, ttl: Int): Boolean!
    cacheStatisticsData(statsData: String!, ttl: Int): Boolean!
    deleteCacheEntry(key: String!): Boolean!
    warmUpCache: Boolean!
  }

  # Include all type definitions from resolvers
  ${analysisTypeDefs}
  ${budgetTypeDefs}
  ${statisticsTypeDefs}
  ${cacheTypeDefs}
`;

// Export the combined schema
export default typeDefs;
