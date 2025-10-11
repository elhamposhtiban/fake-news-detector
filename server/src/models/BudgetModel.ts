import pool from '../db/index';
import { z } from 'zod';

// Zod schemas for validation
export const CreateBudgetSchema = z.object({
  month_year: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  total_used: z.number().min(0, 'Total used must be non-negative').default(0),
  total_remaining: z.number().min(0, 'Total remaining must be non-negative'),
  percentage_used: z.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage must be at most 100').default(0)
});

export const UpdateBudgetSchema = z.object({
  total_used: z.number().min(0, 'Total used must be non-negative').optional(),
  total_remaining: z.number().min(0, 'Total remaining must be non-negative').optional(),
  percentage_used: z.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage must be at most 100').optional()
});

export const BudgetIdSchema = z.string().uuid('Invalid budget ID format');
export const MonthYearSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format');

export const BudgetPaginationSchema = z.object({
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit too high').default(50),
  offset: z.number().min(0, 'Offset must be non-negative').default(0)
});

export const AddCostSchema = z.object({
  amount: z.number().min(0, 'Amount must be non-negative')
});

export const BudgetThresholdSchema = z.object({
  threshold: z.number().min(0, 'Threshold must be at least 0').max(100, 'Threshold must be at most 100').default(90)
});

// TypeScript interfaces derived from Zod schemas
export type BudgetTracking = {
  id: string;
  month_year: string;
  total_used: number;
  total_remaining: number;
  percentage_used: number;
  created_at: Date;
  updated_at: Date;
}

// TypeScript types derived from Zod schemas
export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;

export class BudgetModel {
  // Create a new budget entry
  static async create(input: unknown): Promise<BudgetTracking> {
    const validatedInput = CreateBudgetSchema.parse(input);
    const query = `
      INSERT INTO budget_tracking (
        month_year, total_used, total_remaining, percentage_used
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      validatedInput.month_year,
      validatedInput.total_used,
      validatedInput.total_remaining,
      validatedInput.percentage_used
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all budget entries
  static async getAll(params: { limit?: number; offset?: number } = {}): Promise<BudgetTracking[]> {
    const { limit = 50, offset = 0 } = BudgetPaginationSchema.parse(params);
    const query = `
      SELECT * FROM budget_tracking 
      ORDER BY month_year DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Get budget by ID
  static async getById(id: string): Promise<BudgetTracking | null> {
    const validatedId = BudgetIdSchema.parse(id);
    const query = 'SELECT * FROM budget_tracking WHERE id = $1';
    const result = await pool.query(query, [validatedId]);
    return result.rows[0] || null;
  }

  // Get budget by month/year
  static async getByMonthYear(monthYear: string): Promise<BudgetTracking | null> {
    const validatedMonthYear = MonthYearSchema.parse(monthYear);
    const query = 'SELECT * FROM budget_tracking WHERE month_year = $1';
    const result = await pool.query(query, [validatedMonthYear]);
    return result.rows[0] || null;
  }

  // Get current month's budget
  static async getCurrentMonth(): Promise<BudgetTracking | null> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    return this.getByMonthYear(currentMonth);
  }

  // Update budget
  static async update(id: string, input: unknown): Promise<BudgetTracking | null> {
    const validatedId = BudgetIdSchema.parse(id);
    const validatedInput = UpdateBudgetSchema.parse(input);
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query based on provided fields
    if (validatedInput.total_used !== undefined) {
      fields.push(`total_used = $${paramCount++}`);
      values.push(validatedInput.total_used);
    }
    if (validatedInput.total_remaining !== undefined) {
      fields.push(`total_remaining = $${paramCount++}`);
      values.push(validatedInput.total_remaining);
    }
    if (validatedInput.percentage_used !== undefined) {
      fields.push(`percentage_used = $${paramCount++}`);
      values.push(validatedInput.percentage_used);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(validatedId);

    const query = `
      UPDATE budget_tracking 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete budget entry
  static async delete(id: string): Promise<boolean> {
    const validatedId = BudgetIdSchema.parse(id);
    const query = 'DELETE FROM budget_tracking WHERE id = $1';
    const result = await pool.query(query, [validatedId]);
    return result.rowCount > 0;
  }

  // Add cost to current month's budget
  static async addCost(amount: number): Promise<BudgetTracking | null> {
    const { amount: validatedAmount } = AddCostSchema.parse({ amount });
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Try to get existing budget for current month
    let budget = await this.getByMonthYear(currentMonth);
    
    if (!budget) {
      // Create new budget entry for current month
      budget = await this.create({
        month_year: currentMonth,
        total_used: validatedAmount,
        total_remaining: 25 - validatedAmount, // Assuming $25 monthly budget
        percentage_used: (validatedAmount / 25) * 100
      });
    } else {
      // Update existing budget
      const newTotalUsed = budget.total_used + validatedAmount;
      const newTotalRemaining = budget.total_remaining - validatedAmount;
      const newPercentageUsed = (newTotalUsed / (newTotalUsed + newTotalRemaining)) * 100;
      
      budget = await this.update(budget.id, {
        total_used: newTotalUsed,
        total_remaining: newTotalRemaining,
        percentage_used: newPercentageUsed
      });
    }
    
    return budget;
  }

  // Get budget summary for multiple months
  static async getBudgetSummary(months: number = 6): Promise<BudgetTracking[]> {
    const query = `
      SELECT * FROM budget_tracking 
      ORDER BY month_year DESC 
      LIMIT $1
    `;
    
    const result = await pool.query(query, [months]);
    return result.rows;
  }

  // Check if budget is exceeded
  static async isBudgetExceeded(threshold: number = 90): Promise<{
    exceeded: boolean;
    currentBudget: BudgetTracking | null;
    percentageUsed: number;
  }> {
    const { threshold: validatedThreshold } = BudgetThresholdSchema.parse({ threshold });
    const currentBudget = await this.getCurrentMonth();
    
    if (!currentBudget) {
      return {
        exceeded: false,
        currentBudget: null,
        percentageUsed: 0
      };
    }
    
    return {
      exceeded: currentBudget.percentage_used >= validatedThreshold,
      currentBudget,
      percentageUsed: currentBudget.percentage_used
    };
  }

  // Reset budget for new month
  static async resetForNewMonth(monthYear: string, budgetAmount: number = 25): Promise<BudgetTracking> {
    const validatedMonthYear = MonthYearSchema.parse(monthYear);
    // Check if budget already exists for this month
    const existing = await this.getByMonthYear(validatedMonthYear);
    
    if (existing) {
      throw new Error(`Budget already exists for ${validatedMonthYear}`);
    }
    
    return this.create({
      month_year: validatedMonthYear,
      total_used: 0,
      total_remaining: budgetAmount,
      percentage_used: 0
    });
  }

  // Get budget usage trend
  static async getUsageTrend(months: number = 12): Promise<{
    month_year: string;
    total_used: number;
    percentage_used: number;
  }[]> {
    const query = `
      SELECT month_year, total_used, percentage_used 
      FROM budget_tracking 
      ORDER BY month_year DESC 
      LIMIT $1
    `;
    
    const result = await pool.query(query, [months]);
    return result.rows;
  }
}
