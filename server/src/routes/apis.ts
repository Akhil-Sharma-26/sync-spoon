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
  res.send("Hello world");
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
router.get("/menu", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {

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
  const { date, meal_type, student_id } = req.query;

  // Build the query dynamically based on provided parameters
  let query = `
    SELECT f.id, f.meal_date, f.meal_type, f.rating, f.comment, u.name AS student_name
    FROM se_feedback f
    JOIN se_users u ON f.student_id = u.id
    WHERE 1=1
  `;
  const queryParams: any[] = [];

  // Add filters based on query parameters
  if (date) {
    query += " AND f.meal_date = $1";
    queryParams.push(date);
  }
  if (meal_type) {
    query += " AND f.meal_type = $2";
    queryParams.push(meal_type);
  }
  if (student_id) {
    query += " AND f.student_id = $3";
    queryParams.push(student_id);
  }

  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
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




export default router;