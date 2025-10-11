import pool from '../../db/index';
import { z } from 'zod';

// Zod schemas for validation
export const CreateAnalysisSchema = z.object({
  text_content: z.string().min(1, 'Text content is required').max(10000, 'Text content too long'),
  url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  is_fake: z.boolean(),
  confidence: z.number().min(0, 'Confidence must be at least 0').max(1, 'Confidence must be at most 1'),
  explanation: z.string().min(1, 'Explanation is required').max(2000, 'Explanation too long'),
  suspicious_phrases: z.array(z.string()).default([]),
  recommendations: z.string().min(1, 'Recommendations are required').max(1000, 'Recommendations too long'),
  model_used: z.string().max(100, 'Model name too long').optional()
});

export const UpdateAnalysisSchema = z.object({
  text_content: z.string().min(1, 'Text content is required').max(10000, 'Text content too long').optional(),
  url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  is_fake: z.boolean().optional(),
  confidence: z.number().min(0, 'Confidence must be at least 0').max(1, 'Confidence must be at most 1').optional(),
  explanation: z.string().min(1, 'Explanation is required').max(2000, 'Explanation too long').optional(),
  suspicious_phrases: z.array(z.string()).optional(),
  recommendations: z.string().min(1, 'Recommendations are required').max(1000, 'Recommendations too long').optional(),
  model_used: z.string().max(100, 'Model name too long').optional()
});

export const AnalysisIdSchema = z.string().uuid('Invalid analysis ID format');

export const SearchAnalysisSchema = z.object({
  searchTerm: z.string().min(1, 'Search term is required').max(100, 'Search term too long'),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit too high').default(20)
});

export const PaginationSchema = z.object({
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit too high').default(50),
  offset: z.number().min(0, 'Offset must be non-negative').default(0)
});

// TypeScript interfaces derived from Zod schemas
export type Analysis = {
  id: string;
  text_content: string;
  url?: string;
  is_fake: boolean;
  confidence: number;
  explanation: string;
  suspicious_phrases: string[];
  recommendations: string;
  model_used?: string;
  created_at: Date;
  updated_at: Date;
}

// TypeScript types derived from Zod schemas
export type CreateAnalysisInput = z.infer<typeof CreateAnalysisSchema>;
export type UpdateAnalysisInput = z.infer<typeof UpdateAnalysisSchema>;

export class AnalysisModel {
  // Create a new analysis
  static async create(input: unknown): Promise<Analysis> {
    // Validate input with Zod
    const validatedInput = CreateAnalysisSchema.parse(input);
    const query = `
      INSERT INTO analyses (
        text_content, url, is_fake, confidence, explanation, 
        suspicious_phrases, recommendations, model_used
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      validatedInput.text_content,
      validatedInput.url || null,
      validatedInput.is_fake,
      validatedInput.confidence,
      validatedInput.explanation,
      validatedInput.suspicious_phrases,
      validatedInput.recommendations,
      validatedInput.model_used || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all analyses
  static async getAll(params: { limit?: number; offset?: number } = {}): Promise<Analysis[]> {
    const { limit = 50, offset = 0 } = PaginationSchema.parse(params);
    const query = `
      SELECT * FROM analyses 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Get analysis by ID
  static async getById(id: string): Promise<Analysis | null> {
    const validatedId = AnalysisIdSchema.parse(id);
    const query = 'SELECT * FROM analyses WHERE id = $1';
    const result = await pool.query(query, [validatedId]);
    return result.rows[0] || null;
  }

  // Get analyses by fake status
  static async getByFakeStatus(isFake: boolean, limit: number = 50): Promise<Analysis[]> {
    const query = `
      SELECT * FROM analyses 
      WHERE is_fake = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    
    const result = await pool.query(query, [isFake, limit]);
    return result.rows;
  }

  // Get analyses by model used
  static async getByModel(modelUsed: string, limit: number = 50): Promise<Analysis[]> {
    const query = `
      SELECT * FROM analyses 
      WHERE model_used = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    
    const result = await pool.query(query, [modelUsed, limit]);
    return result.rows;
  }

  // Update analysis
  static async update(id: string, input: unknown): Promise<Analysis | null> {
    const validatedId = AnalysisIdSchema.parse(id);
    const validatedInput = UpdateAnalysisSchema.parse(input);
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query based on provided fields
    if (validatedInput.text_content !== undefined) {
      fields.push(`text_content = $${paramCount++}`);
      values.push(validatedInput.text_content);
    }
    if (validatedInput.url !== undefined) {
      fields.push(`url = $${paramCount++}`);
      values.push(validatedInput.url);
    }
    if (validatedInput.is_fake !== undefined) {
      fields.push(`is_fake = $${paramCount++}`);
      values.push(validatedInput.is_fake);
    }
    if (validatedInput.confidence !== undefined) {
      fields.push(`confidence = $${paramCount++}`);
      values.push(validatedInput.confidence);
    }
    if (validatedInput.explanation !== undefined) {
      fields.push(`explanation = $${paramCount++}`);
      values.push(validatedInput.explanation);
    }
    if (validatedInput.suspicious_phrases !== undefined) {
      fields.push(`suspicious_phrases = $${paramCount++}`);
      values.push(validatedInput.suspicious_phrases);
    }
    if (validatedInput.recommendations !== undefined) {
      fields.push(`recommendations = $${paramCount++}`);
      values.push(validatedInput.recommendations);
    }
    if (validatedInput.model_used !== undefined) {
      fields.push(`model_used = $${paramCount++}`);
      values.push(validatedInput.model_used);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(validatedId);

    const query = `
      UPDATE analyses 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete analysis
  static async delete(id: string): Promise<boolean> {
    const validatedId = AnalysisIdSchema.parse(id);
    const query = 'DELETE FROM analyses WHERE id = $1';
    const result = await pool.query(query, [validatedId]);
    return result.rowCount > 0;
  }

  // Get analysis statistics
  static async getStats(): Promise<{
    total_analyses: number;
    fake_count: number;
    real_count: number;
    avg_confidence: number;
  }> {
    const query = 'SELECT * FROM get_analysis_stats()';
    const result = await pool.query(query);
    return result.rows[0];
  }

  // Search analyses by text content
  static async searchByText(params: { searchTerm: string; limit?: number }): Promise<Analysis[]> {
    const { searchTerm, limit = 20 } = SearchAnalysisSchema.parse(params);
    const query = `
      SELECT * FROM analyses 
      WHERE text_content ILIKE $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  // Get recent analyses
  static async getRecent(hours: number = 24, limit: number = 20): Promise<Analysis[]> {
    const query = `
      SELECT * FROM analyses 
      WHERE created_at >= NOW() - INTERVAL '${hours} hours'
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}
