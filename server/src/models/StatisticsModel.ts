import pool from '../db/index';
import { z } from 'zod';

// Zod schemas for validation
export const CreateStatisticsSchema = z.object({
  total_analyses: z.number().int().min(0, 'Total analyses must be non-negative').default(0),
  fake_news_count: z.number().int().min(0, 'Fake news count must be non-negative').default(0),
  legitimate_news_count: z.number().int().min(0, 'Legitimate news count must be non-negative').default(0),
  average_confidence: z.number().min(0, 'Average confidence must be at least 0').max(1, 'Average confidence must be at most 1').default(0)
});

export const UpdateStatisticsSchema = z.object({
  total_analyses: z.number().int().min(0, 'Total analyses must be non-negative').optional(),
  fake_news_count: z.number().int().min(0, 'Fake news count must be non-negative').optional(),
  legitimate_news_count: z.number().int().min(0, 'Legitimate news count must be non-negative').optional(),
  average_confidence: z.number().min(0, 'Average confidence must be at least 0').max(1, 'Average confidence must be at most 1').optional()
});

export const StatisticsIdSchema = z.string().uuid('Invalid statistics ID format');

export const DateRangeSchema = z.object({
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional()
});

export const StatisticsFilterSchema = z.object({
  dateRange: DateRangeSchema.optional(),
  modelUsed: z.string().max(100, 'Model name too long').optional(),
  isFake: z.boolean().optional()
});

// TypeScript interfaces derived from Zod schemas
export type Statistics = {
  id: string;
  total_analyses: number;
  fake_news_count: number;
  legitimate_news_count: number;
  average_confidence: number;
  last_updated: Date;
}

export type CreateStatisticsInput = z.infer<typeof CreateStatisticsSchema>;
export type UpdateStatisticsInput = z.infer<typeof UpdateStatisticsSchema>;

export class StatisticsModel {
  // Create new statistics entry
  static async create(input: unknown): Promise<Statistics> {
    const validatedInput = CreateStatisticsSchema.parse(input);
    const query = `
      INSERT INTO statistics (
        total_analyses, fake_news_count, legitimate_news_count, average_confidence
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      validatedInput.total_analyses,
      validatedInput.fake_news_count,
      validatedInput.legitimate_news_count,
      validatedInput.average_confidence
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all statistics
  static async getAll(): Promise<Statistics[]> {
    const query = 'SELECT * FROM statistics ORDER BY last_updated DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get statistics by ID
  static async getById(id: string): Promise<Statistics | null> {
    const validatedId = StatisticsIdSchema.parse(id);
    const query = 'SELECT * FROM statistics WHERE id = $1';
    const result = await pool.query(query, [validatedId]);
    return result.rows[0] || null;
  }

  // Get latest statistics
  static async getLatest(): Promise<Statistics | null> {
    const query = 'SELECT * FROM statistics ORDER BY last_updated DESC LIMIT 1';
    const result = await pool.query(query);
    return result.rows[0] || null;
  }

  // Update statistics
  static async update(id: string, input: unknown): Promise<Statistics | null> {
    const validatedId = StatisticsIdSchema.parse(id);
    const validatedInput = UpdateStatisticsSchema.parse(input);
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query based on provided fields
    if (validatedInput.total_analyses !== undefined) {
      fields.push(`total_analyses = $${paramCount++}`);
      values.push(validatedInput.total_analyses);
    }
    if (validatedInput.fake_news_count !== undefined) {
      fields.push(`fake_news_count = $${paramCount++}`);
      values.push(validatedInput.fake_news_count);
    }
    if (validatedInput.legitimate_news_count !== undefined) {
      fields.push(`legitimate_news_count = $${paramCount++}`);
      values.push(validatedInput.legitimate_news_count);
    }
    if (validatedInput.average_confidence !== undefined) {
      fields.push(`average_confidence = $${paramCount++}`);
      values.push(validatedInput.average_confidence);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`last_updated = NOW()`);
    values.push(validatedId);

    const query = `
      UPDATE statistics 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete statistics entry
  static async delete(id: string): Promise<boolean> {
    const validatedId = StatisticsIdSchema.parse(id);
    const query = 'DELETE FROM statistics WHERE id = $1';
    const result = await pool.query(query, [validatedId]);
    return result.rowCount > 0;
  }

  // Recalculate statistics from analyses table
  static async recalculate(): Promise<Statistics> {
    const query = 'SELECT * FROM get_analysis_stats()';
    const result = await pool.query(query);
    const stats = result.rows[0];

    // Get or create statistics entry
    let statistics = await this.getLatest();
    
    if (!statistics) {
      // Create new statistics entry
      statistics = await this.create({
        total_analyses: parseInt(stats.total_analyses),
        fake_news_count: parseInt(stats.fake_count),
        legitimate_news_count: parseInt(stats.real_count),
        average_confidence: parseFloat(stats.avg_confidence) || 0
      });
    } else {
      // Update existing statistics
      statistics = await this.update(statistics.id, {
        total_analyses: parseInt(stats.total_analyses),
        fake_news_count: parseInt(stats.fake_count),
        legitimate_news_count: parseInt(stats.real_count),
        average_confidence: parseFloat(stats.avg_confidence) || 0
      });
    }

    return statistics!;
  }

  // Get statistics summary
  static async getSummary(): Promise<{
    totalAnalyses: number;
    fakeNewsCount: number;
    legitimateNewsCount: number;
    averageConfidence: number;
    fakeNewsPercentage: number;
    lastUpdated: Date;
  }> {
    const stats = await this.getLatest();
    
    if (!stats) {
      return {
        totalAnalyses: 0,
        fakeNewsCount: 0,
        legitimateNewsCount: 0,
        averageConfidence: 0,
        fakeNewsPercentage: 0,
        lastUpdated: new Date()
      };
    }

    const fakeNewsPercentage = stats.total_analyses > 0 
      ? (stats.fake_news_count / stats.total_analyses) * 100 
      : 0;

    return {
      totalAnalyses: stats.total_analyses,
      fakeNewsCount: stats.fake_news_count,
      legitimateNewsCount: stats.legitimate_news_count,
      averageConfidence: stats.average_confidence,
      fakeNewsPercentage,
      lastUpdated: stats.last_updated
    };
  }

  // Get statistics by date range
  static async getByDateRange(params: { startDate?: string; endDate?: string }): Promise<Statistics[]> {
    const { startDate, endDate } = DateRangeSchema.parse(params);
    
    let query = 'SELECT * FROM statistics WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND last_updated >= $${paramCount++}`;
      values.push(startDate);
    }

    if (endDate) {
      query += ` AND last_updated <= $${paramCount++}`;
      values.push(endDate);
    }

    query += ' ORDER BY last_updated DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Initialize statistics table
  static async initialize(): Promise<Statistics> {
    const query = 'SELECT initialize_statistics()';
    await pool.query(query);
    
    const stats = await this.getLatest();
    if (!stats) {
      throw new Error('Failed to initialize statistics');
    }
    
    return stats;
  }

  // Get fake news detection accuracy
  static async getAccuracyMetrics(): Promise<{
    totalAnalyses: number;
    fakeNewsDetected: number;
    legitimateNewsDetected: number;
    averageConfidence: number;
    detectionAccuracy: number;
  }> {
    const stats = await this.getLatest();
    
    if (!stats || stats.total_analyses === 0) {
      return {
        totalAnalyses: 0,
        fakeNewsDetected: 0,
        legitimateNewsDetected: 0,
        averageConfidence: 0,
        detectionAccuracy: 0
      };
    }

    const detectionAccuracy = stats.average_confidence * 100;

    return {
      totalAnalyses: stats.total_analyses,
      fakeNewsDetected: stats.fake_news_count,
      legitimateNewsDetected: stats.legitimate_news_count,
      averageConfidence: stats.average_confidence,
      detectionAccuracy
    };
  }

  // Get trend data
  static async getTrendData(days: number = 30): Promise<{
    date: string;
    totalAnalyses: number;
    fakeNewsCount: number;
    averageConfidence: number;
  }[]> {
    const query = `
      SELECT 
        DATE(last_updated) as date,
        total_analyses,
        fake_news_count,
        average_confidence
      FROM statistics 
      WHERE last_updated >= NOW() - INTERVAL '${days} days'
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}
