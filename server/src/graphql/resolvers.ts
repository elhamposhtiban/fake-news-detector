import { GraphQLResolveInfo } from 'graphql';

// Import all resolver functions
import { analysisResolvers } from '../resolvers/analysisResolver';
import { budgetResolvers } from '../resolvers/budgetResolver';
import { statisticsResolvers } from '../resolvers/statisticsResolver';
import { cacheResolvers } from '../resolvers/cacheResolver';

// Main Resolver - combines all resolver functions
export const resolvers = {
  // Combine all Query resolvers
  Query: {
    // Analysis Queries
    ...analysisResolvers.Query,
    
    // Budget Queries
    ...budgetResolvers.Query,
    
    // Statistics Queries
    ...statisticsResolvers.Query,
    
    // Cache Queries
    ...cacheResolvers.Query
  },

  // Combine all Mutation resolvers
  Mutation: {
    // Analysis Mutations
    ...analysisResolvers.Mutation,
    
    // Budget Mutations
    ...budgetResolvers.Mutation,
    
    // Statistics Mutations
    ...statisticsResolvers.Mutation,
    
    // Cache Mutations
    ...cacheResolvers.Mutation
  },

  // Custom scalar resolvers
  Date: {
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value)
  },

  JSON: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => ast.value
  }
};

// Export the combined resolvers
export default resolvers;
