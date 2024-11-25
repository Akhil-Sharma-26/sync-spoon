# generate_expanded_reports.py
import pandas as pd
import os

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
        # Process breakfast
        breakfast_dishes = row['breakfast_items'].split(';')
        breakfast_quantities = row['breakfast_kg'].split(';')
        
        for dish, quantity in zip(breakfast_dishes, breakfast_quantities):
            expanded_data.append({
                'Month-Year': row['month_year'],
                'Week': row['week'],
                'Date': row['date'],
                'Meal': 'Breakfast',
                'Dish Name': dish.strip(),
                'Quantity (kg)': float(quantity.strip())
            })

        # Process lunch
        lunch_dishes = row['lunch_items'].split(';')
        lunch_quantities = row['lunch_kg'].split(';')
        
        for dish, quantity in zip(lunch_dishes, lunch_quantities):
            expanded_data.append({
                'Month-Year': row['month_year'],
                'Week': row['week'],
                'Date': row['date'],
                'Meal': 'Lunch',
                'Dish Name': dish.strip(),
                'Quantity (kg)': float(quantity.strip())
            })

        # Process dinner
        dinner_dishes = row['dinner_items'].split(';')
        dinner_quantities = row['dinner_kg'].split(';')
        
        for dish, quantity in zip(dinner_dishes, dinner_quantities):
            expanded_data.append({
                'Month-Year': row['month_year'],
                'Week': row['week'],
                'Date': row['date'],
                'Meal': 'Dinner',
                'Dish Name': dish.strip(),
                'Quantity (kg)': float(quantity.strip())
            })

    expanded_df = pd.DataFrame(expanded_data)
    
    # Ensure the directory exists
    os.makedirs('../csv_reports', exist_ok=True)
    
    weekly_most_path = '../csv_reports/most_expanded_expanded_report.csv'
    expanded_df.to_csv(weekly_most_path, index=False)
    return weekly_most_path

# Function to expand and aggregate the least consumed weekly report
def expand_and_sum_least_consumed_weekly(df):
    expanded_data = []

    for index, row in df.iterrows():
        # Process breakfast
        breakfast_dishes = row['breakfast_items'].split(';')
        breakfast_quantities = row['breakfast_kg'].split(';')
        
        for dish, quantity in zip(breakfast_dishes, breakfast_quantities):
            expanded_data.append({
                'Month-Year': row['month_year'],
                'Week': row['week'],
                'Date': row['date'],
                'Meal': 'Breakfast',
                'Dish Name': dish.strip(),
                'Quantity (kg)': float(quantity.strip())
            })

        # Process lunch
        lunch_dishes = row['lunch_items'].split(';')
        lunch_quantities = row['lunch_kg'].split(';')
        
        for dish, quantity in zip(lunch_dishes, lunch_quantities):
            expanded_data.append({
                'Month-Year': row['month_year'],
                'Week': row['week'],
                'Date': row['date'],
                'Meal': 'Lunch',
                'Dish Name': dish.strip(),
                'Quantity (kg)': float(quantity.strip())
            })

        # Process dinner
        dinner_dishes = row['dinner_items'].split(';')
        dinner_quantities = row['dinner_kg'].split(';')
        
        for dish, quantity in zip(dinner_dishes, dinner_quantities):
            expanded_data.append({
                'Month-Year': row['month_year'],
                'Week': row['week'],
                'Date': row['date'],
                'Meal': 'Dinner',
                'Dish Name': dish.strip(),
                'Quantity (kg)': float(quantity.strip())
            })

    expanded_df = pd.DataFrame(expanded_data)
    
    # Ensure the directory exists
    os.makedirs('../csv_reports', exist_ok=True)
    
    weekly_least_path = '../csv_reports/least_expanded_expanded_report.csv'
    expanded_df.to_csv(weekly_least_path, index=False)
    return weekly_least_path

def main():
    # Define the paths to the input CSV files
    most_consumed_path = '../data/aggregated_data.csv'  # Update with your actual path
    least_consumed_path = '../data/aggregated_data.csv'  # Update with your actual path

    # Read the input CSV files
    most_consumed_df = pd.read_csv(most_consumed_path)
    least_consumed_df = pd.read_csv(least_consumed_path)

    # Call the functions to generate expanded reports
    most_expanded_path = expand_and_sum_most_consumed_weekly(most_consumed_df)
    least_expanded_path = expand_and_sum_least_consumed_weekly(least_consumed_df)

    # Print paths of the generated reports
    print(f"Most Consumed Expanded Report: {most_expanded_path}")
    print(f"Least Consumed Expanded Report: {least_expanded_path}")

if __name__ == "__main__":
    main()