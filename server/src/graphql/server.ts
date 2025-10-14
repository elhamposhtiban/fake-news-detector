import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Request, Response } from 'express';
import { Server } from 'http';

// Import our combined schema and resolvers
import typeDefs from './schema';
import resolvers from './resolvers';

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Apollo Server configuration
export const createApolloServer = async (httpServer: Server) => {
  const server = new ApolloServer({
    schema,
    plugins: [
      // Graceful shutdown
      ApolloServerPluginDrainHttpServer({ httpServer }),
      
      // Development landing page
      ApolloServerPluginLandingPageLocalDefault({ 
        embed: true,
        includeCookies: true 
      }),
      
      // Performance tracing
      ApolloServerPluginInlineTrace()
    ],
    
    // Context function - provides context to all resolvers
    context: async ({ req, res }: { req: Request; res: Response }) => {
      return {
        // Add any context data here (user info, database connections, etc.)
        req,
        res,
        // You can add user authentication, database connections, etc.
        // user: await getUserFromToken(req.headers.authorization),
        // db: databaseConnection,
      };
    },
    
    // Error formatting
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      
      // Don't expose internal errors in production
      if (process.env.NODE_ENV === 'production') {
        return {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        };
      }
      
      // In development, return full error details
      return {
        message: error.message,
        code: error.extensions?.code || 'UNKNOWN_ERROR',
        path: error.path,
        locations: error.locations
      };
    },
    
    // Introspection and playground settings
    introspection: process.env.NODE_ENV !== 'production',
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production'
  });

  return server;
};

// Express middleware for Apollo Server
export const createApolloMiddleware = (server: ApolloServer) => {
  return expressMiddleware(server, {
    // Context function for Express middleware
    context: async ({ req, res }) => {
      return {
        req,
        res,
        // Add any additional context here
        // user: await getUserFromToken(req.headers.authorization),
      };
    }
  });
};

// Health check for GraphQL server
export const graphqlHealthCheck = async (server: ApolloServer) => {
  try {
    // Test the schema by running a simple introspection query
    const result = await server.executeOperation({
      query: `
        query {
          __schema {
            queryType {
              name
            }
          }
        }
      `
    });
    
    return {
      status: 'healthy',
      message: 'GraphQL server is running',
      schema: result.body.kind === 'single' ? 'valid' : 'invalid'
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      message: `GraphQL server error: ${error.message}`,
      error: error.message
    };
  }
};

export default createApolloServer;
