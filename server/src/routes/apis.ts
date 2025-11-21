import express from "express";
import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

import {
  type User,
  UserRole,
  type FoodItem,
  type ConsumptionRecord,
  type Feedback,
  type HolidaySchedule,
  type Menu,
  type MenuItem,
} from "../types";

import { authenticate, authorize, type AuthRequest } from "../middleware/auth";

const router: Router = express.Router();

const pool = new Pool({
  connectionString: import.meta.env.POSTGRES_URL,
});

// Auth Routes
router.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello world");
});

// Protected routes using the middleware
router.post(
  "/consumption",
  authenticate,
  authorize([UserRole.MESS_STAFF, UserRole.ADMIN]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { food_item_id, quantity, date, meal_type } = req.body;
    const recorded_by = req.user?.id;

    try {
      const result = await pool.query<ConsumptionRecord>(
        "INSERT INTO se_consumption_records (food_item_id, quantity, date, meal_type, recorded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [food_item_id, quantity, date, meal_type, recorded_by]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// suggested menu:
// date range:
// combining 3 files: most consumed food items weekly with quantity, Least consumed food items weekly with quantity, and holiday schedule csvs
// Weekly report csv --> coming from starting aggregated data file

// get consumptopn data
router.get(
  "/consumption",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MESS_STAFF]), // Allow access to admin and mess staff
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query<ConsumptionRecord>(
        "SELECT * FROM se_consumption_records ORDER BY date DESC" // Fetch all consumption records ordered by date
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// Fetch food-items
router.get('/food-items', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM se_food_items");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post(
  "/feedback",
  authenticate,
  authorize([UserRole.STUDENT]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { meal_date, meal_type, rating, comment } = req.body;
    const student_id = req.user?.id;

    try {
      const result = await pool.query<Feedback>(
        "INSERT INTO se_feedback (student_id, meal_date, meal_type, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [student_id, meal_date, meal_type, rating, comment]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// Holiday Schedule Routes
router.post(
  "/holiday-schedule",
  authenticate,
  authorize([UserRole.ADMIN]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { start_date, end_date, description } = req.body;
    const created_by = req.user?.id;

    try {
      const result = await pool.query<HolidaySchedule>(
        "INSERT INTO se_holiday_schedule (start_date, end_date, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
        [start_date, end_date, description, created_by]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/holiday-schedule",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { year } = req.query;

    try {
      const result = await pool.query<HolidaySchedule>(
        "SELECT * FROM se_holiday_schedule WHERE EXTRACT(YEAR FROM start_date) = $1",
        [year]
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Menu Routes
// implemented in Frontend
router.get("/menu/today", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const result = await pool.query(
      `SELECT f.id, f.name, f.category, cr.meal_type
         FROM se_food_items f
         JOIN se_consumption_records cr ON f.id = cr.food_item_id
         WHERE cr.date = $1`,
      [today]
    );

    const menu = {
      date: today,
      items: result.rows,
 };

    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Waste Management Routes
router.post(
  "/waste", 
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MESS_STAFF]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { food_item_id, quantity, date, meal_type } = req.body;
    const recorded_by = req.user?.id;

    try {
      const result = await pool.query(
        "INSERT INTO se_waste_records (food_item_id, quantity, date, meal_type, recorded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [food_item_id, quantity, date, meal_type, recorded_by]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/waste-report",
  authenticate,
  authorize([UserRole.ADMIN]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { start_date, end_date } = req.query;

    try {
      const result = await pool.query(
        `SELECT f.name, SUM(w.quantity) as total_waste
         FROM se_waste_records w
         JOIN se_food_items f ON w.food_item_id = f.id
         WHERE w.date BETWEEN $1 AND $2
         GROUP BY f.name
         ORDER BY total_waste DESC`,
        [start_date, end_date]
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// AI Prediction Route (placeholder)
router.get(
  "/predict-consumption",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { date } = req.query;

    try {
      const result = await pool.query(
        `SELECT f.id, f.name, AVG(cr.quantity) as predicted_quantity
         FROM se_food_items f
         JOIN se_consumption_records cr ON f.id = cr.food_item_id
         WHERE cr.date < $1
         GROUP BY f.id, f.name`,
        [date]
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Menu Routes
// implemented in Frontend
router.get("/menu-today", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const query = `
      SELECT f.id, f.name, f.category, m.meal_type
      FROM se_food_items f
      JOIN se_menu_plan m ON f.id = m.food_item_id
      WHERE DATE(m.date) = DATE($1)
      ORDER BY m.meal_type, f.category
    `;

    const result = await pool.query(query, [today]);

    const menu = {
      date: today.toISOString().split('T')[0],
      breakfast: result.rows.filter((item) => item.meal_type.toLowerCase() === 'breakfast'),
      lunch: result.rows.filter((item) => item.meal_type.toLowerCase() === 'lunch'),
      dinner: result.rows.filter((item) => item.meal_type.toLowerCase() === 'dinner'),
    };
    res.json(menu);
  } catch (error) {
    console.error('Error in /menu-today endpoint:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// for the feedback showing menu:
router.get("/menu-items", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { date, mealType } = req.query;
  
  // Validate query parameters
  if (!date || !mealType) {
    res.status(400).json({ message: "Date and meal type are required." });
    return;
  }
  // console.log(date,mealType)
  try {
    const query = `
      SELECT f.id, f.name, f.category, m.meal_type
      FROM se_food_items f
      JOIN se_menu_plan m ON f.id = m.food_item_id
      WHERE DATE(m.date) = DATE($1) AND m.meal_type = $2
      ORDER BY m.meal_type, f.category
    `;

    const result = await pool.query(query, [date,mealType]);
    // console.log(result.rows)
    res.json(result.rows);
  } catch (error) {
    console.error('Error in /menu-today endpoint:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch menu items for a specific date and meal type
router.get("/menu", async (req: AuthRequest, res: Response): Promise<void> => {

  try {
    const { date } = req.query;
    const query = `
      SELECT f.id, f.name, f.category, m.meal_type
      FROM se_food_items f
      JOIN se_menu_plan m ON f.id = m.food_item_id
      WHERE DATE(m.date) = DATE($1)
      ORDER BY m.meal_type, f.category
    `;

    const result = await pool.query(query, [date]);

    const menu = {
      date: date,
      breakfast: result.rows.filter((item) => item.meal_type.toLowerCase() === 'breakfast'),
      lunch: result.rows.filter((item) => item.meal_type.toLowerCase() === 'lunch'),
      dinner: result.rows.filter((item) => item.meal_type.toLowerCase() === 'dinner'),
    };

    res.json(menu);
  } catch (error) {
    console.error('Error in /menu-today endpoint:', error);
    res.status(500).json({ message: "Server error" });
  }
});


// Adding a new food item to the menu
router.post("/menu", authenticate, authorize([UserRole.ADMIN]), async (req: AuthRequest, res: Response): Promise<void> => {

  const { date, food_item_id, meal_type } = req.body;

  // Validate request body
  if (!date || !food_item_id || !meal_type) {
    res.status(400).json({ message: "Date, food item ID, and meal type are required." });
    return;
  }
  try {
    const result = await pool.query(
      "INSERT INTO se_menu_plan (date, food_item_id, meal_type) VALUES ($1, $2, $3) RETURNING *",
      [date, food_item_id, meal_type]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Fetch feedback records
router.get("/feedback", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { start_date, end_date, meal_type, student_id } = req.query;

  // Build the query dynamically based on provided parameters
  let query = `
    SELECT f.id, f.meal_date, f.meal_type, f.rating, f.comment, u.name AS student_name
    FROM se_feedback f
    JOIN se_users u ON f.student_id = u.id
    WHERE 1=1
  `;
  const queryParams: any[] = [];

  // Add filters based on query parameters
  if (start_date && end_date) {
    query += " AND f.meal_date BETWEEN $1 AND $2";
    queryParams.push(start_date, end_date);
  } else if (start_date) {
    query += " AND f.meal_date >= $1";
    queryParams.push(start_date);
  } else if (end_date) {
    query += " AND f.meal_date <= $1";
    queryParams.push(end_date);
  }
  
  if (meal_type) {
    query += " AND f.meal_type = $" + (queryParams.length + 1);
    queryParams.push(meal_type);
  }
  if (student_id) {
    query += " AND f.student_id = $" + (queryParams.length + 1);
    queryParams.push(student_id);
  }

  try {
    const result = await pool.query(query, queryParams);
    
    // Check if any records were found
    if (result.rows.length === 0) {
      res.status(404).json({ message: "No data found for the specified date range." });
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Menu suggestion
router.get('/menu-suggestions', authenticate, authorize([UserRole.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
      // Get current date
      const currentDate = new Date();

      const result = await pool.query(`
          SELECT 
              id, 
              start_date, 
              end_date, 
              status, 
              suggested_at,
              menu_data
          FROM se_menu_suggestions
          WHERE 
              status = 'PENDING' AND 
              end_date >= $1
          ORDER BY suggested_at DESC
      `, [currentDate]);

      res.json(result.rows);
  } catch (error) {
      res.status(500).json({ message: "Error fetching menu suggestions" });
  }
});

router.post('/menu-suggestions/accept', authenticate, authorize([UserRole.ADMIN]), async (req: AuthRequest, res: Response) => {
  const { suggestion_id } = req.body;
  const user_id = req.user?.id;

  try {
      // Begin transaction
      await pool.query('BEGIN');

      // Validate suggestion is still pending and within acceptable date range
      const suggestionResult = await pool.query(`
          SELECT 
              start_date, 
              end_date, 
              menu_data 
          FROM se_menu_suggestions 
          WHERE 
              id = $1 AND 
              status = 'PENDING' AND 
              end_date >= CURRENT_DATE
      `, [suggestion_id]);

      if (suggestionResult.rows.length === 0) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ message: "Invalid or expired suggestion" });
      }

      const { start_date, end_date, menu_data } = suggestionResult.rows[0];

      // Insert menu items
      for (const item of menu_data) {
          await pool.query(`
              INSERT INTO se_menu_plan 
              (date, meal_type, food_item_id, planned_quantity, created_by) 
              VALUES ($1, $2, $3, $4, $5)
          `, [
              item.date, 
              item.meal_type, 
              item.food_item_id, 
              item.planned_quantity, 
              user_id
          ]);
      }

      // Update suggestion status
      await pool.query(`
          UPDATE se_menu_suggestions 
          SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP 
          WHERE id = $1
      `, [suggestion_id]);

      // Commit transaction
      await pool.query('COMMIT');

      res.json({ 
          message: "Menu suggestion accepted and implemented", 
          start_date, 
          end_date 
      });

  } catch (error) {
      await pool.query('ROLLBACK');
      res.status(500).json({ message: "Error processing menu suggestion" });
  }
});


// In your Express router file

router.get(
  "/consumption",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MESS_STAFF]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { start_date, end_date } = req.query;

    try {
      let query = `
        SELECT 
          cr.id, 
          cr.food_item_id, 
          f.name as food_item_name, 
          cr.quantity, 
          cr.date, 
          cr.meal_type
        FROM se_consumption_records cr
        JOIN se_food_items f ON cr.food_item_id = f.id
        WHERE 1=1
      `;
      const queryParams: any[] = [];

      // Add date range filter if provided
      if (start_date && end_date) {
        query += " AND cr.date BETWEEN $1 AND $2";
        queryParams.push(start_date, end_date);
      }

      query += " ORDER BY cr.date DESC";

      const result = await pool.query(query, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

router.get(
  "/waste-report",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MESS_STAFF]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { start_date, end_date } = req.query;

    try {
      let query = `
        SELECT 
          w.id, 
          w.food_item_id, 
          f.name as food_item_name, 
          w.quantity, 
          w.date, 
          w.meal_type
        FROM se_waste_records w
        JOIN se_food_items f ON w.food_item_id = f.id
        WHERE 1=1
      `;
      const queryParams: any[] = [];

      // Add date range filter if provided
      if (start_date && end_date) {
        query += " AND w.date BETWEEN $1 AND $2";
        queryParams.push(start_date, end_date);
      }

      query += " ORDER BY w.date DESC";

      const result = await pool.query(query, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Reports Routes
router.get(
  "/reports",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MESS_STAFF]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { start_date, end_date, report_name } = req.query;

    try {
      let query = `
        SELECT id, report_name, start_date, end_date, created_at
        FROM se_reports
        WHERE 1=1
      `;
      const queryParams: any[] = [];
      let paramCount = 1;

      if (start_date) {
        query += ` AND start_date >= $${paramCount}`;
        queryParams.push(start_date);
        paramCount++;
      }

      if (end_date) {
        query += ` AND end_date <= $${paramCount}`;
        queryParams.push(end_date);
        paramCount++;
      }

      if (report_name) {
        query += ` AND report_name ILIKE $${paramCount}`;
        queryParams.push(`%${report_name}%`);
      }

      query += " ORDER BY created_at DESC";

      const result = await pool.query(query, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching reports" });
    }
  }
);

router.get(
  "/reports/:id/download",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MESS_STAFF]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        "SELECT report_name, report_data FROM se_reports WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ message: "Report not found" });
        return;
      }

      const report = result.rows[0];
      
      // Ensure we're sending binary data, not JSON
      const buffer = Buffer.from(report.report_data);
      
      // Set correct headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.report_name}"`);
      res.setHeader('Content-Length', buffer.length);
      
      // Send the buffer directly
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error downloading report" });
    }
  }
);

router.get(
  "/menu-suggestions",
  authenticate, 
  authorize([UserRole.MESS_STAFF, UserRole.ADMIN]), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Extensive logging
      console.log('Menu Suggestions Request:', {
        user: req.user,
        headers: req.headers
      });

      // Fetch menu suggestions with more detailed query
      const query = `
        SELECT 
          id, 
          start_date, 
          end_date, 
          status, 
          suggested_by, 
          updated_by,
          suggested_at, 
          updated_at, 
          accepted_at, 
          menu_data,
          created_at
        FROM se_menu_suggestions
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query);

      // console.log('Query Result:', {
      //   rowCount: result.rowCount,
      //   rows: result.rows.map(row => ({
      //     id: row.id,
      //     status: row.status,
      //     startDate: row.start_date,
      //     endDate: row.end_date,
      //     suggestedBy: row.suggested_by,
      //     updatedBy: row.updated_by,
      //     suggestedAt: row.suggested_at,
      //     updatedAt: row.updated_at,
      //     acceptedAt: row.accepted_at,
      //     createdAt: row.created_at
      //   }))
      // });

      // Transform menu_data if it's stored as JSON or needs parsing
      const suggestions = result.rows.map(row => ({
        id: row.id,
        start_date: row.start_date,
        end_date: row.end_date,
        status: row.status,
        suggested_by: row.suggested_by,
        updated_by: row.updated_by,
        suggested_at: row.suggested_at,
        updated_at: row.updated_at,
        accepted_at: row.accepted_at,
        created_at: row.created_at,
        menu_data: Array.isArray(row.menu_data) 
          ? row.menu_data 
          : typeof row.menu_data === 'string' 
            ? JSON.parse(row.menu_data) 
            : row.menu_data
      }));

      res.json({
        total_suggestions: suggestions.length,
        suggestions: suggestions
      });

    } catch (error) {
      console.error('Menu Suggestions Route Error:', error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      });
    }
  }
);


export default router;