import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { config } from './config';
import { testRedisConnection } from './services/redis';
import { apiRateLimit } from './middleware/rateLimit';
import { createApolloServer, createApolloMiddleware, graphqlHealthCheck } from './graphql/server';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

// Rate limiting middleware
app.use('/api', apiRateLimit);
app.use('/graphql', apiRateLimit);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fake News Detector API is running',
    timestamp: new Date().toISOString()
  });
});

// Test Redis connection endpoint
app.get('/api/test-redis', async (req, res) => {
  try {
    const { testRedisConnection, cacheAnalysis, getCachedAnalysis } = await import('./services/redis');
    
    // Test Redis connection
    const isConnected = await testRedisConnection();
    
    if (isConnected) {
      // Test caching
      await cacheAnalysis('test-key', { message: 'Redis is working!' }, 60);
      const cached = await getCachedAnalysis('test-key');
      
      res.json({
        status: 'OK',
        redis: 'Connected',
        cacheTest: cached ? 'Working' : 'Failed',
        message: 'Redis connection and caching are working!'
      });
    } else {
      res.status(500).json({
        status: 'Error',
        redis: 'Not Connected',
        message: 'Redis connection failed'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      redis: 'Error',
      message: error.message
    });
  }
});

// GraphQL health check endpoint
app.get('/api/graphql-health', async (req, res) => {
  try {
    const health = await graphqlHealthCheck(apolloServer);
    res.json(health);
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      message: `GraphQL health check failed: ${error.message}`,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Initialize Apollo Server and start the server
const startServer = async () => {
  try {
    // Create Apollo Server
    const apolloServer = await createApolloServer(httpServer);
    
    // Start Apollo Server
    await apolloServer.start();
    
    // Apply Apollo Server middleware to Express
    app.use('/graphql', createApolloMiddleware(apolloServer));
    
    // Start HTTP server
    httpServer.listen(config.port, async () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/api/health`);
      console.log(`🔗 GraphQL endpoint: http://localhost:${config.port}/graphql`);
      console.log(`🎮 GraphQL Playground: http://localhost:${config.port}/graphql`);
      console.log(`🔍 GraphQL Health: http://localhost:${config.port}/api/graphql-health`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      
      // Test Redis connection
      await testRedisConnection();
      
      console.log('✅ Apollo Server started successfully!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
