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
