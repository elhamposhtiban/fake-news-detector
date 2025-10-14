import { useMutation, useQuery } from '@apollo/client';
import { 
  ANALYZE_TEXT,
  GET_CURRENT_MONTH_BUDGET,
  GET_STATISTICS_SUMMARY,
  GET_CACHE_STATS,
  AnalyzeTextInput,
  AnalyzeTextResponse,
  BudgetTracking,
  StatisticsSummary,
  CacheStats
} from '../graphql';

// Custom hook for text analysis
export const useAnalyzeText = () => {
  return useMutation(ANALYZE_TEXT, {
    refetchQueries: ['GetCurrentMonthBudget', 'GetStatisticsSummary'],
    awaitRefetchQueries: true,
  });
};

// Custom hook for budget status
export const useBudgetStatus = () => {
  return useQuery<{ getCurrentMonthBudget: BudgetTracking }>(GET_CURRENT_MONTH_BUDGET, {
    pollInterval: 30000, // Poll every 30 seconds
    errorPolicy: 'all',
  });
};

// Custom hook for statistics
export const useStatistics = () => {
  return useQuery<{ getStatisticsSummary: StatisticsSummary }>(GET_STATISTICS_SUMMARY, {
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
};

// Custom hook for cache status
export const useCacheStatus = () => {
  return useQuery<{ getCacheStats: CacheStats }>(GET_CACHE_STATS, {
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
          input: { textContent: text, url }
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
    budgetStatus: budgetData?.getCurrentMonthBudget,
    isBudgetLoading: budgetLoading,
  };
};
