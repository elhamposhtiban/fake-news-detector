import { GraphQLResolveInfo } from 'graphql';
import { BudgetModel } from '../models/BudgetModel';
import { AnalysisModel } from '../models/AnalysisModel';

// GraphQL Types
export const budgetTypeDefs = `
  type BudgetTracking {
    id: ID!
    monthYear: String!
    totalUsed: Float!
    totalRemaining: Float!
    percentageUsed: Float!
    createdAt: String!
    updatedAt: String!
  }

  input CreateBudgetInput {
    monthYear: String!
    totalUsed: Float
    totalRemaining: Float!
    percentageUsed: Float
  }

  input UpdateBudgetInput {
    totalUsed: Float
    totalRemaining: Float
    percentageUsed: Float
  }

  input AddCostInput {
    amount: Float!
  }

  type BudgetStatus {
    exceeded: Boolean!
    currentBudget: BudgetTracking
    percentageUsed: Float!
    threshold: Float!
  }

  type BudgetSummary {
    currentMonth: BudgetTracking
    monthlyTrend: [BudgetTracking!]!
    totalSpent: Float!
    averageMonthlySpend: Float!
    projectedAnnualCost: Float!
  }

  type UsageTrend {
    monthYear: String!
    totalUsed: Float!
    percentageUsed: Float!
  }

  type Query {
    # Get budget by ID
    getBudget(id: ID!): BudgetTracking
    
    # Get all budget entries
    getAllBudgets(limit: Int, offset: Int): [BudgetTracking!]!
    
    # Get budget by month/year
    getBudgetByMonthYear(monthYear: String!): BudgetTracking
    
    # Get current month's budget
    getCurrentMonthBudget: BudgetTracking
    
    # Get budget summary for multiple months
    getBudgetSummary(months: Int): BudgetSummary!
    
    # Get budget usage trend
    getUsageTrend(months: Int): [UsageTrend!]!
    
    # Check if budget is exceeded
    isBudgetExceeded(threshold: Float): BudgetStatus!
  }

  type Mutation {
    # Create new budget entry
    createBudget(input: CreateBudgetInput!): BudgetTracking!
    
    # Update budget
    updateBudget(id: ID!, input: UpdateBudgetInput!): BudgetTracking
    
    # Delete budget entry
    deleteBudget(id: ID!): Boolean!
    
    # Add cost to current month's budget
    addCost(input: AddCostInput!): BudgetTracking!
    
    # Reset budget for new month
    resetForNewMonth(monthYear: String!, budgetAmount: Float): BudgetTracking!
  }
`;

// Resolver functions
export const budgetResolvers = {
  Query: {
    // Get budget by ID
    getBudget: async (_: any, { id }: { id: string }) => {
      try {
        return await BudgetModel.getById(id);
      } catch (error: any) {
        throw new Error(`Failed to get budget: ${error.message}`);
      }
    },

    // Get all budget entries
    getAllBudgets: async (_: any, { limit, offset }: { limit?: number; offset?: number }) => {
      try {
        return await BudgetModel.getAll({ limit, offset });
      } catch (error: any) {
        throw new Error(`Failed to get budgets: ${error.message}`);
      }
    },

    // Get budget by month/year
    getBudgetByMonthYear: async (_: any, { monthYear }: { monthYear: string }) => {
      try {
        return await BudgetModel.getByMonthYear(monthYear);
      } catch (error: any) {
        throw new Error(`Failed to get budget by month: ${error.message}`);
      }
    },

    // Get current month's budget
    getCurrentMonthBudget: async () => {
      try {
        const currentBudget = await BudgetModel.getCurrentMonth();
        
        // If no budget exists for current month, create a default one
        if (!currentBudget) {
          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
          const defaultBudget = await BudgetModel.create({
            month_year: currentMonth,
            total_used: 0,
            total_remaining: 25.0, // Default $25 budget
            percentage_used: 0
          });
          return defaultBudget;
        }
        
        return currentBudget;
      } catch (error: any) {
        throw new Error(`Failed to get current month budget: ${error.message}`);
      }
    },

    // Get budget summary for multiple months
    getBudgetSummary: async (_: any, { months = 6 }: { months?: number }) => {
      try {
        const budgets = await BudgetModel.getBudgetSummary(months);
        const currentMonth = await BudgetModel.getCurrentMonth();
        
        // Calculate summary metrics
        const totalSpent = budgets.reduce((sum, budget) => sum + budget.total_used, 0);
        const averageMonthlySpend = budgets.length > 0 ? totalSpent / budgets.length : 0;
        const projectedAnnualCost = averageMonthlySpend * 12;

        return {
          currentMonth: currentMonth ? {
            id: currentMonth.id,
            monthYear: currentMonth.month_year,
            totalUsed: currentMonth.total_used,
            totalRemaining: currentMonth.total_remaining,
            percentageUsed: currentMonth.percentage_used,
            createdAt: currentMonth.created_at.toISOString(),
            updatedAt: currentMonth.updated_at.toISOString()
          } : null,
          monthlyTrend: budgets.map(budget => ({
            id: budget.id,
            monthYear: budget.month_year,
            totalUsed: budget.total_used,
            totalRemaining: budget.total_remaining,
            percentageUsed: budget.percentage_used,
            createdAt: budget.created_at.toISOString(),
            updatedAt: budget.updated_at.toISOString()
          })),
          totalSpent,
          averageMonthlySpend,
          projectedAnnualCost
        };
      } catch (error: any) {
        throw new Error(`Failed to get budget summary: ${error.message}`);
      }
    },

    // Get budget usage trend
    getUsageTrend: async (_: any, { months = 12 }: { months?: number }) => {
      try {
        const trend = await BudgetModel.getUsageTrend(months);
        return trend.map(item => ({
          monthYear: item.month_year,
          totalUsed: item.total_used,
          percentageUsed: item.percentage_used
        }));
      } catch (error: any) {
        throw new Error(`Failed to get usage trend: ${error.message}`);
      }
    },

    // Check if budget is exceeded
    isBudgetExceeded: async (_: any, { threshold = 90 }: { threshold?: number }) => {
      try {
        const result = await BudgetModel.isBudgetExceeded(threshold);
        return {
          exceeded: result.exceeded,
          currentBudget: result.currentBudget ? {
            id: result.currentBudget.id,
            monthYear: result.currentBudget.month_year,
            totalUsed: result.currentBudget.total_used,
            totalRemaining: result.currentBudget.total_remaining,
            percentageUsed: result.currentBudget.percentage_used,
            createdAt: result.currentBudget.created_at.toISOString(),
            updatedAt: result.currentBudget.updated_at.toISOString()
          } : null,
          percentageUsed: result.percentageUsed,
          threshold
        };
      } catch (error: any) {
        throw new Error(`Failed to check budget status: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Create new budget entry
    createBudget: async (_: any, { input }: { input: any }) => {
      try {
        const budget = await BudgetModel.create({
          month_year: input.monthYear,
          total_used: input.totalUsed || 0,
          total_remaining: input.totalRemaining,
          percentage_used: input.percentageUsed || 0
        });

        return {
          id: budget.id,
          monthYear: budget.month_year,
          totalUsed: budget.total_used,
          totalRemaining: budget.total_remaining,
          percentageUsed: budget.percentage_used,
          createdAt: budget.created_at.toISOString(),
          updatedAt: budget.updated_at.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to create budget: ${error.message}`);
      }
    },

    // Update budget
    updateBudget: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        const updatedBudget = await BudgetModel.update(id, {
          total_used: input.totalUsed,
          total_remaining: input.totalRemaining,
          percentage_used: input.percentageUsed
        });

        if (!updatedBudget) {
          throw new Error('Budget not found');
        }

        return {
          id: updatedBudget.id,
          monthYear: updatedBudget.month_year,
          totalUsed: updatedBudget.total_used,
          totalRemaining: updatedBudget.total_remaining,
          percentageUsed: updatedBudget.percentage_used,
          createdAt: updatedBudget.created_at.toISOString(),
          updatedAt: updatedBudget.updated_at.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to update budget: ${error.message}`);
      }
    },

    // Delete budget entry
    deleteBudget: async (_: any, { id }: { id: string }) => {
      try {
        return await BudgetModel.delete(id);
      } catch (error: any) {
        throw new Error(`Failed to delete budget: ${error.message}`);
      }
    },

    // Add cost to current month's budget
    addCost: async (_: any, { input }: { input: { amount: number } }) => {
      try {
        const budget = await BudgetModel.addCost(input.amount);
        
        if (!budget) {
          throw new Error('Failed to add cost to budget');
        }

        return {
          id: budget.id,
          monthYear: budget.month_year,
          totalUsed: budget.total_used,
          totalRemaining: budget.total_remaining,
          percentageUsed: budget.percentage_used,
          createdAt: budget.created_at.toISOString(),
          updatedAt: budget.updated_at.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to add cost: ${error.message}`);
      }
    },

    // Reset budget for new month
    resetForNewMonth: async (_: any, { monthYear, budgetAmount = 25 }: { monthYear: string; budgetAmount?: number }) => {
      try {
        const budget = await BudgetModel.resetForNewMonth(monthYear, budgetAmount);
        
        return {
          id: budget.id,
          monthYear: budget.month_year,
          totalUsed: budget.total_used,
          totalRemaining: budget.total_remaining,
          percentageUsed: budget.percentage_used,
          createdAt: budget.created_at.toISOString(),
          updatedAt: budget.updated_at.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to reset budget for new month: ${error.message}`);
      }
    }
  }
};
