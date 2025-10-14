import { gql } from '@apollo/client';

// Statistics Mutations
export const CREATE_STATISTICS = gql`
  mutation CreateStatistics($input: CreateStatisticsInput!) {
    createStatistics(input: $input) {
      id
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      lastUpdated
    }
  }
`;

export const UPDATE_STATISTICS = gql`
  mutation UpdateStatistics($id: ID!, $input: UpdateStatisticsInput!) {
    updateStatistics(id: $id, input: $input) {
      id
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      lastUpdated
    }
  }
`;

export const DELETE_STATISTICS = gql`
  mutation DeleteStatistics($id: ID!) {
    deleteStatistics(id: $id)
  }
`;

export const RECALCULATE_STATISTICS = gql`
  mutation RecalculateStatistics {
    recalculateStatistics {
      id
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      lastUpdated
    }
  }
`;

export const INITIALIZE_STATISTICS = gql`
  mutation InitializeStatistics {
    initializeStatistics {
      id
      totalAnalyses
      fakeNewsCount
      legitimateNewsCount
      averageConfidence
      lastUpdated
    }
  }
`;
