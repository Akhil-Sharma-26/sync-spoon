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
  authorize([UserRole.STUDENT, UserRole.ADMIN]),
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
router.get("/menu", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
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
    console.error('Error in /menu endpoint:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Adding a new food item to menu
router.post("/api/menu", authenticate, authorize([UserRole.ADMIN]), async (req: AuthRequest, res: Response): Promise<void> => {
  const { date, food_item_id, meal_type } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO se_menu (date, food_item_id, meal_type) VALUES ($1, $2, $3) RETURNING *",
      [date, food_item_id, meal_type]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;