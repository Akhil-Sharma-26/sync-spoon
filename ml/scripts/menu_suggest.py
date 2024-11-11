import pandas as pd
import random
from datetime import datetime

# Helper function to check if dishes have similar words
def are_dishes_similar(dish1, dish2):
    common_variations = ['rice', 'roti', 'chapati', 'bhaji', 'chole', 'paneer', 'aloo', 'gobi', 'mushroom', 'bhindi']
    for word in common_variations:
        if word in dish1.lower() and word in dish2.lower():
            return True
    return False

# Function to select the staple item for lunch and dinner
def select_staple_item(meal_data):
    staple_candidates = meal_data.groupby('Dish Name')['Quantity (kg)'].sum().sort_values(ascending=False)
    staple_item = staple_candidates.index[0] if not staple_candidates.empty else None
    return staple_item

# Function to calculate median and range of quantities for each dish
def get_dish_quantity_range(df, dish, meal):
    df[['Start Date', 'End Date']] = df['Date Range'].str.split('-', expand=True)
    df['Start Date'] = pd.to_datetime(df['Start Date'], format='%d/%m/%Y')
    df['End Date'] = pd.to_datetime(df['End Date'], format='%d/%m/%Y')

    relevant_data = df[(df['Meal'] == meal) & (df['Dish Name'] == dish)]
    if not relevant_data.empty:
        quantities = []
        for _, row in relevant_data.iterrows():
            start_date = row['Start Date']
            end_date = row['End Date']
            total_quantity = row['Quantity (kg)']
            date_range_days = (end_date - start_date).days + 1
            daily_quantity = total_quantity / date_range_days
            quantities.append(daily_quantity)
        
        median_quantity = pd.Series(quantities).median()
        min_quantity = pd.Series(quantities).min()
        max_quantity = pd.Series(quantities).max()
        
        return median_quantity, min_quantity, max_quantity
    else:
        return 0, 0, 0

# Function to compute weighted average of quantities from both datasets
def get_weighted_quantity_range(dish, meal, most_df, least_df, factor=1.0):
    most_median_quantity, most_min_quantity, most_max_quantity = get_dish_quantity_range(most_df, dish, meal)
    least_median_quantity, least_min_quantity, least_max_quantity = get_dish_quantity_range(least_df, dish, meal)

    # If no historical data, return a fallback quantity
    if most_median_quantity == 0 and least_median_quantity == 0:
        return random.uniform(0.5, 1.5)  # fallback range

    # Combining ranges based on presence in datasets
    if most_median_quantity == 0:
        return random.uniform(least_min_quantity, least_max_quantity) * factor
    elif least_median_quantity == 0:
        return random.uniform(most_min_quantity, most_max_quantity) * factor

    # Weighted averaging of min and max ranges
    weighted_min = (most_min_quantity + least_min_quantity) / 2
    weighted_max = (most_max_quantity + least_max_quantity) / 2
    return random.uniform(weighted_min, weighted_max) * factor

# Load holiday data and ensure holidays last at least 7 days
def load_holiday_data(holiday_file):
    holiday_data = pd.read_csv(holiday_file)
    holiday_data['Start Date'] = pd.to_datetime(holiday_data['Start Date'], format='%d/%m/%Y')
    holiday_data['End Date'] = pd.to_datetime(holiday_data['End Date'], format='%d/%m/%Y')
    holiday_data['Duration'] = (holiday_data['End Date'] - holiday_data['Start Date']).dt.days
    holiday_data = holiday_data[holiday_data['Duration'] >= 7]
    return holiday_data

# Helper function to check if the date falls in any holiday range
def is_holiday(date, holiday_data):
    for _, row in holiday_data.iterrows():
        if row['Start Date'] <= date <= row['End Date']:
            return row['Holiday']
    return None

# Function to generate menu for a specific date
def generate_menu_for_date(date, most_df, least_df, n_dishes, holiday=False, adjustment_factor=0.75):
    final_menu = []

    for meal in ['Breakfast', 'Lunch', 'Dinner']:
        most_meal_data = most_df[most_df['Meal'] == meal]
        least_meal_data = least_df[least_df['Meal'] == meal]

        if meal in ['Lunch', 'Dinner']:
            # Select the staple item for lunch and dinner
            staple_item = select_staple_item(most_meal_data)
            selected_dishes = [staple_item] if staple_item else []

            # Exclude similar dishes from selection pool
            most_meal_data = most_meal_data[~most_meal_data['Dish Name'].apply(lambda x: are_dishes_similar(x, staple_item))]
            least_meal_data = least_meal_data[~least_meal_data['Dish Name'].apply(lambda x: are_dishes_similar(x, staple_item))]

        else:
            selected_dishes = []

        # Select additional dishes to meet n_dishes, prioritizing variety and ensuring no overlap
        while len(selected_dishes) < n_dishes:
            candidate_pool = most_meal_data if len(selected_dishes) < n_dishes // 2 else least_meal_data
            candidate_dishes = candidate_pool['Dish Name'].tolist()
            candidate_dishes = [dish for dish in candidate_dishes if dish not in selected_dishes and
                                all(not are_dishes_similar(dish, selected) for selected in selected_dishes)]

            if not candidate_dishes:
                break

            chosen_dish = random.choice(candidate_dishes)
            selected_dishes.append(chosen_dish)

        for dish in selected_dishes:
            quantity = get_weighted_quantity_range(dish, meal, most_df, least_df)

            # Apply holiday adjustment if it's a holiday
            if holiday:
                quantity *= adjustment_factor

            final_menu.append([date.strftime('%d/%m/%Y'), meal, dish, round(quantity, 2)])

    return final_menu

# Function to generate menu for a date range
def generate_menu_for_date_range(start_date, end_date, most_df, least_df, holiday_data, n_dishes=3, adjustment_factor=0.75):
    start_date = pd.to_datetime(start_date, format='%d/%m/%Y')
    end_date = pd.to_datetime(end_date, format='%d/%m/%Y')

    date_range = pd.date_range(start=start_date, end=end_date)
    complete_menu = []

    for date in date_range:
        holiday_name = is_holiday(date, holiday_data)

        if holiday_name:
            print(f"Generating holiday menu for {date.strftime('%d/%m/%Y')} - Holiday: {holiday_name}")
            daily_menu = generate_menu_for_date(date, most_df, least_df, n_dishes, holiday=True, adjustment_factor=adjustment_factor)
        else:
            print(f"Generating normal menu for {date.strftime('%d/%m/%Y')}")
            daily_menu = generate_menu_for_date(date, most_df, least_df, n_dishes, holiday=False, adjustment_factor=adjustment_factor)

        complete_menu.extend(daily_menu)

    menu_df = pd.DataFrame(complete_menu, columns=['Date', 'Meal', 'Dish Name', 'Quantity (kg)'])
    menu_df.to_csv('ml/predictions/suggested_menu.csv', index=False)

    print(f"Menu from {start_date} to {end_date} stored in suggested_menu.csv")

