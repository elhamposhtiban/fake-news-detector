import { useMutation, useQuery } from '@apollo/client';
import { 
  ANALYZE_TEXT, 
  GET_BUDGET_STATUS, 
  GET_STATISTICS,
  GET_CACHE_STATUS,
  AnalyzeInput,
  AnalysisResult,
  BudgetStatus,
  Statistics,
  CacheStatus
} from '../graphql/queries';

// Custom hook for text analysis
export const useAnalyzeText = () => {
  return useMutation(ANALYZE_TEXT, {
    refetchQueries: ['GetBudgetStatus', 'GetStatistics'],
    awaitRefetchQueries: true,
  });
};

// Custom hook for budget status
export const useBudgetStatus = () => {
  return useQuery<{ budgetStatus: BudgetStatus }>(GET_BUDGET_STATUS, {
    pollInterval: 30000, // Poll every 30 seconds
    errorPolicy: 'all',
  });
};

// Custom hook for statistics
export const useStatistics = () => {
  return useQuery<{ statistics: Statistics }>(GET_STATISTICS, {
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
};

// Custom hook for cache status
export const useCacheStatus = () => {
  return useQuery<{ cacheStatus: CacheStatus }>(GET_CACHE_STATUS, {
    pollInterval: 60000, // Poll every minute
    errorPolicy: 'all',
  });
};

// Main analysis hook
export const useAnalysis = () => {
  const [analyzeTextMutation] = useAnalyzeText();
  const { data: budgetData, loading: budgetLoading } = useBudgetStatus();
  
  const analyzeText = async (text: string, url?: string) => {
    try {
      const result = await analyzeTextMutation({
        variables: {
          input: { text, url }
        }
      });
      
      return result.data?.analyzeText;
    } catch (error: any) {
      if (error.message?.includes('BUDGET_EXCEEDED')) {
        throw new Error('Service temporarily unavailable due to budget limits. Please try again later.');
      }
      throw new Error('Analysis failed. Please try again.');
    }
  };
  
  return {
    analyzeText,
    budgetStatus: budgetData?.budgetStatus,
    isBudgetLoading: budgetLoading,
  };
};
