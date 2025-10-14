import { gql } from '@apollo/client';

// Analysis Queries
export const GET_ANALYSIS = gql`
  query GetAnalysis($id: ID!) {
    getAnalysis(id: $id) {
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

export const GET_ALL_ANALYSES = gql`
  query GetAllAnalyses($limit: Int, $offset: Int) {
    getAllAnalyses(limit: $limit, offset: $offset) {
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

export const GET_ANALYSES_BY_FAKE_STATUS = gql`
  query GetAnalysesByFakeStatus($isFake: Boolean!, $limit: Int) {
    getAnalysesByFakeStatus(isFake: $isFake, limit: $limit) {
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

export const GET_ANALYSES_BY_MODEL = gql`
  query GetAnalysesByModel($modelUsed: String!, $limit: Int) {
    getAnalysesByModel(modelUsed: $modelUsed, limit: $limit) {
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

export const SEARCH_ANALYSES = gql`
  query SearchAnalyses($searchTerm: String!, $limit: Int) {
    searchAnalyses(searchTerm: $searchTerm, limit: $limit) {
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

export const GET_RECENT_ANALYSES = gql`
  query GetRecentAnalyses($hours: Int, $limit: Int) {
    getRecentAnalyses(hours: $hours, limit: $limit) {
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

export const GET_ANALYSIS_STATS = gql`
  query GetAnalysisStats {
    getAnalysisStats {
      totalAnalyses
      fakeCount
      realCount
      avgConfidence
    }
  }
`;
