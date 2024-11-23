# generate_expanded_reports.py
import pandas as pd

# Function to parse dish name and quantity from a string
def parse_dish_quantity(dish_string):
    try:
        name, quantity = dish_string.split(':')
        return name.strip(), float(quantity.strip().replace("kg", "").strip())
    except ValueError:
        return None, None

# Function to expand and aggregate the most consumed weekly report
def expand_and_sum_most_consumed_weekly(df):
    expanded_data = []

    for index, row in df.iterrows():
        dishes = row['Most Consumed Dishes (kg)'].split(';')
        dish_dict = {}

        for dish in dishes:
            dish_name, quantity_kg = parse_dish_quantity(dish)
            if dish_name and quantity_kg is not None:
                if dish_name in dish_dict:
                    dish_dict[dish_name] += quantity_kg  # Sum quantities if dish is repeated
                else:
                    dish_dict[dish_name] = quantity_kg

        # Append the aggregated data
        for dish_name, total_quantity in dish_dict.items():
            expanded_data.append({
                'Week': row['Week'],
                'Date Range': row['Date Range'],
                'Meal': row['Meal'],
                'Dish Name': dish_name,
                'Quantity (kg)': total_quantity
            })

    expanded_df = pd.DataFrame(expanded_data)
    weekly_most_path = '../csv_reports/most _expanded_weekly_report.csv'
    expanded_df.to_csv(weekly_most_path, index=False)
    return weekly_most_path

# Function to expand and aggregate the least consumed weekly report
def expand_and_sum_least_consumed_weekly(df):
    expanded_data = []

    for index, row in df.iterrows():
        dishes = row['Least Consumed Dishes (kg)'].split(';')
        dish_dict = {}

        for dish in dishes:
            dish_name, quantity_kg = parse_dish_quantity(dish)
            if dish_name and quantity_kg is not None:
                if dish_name in dish_dict:
                    dish_dict[dish_name] += quantity_kg  # Sum quantities if dish is repeated
                else:
                    dish_dict[dish_name] = quantity_kg

        # Append the aggregated data
        for dish_name, total_quantity in dish_dict.items():
            expanded_data.append({
                'Week': row['Week'],
                'Date Range': row['Date Range'],
                'Meal': row['Meal'],
                'Dish Name': dish_name,
                'Quantity (kg)': total_quantity
            })

    expanded_df = pd.DataFrame(expanded_data)
    weekly_least_path = '../csv_reports/least_expanded_weekly_report.csv'
    expanded_df.to_csv(weekly_least_path, index=False)
    return weekly_least_path