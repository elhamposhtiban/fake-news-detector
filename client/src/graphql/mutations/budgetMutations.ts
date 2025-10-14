import { gql } from '@apollo/client';

// Budget Mutations
export const CREATE_BUDGET = gql`
  mutation CreateBudget($input: CreateBudgetInput!) {
    createBudget(input: $input) {
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

export const UPDATE_BUDGET = gql`
  mutation UpdateBudget($id: ID!, $input: UpdateBudgetInput!) {
    updateBudget(id: $id, input: $input) {
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

export const DELETE_BUDGET = gql`
  mutation DeleteBudget($id: ID!) {
    deleteBudget(id: $id)
  }
`;

export const ADD_COST = gql`
  mutation AddCost($input: AddCostInput!) {
    addCost(input: $input) {
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

export const RESET_FOR_NEW_MONTH = gql`
  mutation ResetForNewMonth($monthYear: String!, $budgetAmount: Float) {
    resetForNewMonth(monthYear: $monthYear, budgetAmount: $budgetAmount) {
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
