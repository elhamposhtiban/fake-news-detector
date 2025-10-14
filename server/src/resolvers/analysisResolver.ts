import { GraphQLResolveInfo } from 'graphql';
import { AnalysisModel } from '../models/AnalysisModel';
import { BudgetModel } from '../models/BudgetModel';
import { StatisticsModel } from '../models/StatisticsModel';
import { CacheModel } from '../models/CacheModel';

// GraphQL Types
export const analysisTypeDefs = `
  type Analysis {
    id: ID!
    textContent: String!
    url: String
    isFake: Boolean!
    confidence: Float!
    explanation: String!
    suspiciousPhrases: [String!]!
    recommendations: String!
    modelUsed: String
    createdAt: String!
    updatedAt: String!
  }

  input AnalyzeTextInput {
    textContent: String!
    url: String
  }

  type AnalyzeTextResponse {
    success: Boolean!
    analysis: Analysis
    error: String
    cached: Boolean!
  }

  type AnalysisStats {
    totalAnalyses: Int!
    fakeCount: Int!
    realCount: Int!
    avgConfidence: Float!
  }

  type Query {
    # Get analysis by ID
    getAnalysis(id: ID!): Analysis
    
    # Get all analyses with pagination
    getAllAnalyses(limit: Int, offset: Int): [Analysis!]!
    
    # Get analyses by fake status
    getAnalysesByFakeStatus(isFake: Boolean!, limit: Int): [Analysis!]!
    
    # Get analyses by model used
    getAnalysesByModel(modelUsed: String!, limit: Int): [Analysis!]!
    
    # Search analyses by text content
    searchAnalyses(searchTerm: String!, limit: Int): [Analysis!]!
    
    # Get recent analyses
    getRecentAnalyses(hours: Int, limit: Int): [Analysis!]!
    
    # Get analysis statistics
    getAnalysisStats: AnalysisStats!
  }

  type Mutation {
    # Analyze text for fake news
    analyzeText(input: AnalyzeTextInput!): AnalyzeTextResponse!
    
    # Update analysis
    updateAnalysis(id: ID!, input: UpdateAnalysisInput!): Analysis
    
    # Delete analysis
    deleteAnalysis(id: ID!): Boolean!
  }

  input UpdateAnalysisInput {
    textContent: String
    url: String
    isFake: Boolean
    confidence: Float
    explanation: String
    suspiciousPhrases: [String!]
    recommendations: String
    modelUsed: String
  }
`;

// Resolver functions
export const analysisResolvers = {
  Query: {
    // Get analysis by ID
    getAnalysis: async (_: any, { id }: { id: string }) => {
      try {
        return await AnalysisModel.getById(id);
      } catch (error: any) {
        throw new Error(`Failed to get analysis: ${error.message}`);
      }
    },

    // Get all analyses with pagination
    getAllAnalyses: async (_: any, { limit, offset }: { limit?: number; offset?: number }) => {
      try {
        return await AnalysisModel.getAll({ limit, offset });
      } catch (error: any) {
        throw new Error(`Failed to get analyses: ${error.message}`);
      }
    },

    // Get analyses by fake status
    getAnalysesByFakeStatus: async (_: any, { isFake, limit }: { isFake: boolean; limit?: number }) => {
      try {
        return await AnalysisModel.getByFakeStatus(isFake, limit);
      } catch (error: any) {
        throw new Error(`Failed to get analyses by fake status: ${error.message}`);
      }
    },

    // Get analyses by model used
    getAnalysesByModel: async (_: any, { modelUsed, limit }: { modelUsed: string; limit?: number }) => {
      try {
        return await AnalysisModel.getByModel(modelUsed, limit);
      } catch (error: any) {
        throw new Error(`Failed to get analyses by model: ${error.message}`);
      }
    },

    // Search analyses by text content
    searchAnalyses: async (_: any, { searchTerm, limit }: { searchTerm: string; limit?: number }) => {
      try {
        return await AnalysisModel.searchByText({ searchTerm, limit });
      } catch (error: any) {
        throw new Error(`Failed to search analyses: ${error.message}`);
      }
    },

    // Get recent analyses
    getRecentAnalyses: async (_: any, { hours, limit }: { hours?: number; limit?: number }) => {
      try {
        return await AnalysisModel.getRecent(hours, limit);
      } catch (error: any) {
        throw new Error(`Failed to get recent analyses: ${error.message}`);
      }
    },

    // Get analysis statistics
    getAnalysisStats: async () => {
      try {
        const stats = await AnalysisModel.getStats();
        return {
          totalAnalyses: parseInt(stats.total_analyses.toString()),
          fakeCount: parseInt(stats.fake_count.toString()),
          realCount: parseInt(stats.real_count.toString()),
          avgConfidence: parseFloat(stats.avg_confidence.toString())
        };
      } catch (error: any) {
        throw new Error(`Failed to get analysis stats: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Analyze text for fake news (main functionality)
    analyzeText: async (_: any, { input }: { input: { textContent: string; url?: string } }) => {
      try {
        const { textContent, url } = input;

        // Check cache first
        const cachedResult = await CacheModel.getCachedAnalysisResult(textContent, url);
        if (cachedResult) {
          return {
            success: true,
            analysis: {
              id: 'cached-' + Date.now(), 
              textContent: textContent, 
              url: url || null, 
              isFake: cachedResult.is_fake,
              confidence: cachedResult.confidence,
              explanation: cachedResult.explanation,
              suspiciousPhrases: cachedResult.suspicious_phrases,
              recommendations: cachedResult.recommendations,
              modelUsed: cachedResult.model_used,
              createdAt: cachedResult.cached_at,
              updatedAt: cachedResult.cached_at
            },
            error: null,
            cached: true
          };
        }

        // TODO: Integrate with OpenAI API for actual fake news detection
        // For now, return a mock response
        const mockAnalysis = {
          textContent,
          url: url || null,
          isFake: Math.random() > 0.5, // Random for now
          confidence: 0.85 + Math.random() * 0.15, // 0.85-1.0
          explanation: "This is a mock analysis. OpenAI integration coming soon!",
          suspiciousPhrases: ["mock phrase 1", "mock phrase 2"],
          recommendations: "This is a mock recommendation. Please verify with OpenAI integration.",
          modelUsed: "mock-model"
        };

        // Save to database
        const savedAnalysis = await AnalysisModel.create({
          text_content: mockAnalysis.textContent,
          url: mockAnalysis.url,
          is_fake: mockAnalysis.isFake,
          confidence: mockAnalysis.confidence,
          explanation: mockAnalysis.explanation,
          suspicious_phrases: mockAnalysis.suspiciousPhrases,
          recommendations: mockAnalysis.recommendations,
          model_used: mockAnalysis.modelUsed
        });

        // Cache the result
        await CacheModel.cacheAnalysisResult({
          text: textContent,
          url,
          analysisResult: {
            is_fake: mockAnalysis.isFake,
            confidence: mockAnalysis.confidence,
            explanation: mockAnalysis.explanation,
            suspicious_phrases: mockAnalysis.suspiciousPhrases,
            recommendations: mockAnalysis.recommendations,
            model_used: mockAnalysis.modelUsed
          }
        });

        // Update budget tracking (mock cost)
        await BudgetModel.addCost(0.001); // $0.001 per analysis

        // Update statistics
        await StatisticsModel.recalculate();

        return {
          success: true,
          analysis: {
            id: savedAnalysis.id,
            textContent: savedAnalysis.text_content,
            url: savedAnalysis.url,
            isFake: savedAnalysis.is_fake,
            confidence: savedAnalysis.confidence,
            explanation: savedAnalysis.explanation,
            suspiciousPhrases: savedAnalysis.suspicious_phrases,
            recommendations: savedAnalysis.recommendations,
            modelUsed: savedAnalysis.model_used,
            createdAt: savedAnalysis.created_at.toISOString(),
            updatedAt: savedAnalysis.updated_at.toISOString()
          },
          error: null,
          cached: false
        };

      } catch (error: any) {
        console.error('Analysis error:', error);
        return {
          success: false,
          analysis: null,
          error: error.message,
          cached: false
        };
      }
    },

    // Update analysis
    updateAnalysis: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        const updatedAnalysis = await AnalysisModel.update(id, {
          text_content: input.textContent,
          url: input.url,
          is_fake: input.isFake,
          confidence: input.confidence,
          explanation: input.explanation,
          suspicious_phrases: input.suspiciousPhrases,
          recommendations: input.recommendations,
          model_used: input.modelUsed
        });

        if (!updatedAnalysis) {
          throw new Error('Analysis not found');
        }

        return {
          id: updatedAnalysis.id,
          textContent: updatedAnalysis.text_content,
          url: updatedAnalysis.url,
          isFake: updatedAnalysis.is_fake,
          confidence: updatedAnalysis.confidence,
          explanation: updatedAnalysis.explanation,
          suspiciousPhrases: updatedAnalysis.suspicious_phrases,
          recommendations: updatedAnalysis.recommendations,
          modelUsed: updatedAnalysis.model_used,
          createdAt: updatedAnalysis.created_at.toISOString(),
          updatedAt: updatedAnalysis.updated_at.toISOString()
        };
      } catch (error: any) {
        throw new Error(`Failed to update analysis: ${error.message}`);
      }
    },

    // Delete analysis
    deleteAnalysis: async (_: any, { id }: { id: string }) => {
      try {
        return await AnalysisModel.delete(id);
      } catch (error: any) {
        throw new Error(`Failed to delete analysis: ${error.message}`);
      }
    }
  }
};
