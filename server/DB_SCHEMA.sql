-- Create role-based enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'MESS_STAFF', 'STUDENT');

-- Create se_users table
CREATE TABLE se_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create se_food_items table
CREATE TABLE se_food_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create se_consumption_records table
CREATE TABLE se_consumption_records (
    id SERIAL PRIMARY KEY,
    food_item_id INTEGER REFERENCES se_food_items(id),
    quantity DECIMAL NOT NULL,
    date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    recorded_by INTEGER REFERENCES se_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create se_feedback table
CREATE TABLE se_feedback (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES se_users(id),
    meal_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create se_holiday_schedule table
CREATE TABLE se_holiday_schedule (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES se_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_consumption_date ON se_consumption_records(date);
CREATE INDEX idx_se_feedback_date ON se_feedback(meal_date);
CREATE INDEX idx_holiday_dates ON se_holiday_schedule(start_date, end_date);