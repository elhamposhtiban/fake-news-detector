import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiMonthlyBudget: parseFloat(process.env.OPENAI_MONTHLY_BUDGET || '25'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379'),
  redisPassword: process.env.REDIS_PASSWORD || '',
};

// Debug: Log the Redis configuration to see what's being loaded
console.log('🔍 Redis Config Debug:');
console.log('REDIS_HOST:', process.env.REDIS_HOST || 'NOT SET');
console.log('REDIS_PORT:', process.env.REDIS_PORT || 'NOT SET');
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***SET***' : 'NOT SET');
console.log('Final config.redisHost:', config.redisHost);
console.log('Final config.redisPort:', config.redisPort);
