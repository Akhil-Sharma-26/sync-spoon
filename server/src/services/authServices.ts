import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import type { 
  UserRole, 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse 
} from '../types/auth';

class AuthService {
  private static SALT_ROUNDS = 10;
  private static JWT_EXPIRY = '1d';

  // Hash password
  private static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Generate JWT Token
  private static generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: this.JWT_EXPIRY }
    );
  }

  // User Registration
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const client = await pool.connect();

    try {
      // Start transaction
      await client.query('BEGIN');

      // Check if user exists
      const existingUser = await client.query(
        'SELECT * FROM se_users WHERE email = $1',
        [credentials.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(credentials.password);

      // Insert user
      const result = await client.query<User>(
        `INSERT INTO se_users 
        (email, password_hash, name, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, email, name, role, created_at, updated_at`,
        [
          credentials.email, 
          passwordHash, 
          credentials.name, 
          credentials.role
        ]
      );

      const user = result.rows[0];

      // Generate token
      const token = this.generateToken(user);

      // Commit transaction
      await client.query('COMMIT');

      return { 
        token, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User Login
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user
    const result = await pool.query<User>(
      'SELECT * FROM se_users WHERE email = $1', 
      [credentials.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(
      credentials.password, 
      user.password_hash
    );

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    return { 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  // Get User Profile
  static async getProfile(userId: number): Promise<Partial<User>> {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM se_users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  // Update User Profile
  static async updateProfile(
    userId: number, 
    updateData: Partial<User>
  ): Promise<Partial<User>> {
    const result = await pool.query(
      `UPDATE se_users 
       SET 
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, email, name, role`,
      [
        updateData.name, 
        updateData.email, 
        userId
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }
}

export default AuthService;