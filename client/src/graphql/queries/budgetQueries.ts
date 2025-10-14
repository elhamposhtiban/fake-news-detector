import { gql } from '@apollo/client';

// Budget Queries
export const GET_BUDGET = gql`
  query GetBudget($id: ID!) {
    getBudget(id: $id) {
      id
      monthYear
      totalUsed
      totalRemaining
      percentageUsed
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_BUDGETS = gql`
  query GetAllBudgets($limit: Int, $offset: Int) {
    getAllBudgets(limit: $limit, offset: $offset) {
      id
      monthYear
      totalUsed
      totalRemaining
      percentageUsed
      createdAt
      updatedAt
    }
  }
`;

export const GET_BUDGET_BY_MONTH_YEAR = gql`
  query GetBudgetByMonthYear($monthYear: String!) {
    getBudgetByMonthYear(monthYear: $monthYear) {
      id
      monthYear
      totalUsed
      totalRemaining
      percentageUsed
      createdAt
      updatedAt
    }
  }
`;

export const GET_CURRENT_MONTH_BUDGET = gql`
  query GetCurrentMonthBudget {
    getCurrentMonthBudget {
      id
      monthYear
      totalUsed
      totalRemaining
      percentageUsed
      createdAt
      updatedAt
    }
  }
`;

export const GET_BUDGET_SUMMARY = gql`
  query GetBudgetSummary($months: Int) {
    getBudgetSummary(months: $months) {
      currentMonth {
        id
        monthYear
        totalUsed
        totalRemaining
        percentageUsed
        createdAt
        updatedAt
      }
      monthlyTrend {
        id
        monthYear
        totalUsed
        totalRemaining
        percentageUsed
        createdAt
        updatedAt
      }
      totalSpent
      averageMonthlySpend
      projectedAnnualCost
    }
  }
`;

export const GET_USAGE_TREND = gql`
  query GetUsageTrend($months: Int) {
    getUsageTrend(months: $months) {
      monthYear
      totalUsed
      percentageUsed
    }
  }
`;

export const IS_BUDGET_EXCEEDED = gql`
  query IsBudgetExceeded($threshold: Float) {
    isBudgetExceeded(threshold: $threshold) {
      exceeded
      currentBudget {
        id
        monthYear
        totalUsed
        totalRemaining
        percentageUsed
        createdAt
        updatedAt
      }
      percentageUsed
      threshold
    }
  }
`;
