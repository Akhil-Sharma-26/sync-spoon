import express, { type Request, type Response } from 'express';
import AuthService from '../services/authServices'; // Ensure correct import path
import { authenticate, authorize } from '../middleware/auth'; // Ensure correct import path
import { UserRole } from '../types/auth';
import pool from '../config/db'; // Import the database pool

// Create a custom interface for the authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

const router = express.Router();

// Registration Route
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        message: 'All fields are required',
        requiredFields: ['email', 'password', 'name', 'role']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ 
        message: 'Invalid role',
        validRoles: Object.values(UserRole)
      });
    }

    // Attempt registration
    const result = await AuthService.register({
      email,
      password,
      name,
      role: role as UserRole
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ 
          message: 'User with this email already exists' 
        });
      }
    }

    res.status(500).json({ 
      message: 'Registration failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Login Route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Attempt login
    const result = await AuthService.login({ email, password });

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }
    }

    res.status(500).json({ 
      message: 'Login failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get User Profile (Protected Route)
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profile = await AuthService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch profile', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update User Profile (Protected Route)
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, email } = req.body;

    // Validate input
    if (!name && !email) {
      return res.status(400).json({ 
        message: 'At least one field (name or email) must be provided' 
      });
    }

    // Optional email validation if email is provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }
    }

    const updatedProfile = await AuthService.updateProfile(req.user.id, { 
      name, 
      email 
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Change Password (Protected Route)
router.post('/change-password', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current and new passwords are required' 
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters long' 
      });
    }

    // Verify current password and update
    await AuthService.changePassword(
      req.user.id, 
      currentPassword, 
      newPassword
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid current password') {
        return res.status(400).json({ 
          message: 'Current password is incorrect' 
        });
      }
    }

    res.status(500).json({ 
      message: 'Failed to change password', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Role-specific protected routes example
router.get(
  '/admin-dashboard', 
  authenticate, 
  authorize([UserRole.ADMIN]), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Fetch admin-specific data
      const adminStats = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM se_users WHERE role = 'ADMIN') as admin_count,
          (SELECT COUNT(*) FROM se_users WHERE role = 'MESS_STAFF') as staff_count,
          (SELECT COUNT(*) FROM se_users WHERE role = 'STUDENT') as student_count,
          (SELECT COUNT(*) FROM se_consumption_records) as total_consumption
      `);

      res.json(adminStats.rows[0]);
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch admin dashboard', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
});

export default router;