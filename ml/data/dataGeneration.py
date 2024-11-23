import pandas as pd
import numpy as np
from datetime import date, datetime, timedelta

# Enhanced menu items with more variety
menu_items = {
    'breakfast': [
        # South Indian
        'Masala Dosa', 'Plain Dosa', 'Rava Dosa', 'Onion Dosa',
        'Idli', 'Rava Idli', 'Medu Vada', 'Uttapam',
        # North Indian
        'Aloo Paratha', 'Gobi Paratha', 'Paneer Paratha', 'Methi Paratha', 'Mixed Paratha',
        'Puri Bhaji', 'Chole Puri',
        # Light Options
        'Poha', 'Upma', 'Vermicelli Upma', 'Semiya Upma',
        'Sabudana Khichdi', 'Daliya',
        # Snacks/Others
        'Chole Bhature', 'Samosa', 'Vada Pav', 'Pav Bhaji',
        'Bread Pakora', 'Besan Chilla'
    ],
    'lunch': [
        # Rice Varieties
        'Steamed Rice', 'Jeera Rice', 'Veg Pulao', 'Lemon Rice',
        'Tomato Rice', 'Curd Rice', 'Coconut Rice', 'Biryani',
        # Dals
        'Dal Tadka', 'Dal Fry', 'Dal Makhani', 'Moong Dal',
        'Masoor Dal', 'Toor Dal', 'Chana Dal', 'Panchmel Dal',
        # Main Course
        'Rajma', 'Chole', 'Kadhi Pakora', 'Aloo Matar',
        'Mix Veg Curry', 'Bhindi Masala', 'Lauki Kofta',
        # Accompaniments
        'Palak Paneer', 'Matar Paneer', 'Shahi Paneer',
        'Aloo Gobi', 'Baingan Bharta', 'Veg Kofta Curry'
    ],
    'dinner': [
        # Breads
        'Tawa Roti', 'Tandoori Roti', 'Butter Naan', 'Garlic Naan',
        'Missi Roti', 'Laccha Paratha', 'Rumali Roti',
        # Main Course
        'Paneer Tikka Masala', 'Kadai Paneer', 'Paneer Butter Masala',
        'Malai Kofta', 'Veg Kolhapuri', 'Mushroom Masala',
        'Bhindi Fry', 'Aloo Jeera', 'Gobi Manchurian',
        'Dal Makhani', 'Chana Masala', 'Mixed Veg Curry',
        'Paneer Lababdar', 'Veg Jalfrezi', 'Paneer Do Pyaza',
        # Dry Items
        'Jeera Aloo', 'Aloo Methi', 'Bhindi Do Pyaza',
        'Gobhi Masala', 'Tawa Vegetables'
    ]
}

# Holiday data remains same
holidays = pd.DataFrame([
    ('2024-08-15', '2024-08-15', 'Independence Day'),
    ('2024-10-02', '2024-10-02', 'Gandhi Jayanti'),
    ('2024-10-03', '2024-10-11', 'Navratri'),
    ('2024-10-26', '2024-11-03', 'Diwali'),
    ('2024-12-22', '2024-12-31', 'Christmas'),
    ('2025-01-01', '2025-01-07', "New Year's Day"),
    ('2025-03-21', '2025-03-27', 'Holi'),
    ('2025-08-15', '2025-08-15', 'Independence Day')
], columns=['Start Date', 'End Date', 'Holiday'])

holidays['Start Date'] = pd.to_datetime(holidays['Start Date'])
holidays['End Date'] = pd.to_datetime(holidays['End Date'])

def is_holiday(date):
    date = pd.to_datetime(date)
    for _, holiday in holidays.iterrows():
        if holiday['Start Date'] <= date <= holiday['End Date']:
            return True
    return False

def get_holiday_name(date):
    date = pd.to_datetime(date)
    for _, holiday in holidays.iterrows():
        if holiday['Start Date'] <= date <= holiday['End Date']:
            return holiday['Holiday']
    return None

def generate_quantities(base_amount, is_holiday_date, day_of_week):
    # Add randomness
    random_factor = np.random.normal(1, 0.08)  # Reduced variance for more stability
    
    # Weekend factor (Sat-Sun have slightly higher quantities)
    weekend_factor = 1.15 if day_of_week in [5, 6] else 1.0
    
    # Holiday factor
    holiday_factor = 1.3 if is_holiday_date else 1.0
    
    # Weather/Season factor (simplified)
    month = date.month
    season_factor = 1.1 if month in [12, 1, 2] else 0.9 if month in [5, 6, 7] else 1.0
    
    return base_amount * random_factor * holiday_factor * weekend_factor * season_factor

# [Previous imports and menu_items definitions remain the same until the get_special_menu function]

def get_special_menu(holiday_name, meal_type):
    special_menus = {
        'Navratri': {
            'breakfast': ['Sabudana Khichdi', 'Fruit Salad', 'Kuttu Puri'],
            'lunch': ['Samak Rice', 'Kaddu Curry', 'Aloo Jeera'],
            'dinner': ['Kuttu Roti', 'Paneer', 'Lauki Curry']
        },
        'Diwali': {
            'breakfast': ['Special Poha', 'Mixed Pakoras', 'Methi Puri'],
            'lunch': ['Veg Biryani', 'Paneer Makhani', 'Special Dal'],
            'dinner': ['Masala Puri', 'Malai Kofta', 'Shahi Paneer']
        },
        'Christmas': {
            'breakfast': ['Plum Cake', 'Fruit Cake', 'Special Upma'],
            'lunch': ['Veg Pulao', 'Special Curry', 'Paneer Butter Masala'],
            'dinner': ['Butter Naan', 'Special Gravy', 'Mixed Vegetables']
        },
        'Holi': {
            'breakfast': ['Gujiya', 'Malpua', 'Dahi Vada'],
            'lunch': ['Special Pulao', 'Kadhi Pakora', 'Mix Veg'],
            'dinner': ['Puri', 'Shahi Paneer', 'Dal Makhani']
        }
    }
    return special_menus.get(holiday_name, {}).get(meal_type, [])

def generate_food_data():
    start_date = datetime(2024, 8, 21)
    end_date = datetime(2025, 8, 20)
    current_date = start_date
    
    data = []
    
    while current_date <= end_date:
        week_num = (current_date.day - 1) // 7 + 1
        month_year = current_date.strftime('%b%Y')
        
        holiday_date = is_holiday(current_date)
        holiday_name = get_holiday_name(current_date) if holiday_date else None
        
        # Get menu items (considering special menus for holidays)
        special_breakfast = get_special_menu(holiday_name, 'breakfast')
        special_lunch = get_special_menu(holiday_name, 'lunch')
        special_dinner = get_special_menu(holiday_name, 'dinner')
        
        # Use special menu if available, otherwise use random selection
        breakfast_items = special_breakfast if special_breakfast else list(np.random.choice(menu_items['breakfast'], 3, replace=False))
        lunch_items = special_lunch if special_lunch else list(np.random.choice(menu_items['lunch'], 3, replace=False))
        dinner_items = special_dinner if special_dinner else list(np.random.choice(menu_items['dinner'], 3, replace=False))
        
        # Base quantities with slight variations
        breakfast_base = np.array([70, 65, 75]) * np.random.uniform(0.95, 1.05, 3)
        lunch_base = np.array([270, 260, 210]) * np.random.uniform(0.95, 1.05, 3)
        dinner_base = np.array([300, 290, 300]) * np.random.uniform(0.95, 1.05, 3)
        
        # Generate quantities considering day of week
        day_of_week = current_date.weekday()
        breakfast_kg = [generate_quantities(q, holiday_date, day_of_week) for q in breakfast_base]
        lunch_kg = [generate_quantities(q, holiday_date, day_of_week) for q in lunch_base]
        dinner_kg = [generate_quantities(q, holiday_date, day_of_week) for q in dinner_base]
        
        row = {
            'month_year': month_year,
            'week': f'week{week_num}',
            'date': current_date.strftime('%d/%m/%Y'),
            'breakfast_items': ';'.join(breakfast_items),
            'breakfast_kg': ';'.join([f'{x:.2f}' for x in breakfast_kg]),
            'lunch_items': ';'.join(lunch_items),
            'lunch_kg': ';'.join([f'{x:.2f}' for x in lunch_kg]),
            'dinner_items': ';'.join(dinner_items),
            'dinner_kg': ';'.join([f'{x:.2f}' for x in dinner_kg])
        }
        
        data.append(row)
        current_date += timedelta(days=1)
    
    return pd.DataFrame(data)

# Generate the data
np.random.seed(42)  # For reproducibility
df = generate_food_data()

# Save to CSV
df.to_csv('food_consumption_2024_2025.csv', index=False)

# Print first few rows to verify
print(df.head().to_string())