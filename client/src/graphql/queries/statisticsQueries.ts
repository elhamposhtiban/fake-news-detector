import { gql } from '@apollo/client';

// Statistics Queries
export const GET_STATISTICS = gql`
  query GetStatistics($id: ID!) {
    getStatistics(id: $id) {
      id
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      lastUpdated
    }
  }
`;

export const GET_ALL_STATISTICS = gql`
  query GetAllStatistics {
    getAllStatistics {
      id
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      lastUpdated
    }
  }
`;

export const GET_LATEST_STATISTICS = gql`
  query GetLatestStatistics {
    getLatestStatistics {
      id
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      lastUpdated
    }
  }
`;

export const GET_STATISTICS_SUMMARY = gql`
  query GetStatisticsSummary {
    getStatisticsSummary {
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      fakeNewsPercentage
      lastUpdated
    }
  }
`;

export const GET_STATISTICS_BY_DATE_RANGE = gql`
  query GetStatisticsByDateRange($input: DateRangeInput!) {
    getStatisticsByDateRange(input: $input) {
      id
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      lastUpdated
    }
  }
`;

export const GET_ACCURACY_METRICS = gql`
  query GetAccuracyMetrics {
    getAccuracyMetrics {
      totalAnalyses
      fakeNewsDetected
      legitimateNewsDetected
      averageConfidence
      detectionAccuracy
    }
  }
`;

export const GET_TREND_DATA = gql`
  query GetTrendData($days: Int) {
    getTrendData(days: $days) {
      date
      totalAnalyses
      fakeNewsCount
      averageConfidence
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardStats {
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      fakeNewsPercentage
      currentMonthSpent
      budgetRemaining
      budgetPercentageUsed
      detectionAccuracy
      averageResponseTime
      analysesLast24Hours
      analysesLastWeek
      lastUpdated
    }
  }
`;
