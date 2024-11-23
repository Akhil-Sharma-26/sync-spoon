import express, { Router, type Response } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { 
  authenticate, 
  authorize, 
  type AuthRequest 
} from '../middleware/auth';
import { 
  asyncHandler, 
} from '../middleware/errorHandler';
import { 
  ValidationError, 
  DatabaseError, 
  ConflictError, 
  NotFoundError 
} from '../services/errors';
import { UserRole } from '../types';

const userRouter: Router = express.Router();
const pool = new Pool({
  connectionString: import.meta.env.POSTGRES_URL,
});

// Utility function to check user dependencies
const checkUserDependencies = async (userId: number): Promise<boolean> => {
  try {
    // Check dependencies in various tables
    const dependencies = await Promise.all([
      pool.query('SELECT COUNT(*) FROM se_holiday_schedule WHERE created_by = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM se_meal_logs WHERE user_id = $1', [userId]),
      // Add more dependency checks as needed
    ]);

    return dependencies.some(dep => parseInt(dep.rows[0].count) > 0);
  } catch (error) {
    throw new DatabaseError('Error checking user dependencies');
  }
};

// Get all users (filtered by role)
userRouter.get(
  '/users',
  authenticate,
  authorize([UserRole.ADMIN]),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { role } = req.query;
    
    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      throw new ValidationError('Invalid role provided');
    }

    let query = `
      SELECT 
        id, 
        name, 
        email, 
        role, 
        created_at 
      FROM se_users
    `;
    const queryParams: any[] = [];

    if (role) {
      query += ' WHERE role = $1';
      queryParams.push(role);
    }

    try {
      const result = await pool.query(query, queryParams);
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      throw new DatabaseError('Failed to retrieve users');
    }
  })
);

// Create a new user
userRouter.post(
  '/users',
  authenticate,
  authorize([UserRole.ADMIN]),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      throw new ValidationError('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Check if user already exists
    try {
      const existingUser = await pool.query(
        'SELECT * FROM se_users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const result = await pool.query(
        `INSERT INTO se_users 
        (name, email, password_hash, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, role`,
        [name, email, passwordHash, role]
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      // Rethrow known errors, wrap unknown errors
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError('Failed to create user');
    }
  })
);

// Update user details
userRouter. put(
  '/users/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    let query = 'UPDATE se_users SET updated_at = CURRENT_TIMESTAMP';
    const queryParams: any[] = [id];
    let paramIndex = 2;

    if (name) {
      query += `, name = $${paramIndex}`;
      queryParams.push(name);
      paramIndex++;
    }

    if (email) {
      query += `, email = $${paramIndex}`;
      queryParams.push(email);
      paramIndex++;
    }

    if (role) {
      query += `, role = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }

    if (password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      query += `, password_hash = $${paramIndex}`;
      queryParams.push(passwordHash);
      paramIndex++;
    }

    query += ` WHERE id = $1 RETURNING id, name, email, role`;

    try {
      const result = await pool.query(query, queryParams);

      if (result.rows.length === 0) {
        throw new NotFoundError('User  not found');
      }

      res.json({
        success: true,
        message: 'User  updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError('Failed to update user');
    }
  })
);

// Delete a user
userRouter.delete(
  '/users/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check for dependencies before deletion
    const hasDependencies = await checkUserDependencies(Number(id));
    if (hasDependencies) {
      throw new ConflictError('Cannot delete user due to existing dependencies');
    }

    try {
      const result = await pool.query(
        'DELETE FROM se_users WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('User  not found');
      }

      res.json({
        success: true,
        message: 'User  deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete user');
    }
  })
);

export default userRouter;