import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Error handling middleware (continued)
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: import.meta.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: import.meta.env.NODE_ENV || 'development'
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Database connection check
import pool from './config/db';

const startServer = async () => {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();

    // Start server
    const PORT = import.meta.env.PORT ? parseInt(import.meta.env.PORT) : 7231;
    const HOST = import.meta.env.HOST || 'localhost';

    app.listen(PORT, HOST, () => {
      console.log(`
      🚀 Server started successfully
      ----------------------------
      • Environment: ${import.meta.env.NODE_ENV || 'development'}
      • Port: ${PORT}
      • Host: ${HOST}
      • Database: Connected
      • Timestamp: ${new Date().toISOString()}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: You might want to exit the process
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Optional: You might want to exit the process
  // process.exit(1);
});

// Start the server
startServer();

export default app;
  