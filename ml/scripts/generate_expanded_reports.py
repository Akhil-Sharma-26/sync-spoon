import pandas as pd

# Helper function to parse dish-quantity pairs
def parse_dish_quantity(dish):
    try:
        dish_name, quantity_kg = dish.split(':')
        return dish_name.strip(), float(quantity_kg.strip())
    except (ValueError, AttributeError):
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
    expanded_df.to_csv('../reports/most_expanded_weekly_report.csv', index=False)
    print("Expanded weekly report for most consumed dishes saved as 'most_expanded_weekly_report.csv'.")

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
    expanded_df.to_csv('../reports/least_expanded_weekly_report.csv', index=False)
    print("Expanded weekly report for least consumed dishes saved as 'least_expanded_weekly_report.csv'.")

# Function to expand and aggregate the most consumed monthly report
def expand_and_sum_most_consumed_monthly(df):
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
                'Month': row['Month'],
                'Meal': row['Meal'],
                'Dish Name': dish_name,
                'Quantity (kg)': total_quantity
            })

    expanded_df = pd.DataFrame(expanded_data)
    expanded_df.to_csv('../reports/most_expanded_monthly_report.csv', index=False)
    print("Expanded monthly report for most consumed dishes saved as 'most_expanded_monthly_report.csv'.")

# Function to expand and aggregate the least consumed monthly report
def expand_and_sum_least_consumed_monthly(df):
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
                'Month': row['Month'],
                'Meal': row['Meal'],
                'Dish Name': dish_name,
                'Quantity (kg)': total_quantity
            })

    expanded_df = pd.DataFrame(expanded_data)
    expanded_df.to_csv('../reports/least_expanded_monthly_report.csv', index=False)
    print("Expanded monthly report for least consumed dishes saved as 'least_expanded_monthly_report.csv'.")

