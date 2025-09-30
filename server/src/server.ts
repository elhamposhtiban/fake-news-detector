import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fake News Detector API is running',
    timestamp: new Date().toISOString()
  });
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
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🔗 GraphQL endpoint: http://localhost:${config.port}/graphql`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

export default app;
