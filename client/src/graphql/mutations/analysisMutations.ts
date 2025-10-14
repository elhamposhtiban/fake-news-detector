import { gql } from '@apollo/client';

// Analysis Mutations
export const ANALYZE_TEXT = gql`
  mutation AnalyzeText($input: AnalyzeTextInput!) {
    analyzeText(input: $input) {
      success
      analysis {
        id
        textContent
        url
        isFake
        confidence
        explanation
        suspiciousPhrases
        recommendations
        modelUsed
        createdAt
        updatedAt
      }
      error
      cached
    }
  }
`;

export const UPDATE_ANALYSIS = gql`
  mutation UpdateAnalysis($id: ID!, $input: UpdateAnalysisInput!) {
    updateAnalysis(id: $id, input: $input) {
      id
      textContent
      url
      isFake
      confidence
      explanation
      suspiciousPhrases
      recommendations
      modelUsed
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_ANALYSIS = gql`
  mutation DeleteAnalysis($id: ID!) {
    deleteAnalysis(id: $id)
  }
`;
