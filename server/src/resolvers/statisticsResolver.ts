import { GraphQLResolveInfo } from 'graphql';
import { StatisticsModel } from '../models/StatisticsModel';
import { AnalysisModel } from '../models/AnalysisModel';
import { BudgetModel } from '../models/BudgetModel';

// GraphQL Types
export const statisticsTypeDefs = `
  type Statistics {
    id: ID!
    totalAnalyses: Int!
    fakeNewsCount: Int!
    legitimateNewsCount: Int!
    averageConfidence: Float!
    lastUpdated: String!
  }

  input CreateStatisticsInput {
    totalAnalyses: Int
    fakeNewsCount: Int
    legitimateNewsCount: Int
    averageConfidence: Float
  }

  input UpdateStatisticsInput {
    totalAnalyses: Int
    fakeNewsCount: Int
    legitimateNewsCount: Int
    averageConfidence: Float
  }

  input DateRangeInput {
    startDate: String
    endDate: String
  }

  type StatisticsSummary {
    totalAnalyses: Int!
    fakeNewsCount: Int!
    legitimateNewsCount: Int!
    averageConfidence: Float!
    fakeNewsPercentage: Float!
    lastUpdated: String!
  }

  type AccuracyMetrics {
    totalAnalyses: Int!
    fakeNewsDetected: Int!
    legitimateNewsDetected: Int!
    averageConfidence: Float!
    detectionAccuracy: Float!
  }

  type TrendData {
    date: String!
    totalAnalyses: Int!
    fakeNewsCount: Int!
    averageConfidence: Float!
  }

  type DashboardStats {
    # Analysis Statistics
    totalAnalyses: Int!
    fakeNewsCount: Int!
    legitimateNewsCount: Int!
    averageConfidence: Float!
    fakeNewsPercentage: Float!
    
    # Budget Statistics
    currentMonthSpent: Float!
    budgetRemaining: Float!
    budgetPercentageUsed: Float!
    
    # Performance Metrics
    detectionAccuracy: Float!
    averageResponseTime: Float!
    
    # Recent Activity
    analysesLast24Hours: Int!
    analysesLastWeek: Int!
    
    # Last Updated
    lastUpdated: String!
  }

  type Query {
    # Get statistics by ID
    getStatistics(id: ID!): Statistics
    
    # Get all statistics entries
    getAllStatistics: [Statistics!]!
    
    # Get latest statistics
    getLatestStatistics: Statistics
    
    # Get statistics summary
    getStatisticsSummary: StatisticsSummary!
    
    # Get statistics by date range
    getStatisticsByDateRange(input: DateRangeInput!): [Statistics!]!
    
    # Get accuracy metrics
    getAccuracyMetrics: AccuracyMetrics!
    
    # Get trend data
    getTrendData(days: Int): [TrendData!]!
    
    # Get comprehensive dashboard stats
    getDashboardStats: DashboardStats!
  }

  type Mutation {
    # Create new statistics entry
    createStatistics(input: CreateStatisticsInput!): Statistics!
    
    # Update statistics
    updateStatistics(id: ID!, input: UpdateStatisticsInput!): Statistics
    
    # Delete statistics entry
    deleteStatistics(id: ID!): Boolean!
    
    # Recalculate statistics from analyses
    recalculateStatistics: Statistics!
    
    # Initialize statistics table
    initializeStatistics: Statistics!
  }
`;

// Resolver functions
export const statisticsResolvers = {
  Query: {
    // Get statistics by ID
    getStatistics: async (_: any, { id }: { id: string }) => {
      try {
        return await StatisticsModel.getById(id);
      } catch (error: any) {
        throw new Error(`Failed to get statistics: ${error.message}`);
      }
    },

    // Get all statistics entries
    getAllStatistics: async () => {
      try {
        return await StatisticsModel.getAll();
      } catch (error: any) {
        throw new Error(`Failed to get all statistics: ${error.message}`);
      }
    },

    // Get latest statistics
    getLatestStatistics: async () => {
      try {
        return await StatisticsModel.getLatest();
      } catch (error: any) {
        throw new Error(`Failed to get latest statistics: ${error.message}`);
      }
    },

    // Get statistics summary
    getStatisticsSummary: async () => {
      try {
        const summary = await StatisticsModel.getSummary();
        return {
          totalAnalyses: summary.totalAnalyses,
          fakeNewsCount: summary.fakeNewsCount,
          legitimateNewsCount: summary.legitimateNewsCount,
          averageConfidence: summary.averageConfidence,
          fakeNewsPercentage: summary.fakeNewsPercentage,
          lastUpdated: summary.lastUpdated.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to get statistics summary: ${error.message}`);
      }
    },

    // Get statistics by date range
    getStatisticsByDateRange: async (_: any, { input }: { input: { startDate?: string; endDate?: string } }) => {
      try {
        return await StatisticsModel.getByDateRange(input);
      } catch (error: any) {
        throw new Error(`Failed to get statistics by date range: ${error.message}`);
      }
    },

    // Get accuracy metrics
    getAccuracyMetrics: async () => {
      try {
        const metrics = await StatisticsModel.getAccuracyMetrics();
        return {
          totalAnalyses: metrics.totalAnalyses,
          fakeNewsDetected: metrics.fakeNewsDetected,
          legitimateNewsDetected: metrics.legitimateNewsDetected,
          averageConfidence: metrics.averageConfidence,
          detectionAccuracy: metrics.detectionAccuracy
        };
      } catch (error: any) {
        throw new Error(`Failed to get accuracy metrics: ${error.message}`);
      }
    },

    // Get trend data
    getTrendData: async (_: any, { days = 30 }: { days?: number }) => {
      try {
        const trend = await StatisticsModel.getTrendData(days);
        return trend.map(item => ({
          date: item.date,
          totalAnalyses: item.totalAnalyses,
          fakeNewsCount: item.fakeNewsCount,
          averageConfidence: item.averageConfidence
        }));
      } catch (error: any) {
        throw new Error(`Failed to get trend data: ${error.message}`);
      }
    },

    // Get comprehensive dashboard stats
    getDashboardStats: async () => {
      try {
        // Get analysis statistics
        const analysisStats = await AnalysisModel.getStats();
        const statisticsSummary = await StatisticsModel.getSummary();
        
        // Get budget information
        const currentBudget = await BudgetModel.getCurrentMonth();
        
        // Get recent activity
        const recentAnalyses = await AnalysisModel.getRecent(24, 1000); // Last 24 hours
        const weeklyAnalyses = await AnalysisModel.getRecent(168, 1000); // Last week (7 days)
        
        // Calculate performance metrics
        const detectionAccuracy = statisticsSummary.averageConfidence * 100;
        const averageResponseTime = 1.2; // Mock value - would be calculated from actual response times
        
        return {
          // Analysis Statistics
          totalAnalyses: statisticsSummary.totalAnalyses,
          fakeNewsCount: statisticsSummary.fakeNewsCount,
          legitimateNewsCount: statisticsSummary.legitimateNewsCount,
          averageConfidence: statisticsSummary.averageConfidence,
          fakeNewsPercentage: statisticsSummary.fakeNewsPercentage,
          
          // Budget Statistics
          currentMonthSpent: currentBudget?.total_used || 0,
          budgetRemaining: currentBudget?.total_remaining || 25,
          budgetPercentageUsed: currentBudget?.percentage_used || 0,
          
          // Performance Metrics
          detectionAccuracy,
          averageResponseTime,
          
          // Recent Activity
          analysesLast24Hours: recentAnalyses.length,
          analysesLastWeek: weeklyAnalyses.length,
          
          // Last Updated
          lastUpdated: statisticsSummary.lastUpdated.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to get dashboard stats: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Create new statistics entry
    createStatistics: async (_: any, { input }: { input: any }) => {
      try {
        const statistics = await StatisticsModel.create({
          total_analyses: input.totalAnalyses || 0,
          fake_news_count: input.fakeNewsCount || 0,
          legitimate_news_count: input.legitimateNewsCount || 0,
          average_confidence: input.averageConfidence || 0
        });

        return {
          id: statistics.id,
          totalAnalyses: statistics.total_analyses,
          fakeNewsCount: statistics.fake_news_count,
          legitimateNewsCount: statistics.legitimate_news_count,
          averageConfidence: statistics.average_confidence,
          lastUpdated: statistics.last_updated.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to create statistics: ${error.message}`);
      }
    },

    // Update statistics
    updateStatistics: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        const updatedStatistics = await StatisticsModel.update(id, {
          total_analyses: input.totalAnalyses,
          fake_news_count: input.fakeNewsCount,
          legitimate_news_count: input.legitimateNewsCount,
          average_confidence: input.averageConfidence
        });

        if (!updatedStatistics) {
          throw new Error('Statistics not found');
        }

        return {
          id: updatedStatistics.id,
          totalAnalyses: updatedStatistics.total_analyses,
          fakeNewsCount: updatedStatistics.fake_news_count,
          legitimateNewsCount: updatedStatistics.legitimate_news_count,
          averageConfidence: updatedStatistics.average_confidence,
          lastUpdated: updatedStatistics.last_updated.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to update statistics: ${error.message}`);
      }
    },

    // Delete statistics entry
    deleteStatistics: async (_: any, { id }: { id: string }) => {
      try {
        return await StatisticsModel.delete(id);
      } catch (error: any) {
        throw new Error(`Failed to delete statistics: ${error.message}`);
      }
    },

    // Recalculate statistics from analyses
    recalculateStatistics: async () => {
      try {
        const statistics = await StatisticsModel.recalculate();
        
        return {
          id: statistics.id,
          totalAnalyses: statistics.total_analyses,
          fakeNewsCount: statistics.fake_news_count,
          legitimateNewsCount: statistics.legitimate_news_count,
          averageConfidence: statistics.average_confidence,
          lastUpdated: statistics.last_updated.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to recalculate statistics: ${error.message}`);
      }
    },

    // Initialize statistics table
    initializeStatistics: async () => {
      try {
        const statistics = await StatisticsModel.initialize();
        
        return {
          id: statistics.id,
          totalAnalyses: statistics.total_analyses,
          fakeNewsCount: statistics.fake_news_count,
          legitimateNewsCount: statistics.legitimate_news_count,
          averageConfidence: statistics.average_confidence,
          lastUpdated: statistics.last_updated.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to initialize statistics: ${error.message}`);
      }
    }
  }
};
