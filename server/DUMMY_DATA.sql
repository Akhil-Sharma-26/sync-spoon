-- Add a 'status' column to se_users table

ALTER TABLE se_users ADD COLUMN status VARCHAR(20) DEFAULT 'active';


-- Add a 'description' column to se_food_items table

ALTER TABLE se_food_items ADD COLUMN description TEXT;


-- Insert dummy data into se_users

INSERT INTO se_users (email, password_hash, role, name, status) VALUES

('admin@example.com', 'hashed_password_1', 'ADMIN', 'Admin User', 'active'),

('staff1@example.com', 'hashed_password_2', 'MESS_STAFF', 'Staff Member 1', 'active'),

('staff2@example.com', 'hashed_password_3', 'MESS_STAFF', 'Staff Member 2', 'active'),

('student1@example.com', 'hashed_password_4', 'STUDENT', 'Student 1', 'active'),

('student2@example.com', 'hashed_password_5', 'STUDENT', 'Student 2', 'active'),

('student3@example.com', 'hashed_password_6', 'STUDENT', 'Student 3', 'inactive');


-- Insert dummy data into se_food_items

INSERT INTO se_food_items (name, category, unit, description) VALUES

('Rice', 'Grains', 'kg', 'Steamed white rice'),

('Dal', 'Lentils', 'kg', 'Yellow lentil soup'),

('Chicken Curry', 'Non-Veg', 'servings', 'Spicy chicken curry'),

('Mixed Vegetables', 'Vegetables', 'kg', 'Assorted seasonal vegetables'),

('Roti', 'Bread', 'pieces', 'Whole wheat flatbread'),

('Fruit Salad', 'Dessert', 'servings', 'Mixed fresh fruits');

-- Inserting food items into se_food_items table
INSERT INTO se_food_items (name, category, unit, description) VALUES

-- Grains
('Rice', 'Grains', 'kg', 'Steamed white rice'),
('Basmati Rice', 'Grains', 'kg', 'Aromatic long-grain rice'),
('Brown Rice', 'Grains', 'kg', 'Nutritious whole grain rice'),
('Quinoa', 'Grains', 'kg', 'Protein-rich grain with a nutty flavor'),
('Pulao', 'Grains', 'kg', 'Spiced rice dish with vegetables and nuts'),
('Biryani', 'Grains', 'kg', 'Fragrant rice dish with meat and spices'),

-- Lentils
('Yellow Dal', 'Lentils', 'kg', 'Creamy yellow lentil soup'),
('Black Dal', 'Lentils', 'kg', 'Rich and creamy black lentil preparation'),
('Rajma', 'Lentils', 'kg', 'Kidney beans in a spiced gravy'),
('Chana Masala', 'Lentils', 'kg', 'Spicy chickpeas in a tangy sauce'),
('Sambhar', 'Lentils', 'kg', 'South Indian lentil stew with vegetables'),

-- Non-Vegetarian
('Chicken Curry', 'Non-Veg', 'servings', 'Spicy traditional chicken curry'),
('Butter Chicken', 'Non-Veg', 'servings', 'Creamy tomato-based chicken dish'),
('Fish Fry', 'Non-Veg', 'servings', 'Crispy fried fish with coastal spices'),
('Mutton Rogan Josh', 'Non-Veg', 'servings', 'Slow-cooked mutton in aromatic spices'),
('Egg Bhurji', 'Non-Veg', 'servings', 'Spiced scrambled eggs'),

-- Vegetarian
('Paneer Tikka', 'Vegetarian', 'servings', 'Grilled cottage cheese with spices'),
('Malai Kofta', 'Vegetarian', 'servings', 'Fried dumplings in creamy sauce'),
('Vegetable Kofta', 'Vegetarian', 'servings', 'Mixed vegetable dumplings in gravy'),

-- Vegetables
('Mixed Vegetables', 'Vegetables', 'kg', 'Assorted seasonal vegetables'),
('Aloo Gobi', 'Vegetables', 'kg', 'Potato and cauliflower curry'),
('Palak Paneer', 'Vegetarian', 'servings', 'Spinach with cottage cheese'),
('Baingan Bharta', 'Vegetables', 'kg', 'Roasted eggplant mash'),
('Cauliflower Masala', 'Vegetables', 'kg', 'Spiced cauliflower preparation'),

-- Salads and Sides
('Cucumber Raita', 'Sides', 'servings', 'Yogurt-based cucumber side dish'),
('Green Salad', 'Salad', 'servings', 'Fresh mixed green salad with dressing'),
('Fruit Salad', 'Dessert', 'servings', 'Mixed fresh seasonal fruits'),
('Pickle', 'Sides', 'kg', 'Spicy and tangy Indian pickles'),
('Papad', 'Sides', 'pieces', 'Crispy lentil wafers'),

-- Desserts
('Gulab Jamun', 'Dessert', 'pieces', 'Sweet milk-solid balls in sugar syrup'),
('Kheer', 'Dessert', 'servings', 'Traditional rice pudding with cardamom'),
('Gajar Halwa', 'Dessert', 'servings', 'Sweet carrot pudding with nuts'),
('Rasmalai', 'Dessert', 'pieces', 'Soft cheese dumplings in sweet milk'),
('Jalebi', 'Dessert', 'pieces', 'Crispy spirals soaked in sugar syrup'),

-- Beverages
('Lassi', 'Beverages', 'ml', 'Traditional yogurt-based drink'),
('Buttermilk', 'Beverages', 'ml', 'Spiced yogurt drink'),
('Masala Chai', 'Beverages', 'ml', 'Spiced Indian tea with milk'),
('Fresh Lime Soda', 'Beverages', 'ml', 'Refreshing lime soda with mint'),
('Coconut Water', 'Beverages', 'ml', 'Natural coconut water, refreshing and hydrating');

-- Insert dummy data into se_consumption_records

INSERT INTO se_consumption_records (food_item_id, quantity, date, meal_type, recorded_by) VALUES

(1, 10.5, CURRENT_DATE, 'Lunch', 2),

(2, 5.2, CURRENT_DATE, 'Lunch', 2),

(3, 50, CURRENT_DATE, 'Lunch', 2),

(5, 200, CURRENT_DATE, 'Lunch', 2),

(1, 8.0, CURRENT_DATE - 1, 'Dinner', 3),

(4, 7.5, CURRENT_DATE - 1, 'Dinner', 3),

(5, 180, CURRENT_DATE - 1, 'Dinner', 3),

(6, 40, CURRENT_DATE - 1, 'Dinner', 3);


-- Insert dummy data into se_feedback

INSERT INTO se_feedback (student_id, meal_date, meal_type, rating, comment) VALUES

(4, CURRENT_DATE, 'Lunch', 4, 'The chicken curry was delicious!'),

(5, CURRENT_DATE, 'Lunch', 3, 'Rice was a bit overcooked'),

(4, CURRENT_DATE - 1, 'Dinner', 5, 'Loved the fruit salad'),

(5, CURRENT_DATE - 1, 'Dinner', 4, 'Good variety of vegetables');


-- Insert dummy data into se_holiday_schedule

INSERT INTO se_holiday_schedule (start_date, end_date, description, created_by) VALUES

(CURRENT_DATE + 10, CURRENT_DATE + 15, 'Summer Break', 1),

(CURRENT_DATE + 30, CURRENT_DATE + 31, 'Independence Day', 1),

(CURRENT_DATE + 60, CURRENT_DATE + 65, 'Diwali Festival', 1);


-- Insert dummy data into se_menu_plan

INSERT INTO se_menu_plan ("date", meal_type, food_item_id, planned_quantity, created_by) VALUES

(CURRENT_DATE + 1, 'Breakfast', 5, 100, 2),

(CURRENT_DATE + 1, 'Breakfast', 6, 50, 2),

(CURRENT_DATE + 1, 'Lunch', 1, 15, 2),

(CURRENT_DATE + 1, 'Lunch', 2, 10, 2),

(CURRENT_DATE + 1, 'Lunch', 3, 50, 2),

(CURRENT_DATE + 1, 'Dinner', 1, 12, 2),

(CURRENT_DATE + 1, 'Dinner', 4, 8, 2),

(CURRENT_DATE + 1, 'Dinner', 5, 150, 2);


-- Insert dummy data into se_inventory

INSERT INTO se_inventory (food_item_id, quantity, expiry_date, updated_by) VALUES

(1, 50, CURRENT_DATE + 30, 2),

(2, 30, CURRENT_DATE + 60, 2),

(3, 20, CURRENT_DATE + 5, 2),

(4, 25, CURRENT_DATE + 7, 2),

(5, 200, CURRENT_DATE + 15, 2),

(6, 40, CURRENT_DATE + 3, 2);


-- Insert dummy data into se_nutritional_info

INSERT INTO se_nutritional_info (food_item_id, calories, protein, carbohydrates, fat, fiber, per_unit) VALUES

(1, 130, 2.7, 28, 0.3, 0.4, 'per 100g'),

(2, 116, 9, 20, 0.4, 2, 'per 100g'),

(3, 165, 31, 0, 4.5, 0, 'per 100g'),

(4, 65, 2.5, 13, 0.3, 4, 'per 100g'),

(5, 80, 3, 15, 1, 2, 'per piece'),

(6, 50, 0.5, 13, 0.3, 1.5, 'per 100g');


-- Insert dummy data into se_waste_log

INSERT INTO se_waste_log (date, meal_type, food_item_id, waste_quantity, reason, logged_by) VALUES

(CURRENT_DATE, 'Lunch', 1, 2.5, 'Overcooked', 2),

(CURRENT_DATE, 'Lunch', 3, 5, 'Low attendance', 2),

(CURRENT_DATE - 1, 'Dinner', 4, 1.5, 'Spoiled', 3),
