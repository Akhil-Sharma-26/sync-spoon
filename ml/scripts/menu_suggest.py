import pandas as pd
import random
from datetime import datetime

def are_dishes_similar(dish1, dish2):
    """
    Check if two dishes have similar base ingredients
    """
    if not isinstance(dish1, str) or not isinstance(dish2, str):
        return False
    
    common_variations = ['rice', 'roti', 'chapati', 'bhaji', 'chole', 'paneer', 'aloo', 'gobi', 'mushroom', 'bhindi']
    for word in common_variations:
        if word in dish1.lower() and word in dish2.lower():
            return True
    return False

def prepare_meal_dataframe(meal_data):
    """
    Convert meal data dictionary to DataFrame
    """
    meal_entries = []
    for meal_type, items in meal_data.items():
        for item in items:
            # Ensure all required keys exist with default values
            meal_entries.append({
                'Meal': meal_type,
                'Dish Name': str(item.get('dish_name', 'Unknown Dish')),
                'Quantity (kg)': float(item.get('total_consumed', 1)),
                'Category': str(item.get('category', 'Unknown'))
            })
    
    # Handle case of empty meal data
    if not meal_entries:
        # Create a default DataFrame if no entries
        return pd.DataFrame(columns=['Meal', 'Dish Name', 'Quantity (kg)', 'Category'])
    
    return pd.DataFrame(meal_entries)

def select_dishes_for_meal(meal_data, meal_type, n_dishes=3):
    """
    Intelligently select dishes for a specific meal type
    """
    # Filter data for the specific meal type
    meal_subset = meal_data[meal_data['Meal'] == meal_type]
    
    # Sort dishes by total consumption
    sorted_dishes = meal_subset.sort_values('Quantity (kg)', ascending=False)
    
    # Select dishes with variety
    selected_dishes = []
    used_categories = set()
    
    for _, dish in sorted_dishes.iterrows():
        # Avoid duplicate categories and similar dishes
        if (dish['Category'] not in used_categories and 
            all(not are_dishes_similar(dish['Dish Name'], selected_dish) for selected_dish in selected_dishes)):
            
            selected_dishes.append(dish['Dish Name'])
            used_categories.add(dish['Category'])
        
        # Stop when we have enough dishes
        if len(selected_dishes) == n_dishes:
            break
    
    return selected_dishes

def generate_menu_for_date_range(start_date, end_date, meal_data, holiday_data, n_dishes=3):
    """
    Generate a comprehensive menu for a given date range
    
    :param start_date: Start date as string (dd/mm/yyyy)
    :param end_date: End date as string (dd/mm/yyyy)
    :param meal_data: Dictionary of meal data
    :param holiday_data: DataFrame of holiday information
    :param n_dishes: Number of dishes per meal
    :return: List of menu suggestions
    """
    # Prepare meal DataFrame
    meal_df = prepare_meal_dataframe(meal_data)
    
    # Convert dates
    start = datetime.strptime(start_date, '%d/%m/%Y')
    end = datetime.strptime(end_date, '%d/%m/%Y')
    
    # Define default dishes for each meal type if no data is available
    # TODO: Load this from a configuration file or database
    default_dishes = {
        'Breakfast': [
            {'Dish Name': 'Idli', 'Category': 'South Indian', 'Quantity (kg)': 50},
            {'Dish Name': 'Dosa', 'Category': 'South Indian', 'Quantity (kg)': 45},
            {'Dish Name': 'Upma', 'Category': 'South Indian', 'Quantity (kg)': 40},
            {'Dish Name': 'Poha', 'Category': 'North Indian', 'Quantity (kg)': 35},
            {'Dish Name': 'Paratha', 'Category': 'North Indian', 'Quantity (kg)': 30},
        ],
        'Lunch': [
            {'Dish Name': 'Roti', 'Category': 'Indian Bread', 'Quantity (kg)': 100},
            {'Dish Name': 'Rice', 'Category': 'Staple', 'Quantity (kg)': 90},
            {'Dish Name': 'Dal', 'Category': 'Lentils', 'Quantity (kg)': 60},
            {'Dish Name': 'Chicken Curry', 'Category': 'Non-Veg', 'Quantity (kg)': 50},
            {'Dish Name': 'Vegetable Sabzi', 'Category': 'Vegetarian', 'Quantity (kg)': 45},
        ],
        'Dinner': [
            {'Dish Name': 'Roti', 'Category': 'Indian Bread', 'Quantity (kg)': 80},
            {'Dish Name': 'Rice', 'Category': 'Staple', 'Quantity (kg)': 70},
            {'Dish Name': 'Vegetable Pulao', 'Category': 'Rice Dish', 'Quantity (kg)': 50},
            {'Dish Name': 'Paneer Curry', 'Category': 'Vegetarian', 'Quantity (kg)': 40},
            {'Dish Name': 'Fruit Salad', 'Category': 'Dessert', 'Quantity (kg)': 30},
        ]
    }

    # Enhance meal DataFrame with default dishes if needed
    for meal_type, dishes in default_dishes.items():
        if meal_df[meal_df['Meal'] == meal_type].empty:
            # Add default dishes if no data exists
            default_df = pd.DataFrame([
                {
                    'Meal': meal_type, 
                    'Dish Name': dish['Dish Name'], 
                    'Quantity (kg)': dish['Quantity (kg)'], 
                    'Category': dish['Category']
                } for dish in dishes
            ])
            meal_df = pd.concat([meal_df, default_df], ignore_index=True)
    
    # Generate menu for the entire date range
    complete_menu = []
    
    current_date = start
    while current_date <= end:
        # Check if it's a holiday
        is_holiday_period = any(
            row['Start Date'] <= current_date <= row['End Date'] 
            for _, row in holiday_data.iterrows()
        )
        
        # Adjustment factor for holidays
        adjustment_factor = 0.7 if is_holiday_period else 1.0
        
        # Generate menu for each meal type
        daily_menu = []
        for meal_type in ['Breakfast', 'Lunch', 'Dinner']:
            # Select dishes for the meal
            selected_dishes = select_dishes_for_meal(meal_df, meal_type, n_dishes)
            
            # Generate menu items for selected dishes
            for dish in selected_dishes:
                # Get base quantity (could be based on historical consumption)
                base_quantity = meal_df[(meal_df['Meal'] == meal_type) & (meal_df['Dish Name'] == dish)]['Quantity (kg)'].mean()
                
                # Adjust quantity based on holiday
                quantity = base_quantity * adjustment_factor
                
                daily_menu.append({
                    'date': current_date.strftime('%d/%m/%Y'),
                    'meal_type': meal_type,
                    'dish_name': dish,
                    'planned_quantity': round(max(0.5, quantity), 2),
                    'is_holiday': is_holiday_period
                })
        
        complete_menu.extend(daily_menu)
        
        # Move to next date
        current_date = current_date + pd.Timedelta(days=1)
    
    return complete_menu


def load_holiday_data(holiday_file):
    """
    Load holiday data from a CSV file
    
    :param holiday_file: Path to the holiday CSV file
    :return: DataFrame containing holiday information
    """
    try:
        # Read holiday data
        holiday_data = pd.read_csv(holiday_file)
        
        # Convert date columns to datetime
        holiday_data['Start Date'] = pd.to_datetime(holiday_data['Start Date'], format='%d/%m/%Y')
        holiday_data['End Date'] = pd.to_datetime(holiday_data['End Date'], format='%d/%m/%Y')
        
        # Calculate holiday duration
        holiday_data['Duration'] = (holiday_data['End Date'] - holiday_data['Start Date']).dt.days + 1
        
        # Optional: Filter for holidays lasting at least a certain number of days
        # holiday_data = holiday_data[holiday_data['Duration'] >= 1]
        
        return holiday_data
    
    except Exception as e:
        print(f"Error loading holiday data: {e}")
        # Return an empty DataFrame if file can't be read
        return pd.DataFrame(columns=['Holiday', 'Start Date', 'End Date'])


def save_menu_to_csv(menu_suggestions, start_date, end_date):
    """
    Save menu suggestions to CSV
    
    :param menu_suggestions: List of menu suggestion dictionaries
    :param start_date: Start date of the menu
    :param end_date: End date of the menu
    :return: Path of the saved CSV file
    """
    # Convert to DataFrame
    menu_df = pd.DataFrame(menu_suggestions)
    
    # Create filename
    sd = "("+start_date.replace("/","_")+")"
    ed = "("+end_date.replace("/","_")+")"
    path_name = f'../predictions/suggested_menu_from{sd}to{ed}.csv'
    
    # Save to CSV
    menu_df.to_csv(path_name, index=False)
    print(f"Menu from {start_date} to {end_date} stored in {path_name}")
    
    return path_name

# Example usage in Flask route
def generate_menu_suggestion_route(start_date, end_date, consumption_data, holiday_data):
    """
    Prepare meal data and generate menu suggestions
    
    :param start_date: Start date of menu
    :param end_date: End date of menu
    :param consumption_data: Database fetched consumption records
    :param holiday_data: Holiday information
    :return: Menu suggestions
    """
    # Organize consumption data by meal type
    meal_data = {
        'Breakfast': [],
        'Lunch': [],
        'Dinner': []
    }
    
    for record in consumption_data:
        meal_type = record['meal_type']
        meal_data[meal_type].append({
            'food_item_id': record['food_item_id'],
            'dish_name': record['dish_name'],
            'category': record['category'],
            'total_consumed': record['total_consumed']
        })
    
    # Generate menu
    menu_items = generate_menu_for_date_range(
        start_date, 
        end_date, 
        meal_data, 
        holiday_data,
        n_dishes=3
    )
    
    # Optionally save to CSV
    save_menu_to_csv(menu_items, start_date, end_date)
    
    return menu_items