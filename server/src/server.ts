import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { testRedisConnection } from './services/redis';
import { apiRateLimit } from './middleware/rateLimit';

const app = express();

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

// Placeholder GraphQL endpoint
app.post('/graphql', (req, res) => {
  res.json({ 
    message: 'GraphQL endpoint - coming soon!',
    data: null
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(config.port, async () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🔗 GraphQL endpoint: http://localhost:${config.port}/graphql`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  
  // Test Redis connection
  await testRedisConnection();
});

export default app;
