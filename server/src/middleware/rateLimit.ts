import { Request, Response, NextFunction } from 'express';
import { checkRateLimit } from '../services/redis';

// Rate limiting middleware
export const rateLimitMiddleware = (limit: number = 10, timeWindow: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get client IP address
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Check rate limit
      const rateLimitResult = await checkRateLimit(clientIP, limit, timeWindow);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      });
      
      if (!rateLimitResult.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${limit} requests per ${timeWindow} seconds`,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // If rate limiting fails, allow the request (fail open)
      next();
    }
  };
};

// Different rate limits for different endpoints
export const analysisRateLimit = rateLimitMiddleware(10, 3600); // 10 requests per hour
export const apiRateLimit = rateLimitMiddleware(100, 3600); // 100 requests per hour
export const strictRateLimit = rateLimitMiddleware(5, 3600); // 5 requests per hour for expensive operations
