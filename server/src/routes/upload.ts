import express, { Router, type Request, type Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParser from 'csv-parser';
import { Pool } from 'pg';
import { authenticate, authorize, type AuthRequest } from "../middleware/auth"; // Assuming you have these middleware
import { UserRole } from '../types/auth';

const uploader: Router = express.Router();

// Set up PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint to upload CSV data
uploader.post(
  '/upload_csv',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MESS_STAFF]),
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
    }
    
    const filePath = req.file?.path; // Path to the uploaded file
    if (!filePath) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    }
    const results: any[] = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Save parsed data to the database
        try {
          for (const row of results) {
            await pool.query(
              'INSERT INTO se_csv_data (month_year, week, breakfast_items, breakfast_kg, lunch_items, lunch_kg, dinner_items, dinner_kg) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
              [
                row.month_year,
                row.week,
                row.breakfast_items,
                row.breakfast_kg,
                row.lunch_items,
                row.lunch_kg,
                row.dinner_items,
                row.dinner_kg,
              ]
            );
          }
          // Remove the file after processing
          fs.unlinkSync(filePath);
          res.status(200).json({ message: 'CSV data saved successfully.' });
        } catch (error) {
          console.error('Error saving CSV data:', error);
          res.status(500).json({ message: 'Error saving CSV data.' });
        }
      });
  }
);

// Endpoint to fetch saved CSV records
uploader.get('/csv_records', authenticate,authorize([UserRole.ADMIN, UserRole.MESS_STAFF]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM se_csv_data ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching CSV records:', error);
    res.status(500).json({ message: 'Error fetching CSV records.' });
  }
});

export default uploader;