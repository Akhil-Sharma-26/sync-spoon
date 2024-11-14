import pandas as pd
from datetime import datetime, timedelta
from calendar import monthrange
from collections import Counter

# Helper function to parse kg data into a dictionary for analysis
def parse_kg_data(kg_column, items_column):
    items = items_column.split(";")
    quantities = kg_column.split(";")
    return {item.strip(): float(qty) for item, qty in zip(items, quantities) if qty.strip().replace(".", "", 1).isdigit()}

# Function to calculate the accurate date range for each week
def calculate_week_date_range(month_year, week):
    start_date = datetime.strptime(month_year, "%b%Y")
    start_of_week = start_date + timedelta(days=(int(week) - 1) * 7)
    last_day_of_month = monthrange(start_of_week.year, start_of_week.month)[1]
    end_of_month = start_of_week.replace(day=last_day_of_month)
    end_of_week = start_of_week + timedelta(days=6)
    
    # Ensure end of week does not exceed the current month
    if end_of_week > end_of_month:
        end_of_week = end_of_month
    return f"{start_of_week.strftime('%d/%m/%Y')}-{end_of_week.strftime('%d/%m/%Y')}"

# Function to generate the weekly report
def generate_weekly_report(data):
    weekly_summary = []
    week_data = {}

    for _, row in data.iterrows():
        week_key = f"{row['month_year']}_week{row['week'].replace('week', '')}"
        date_range = calculate_week_date_range(row['month_year'], row['week'].replace('week', ''))

        breakfast_data = parse_kg_data(row['breakfast_kg'], row['breakfast_items'])
        lunch_data = parse_kg_data(row['lunch_kg'], row['lunch_items'])
        dinner_data = parse_kg_data(row['dinner_kg'], row['dinner_items'])

        if week_key not in week_data:
            week_data[week_key] = {
                'Date Range': date_range,
                'Breakfast': Counter(),
                'Lunch': Counter(),
                'Dinner': Counter()
            }

        week_data[week_key]['Breakfast'].update(breakfast_data)
        week_data[week_key]['Lunch'].update(lunch_data)
        week_data[week_key]['Dinner'].update(dinner_data)

    for week_key, meals in week_data.items():
        for meal, counter in meals.items():
            if meal == 'Date Range':
                continue
            most_consumed = "; ".join([f"{item}: {qty:.2f}" for item, qty in counter.most_common(3)])
            least_consumed = "; ".join([f"{item}: {qty:.2f}" for item, qty in counter.most_common()[:-4:-1]])
            weekly_summary.append({
                'Week': week_key,
                'Date Range': meals['Date Range'],
                'Meal': meal,
                'Most Consumed Dishes (kg)': most_consumed,
                'Least Consumed Dishes (kg)': least_consumed
            })

    weekly_summary_df = pd.DataFrame(weekly_summary)
    weekly_path="ml/csv_reports/weekly_report.csv"
    weekly_summary_df.to_csv(weekly_path, index=False)
    #print("Weekly report saved as 'weekly_report.csv'.")
    return weekly_path
# Function to generate the monthly report
# def generate_monthly_report(data):
#     monthly_summary = []
#     month_data = {}

#     for _, row in data.iterrows():
#         month_year = row['month_year']

#         breakfast_data = parse_kg_data(row['breakfast_kg'], row['breakfast_items'])
#         lunch_data = parse_kg_data(row['lunch_kg'], row['lunch_items'])
#         dinner_data = parse_kg_data(row['dinner_kg'], row['dinner_items'])

#         if month_year not in month_data:
#             month_data[month_year] = {
#                 'Breakfast': Counter(),
#                 'Lunch': Counter(),
#                 'Dinner': Counter()
#             }

#         month_data[month_year]['Breakfast'].update(breakfast_data)
#         month_data[month_year]['Lunch'].update(lunch_data)
#         month_data[month_year]['Dinner'].update(dinner_data)

#     for month_year, meals in month_data.items():
#         for meal, counter in meals.items():
#             most_consumed = "; ".join([f"{item}: {qty:.2f}" for item, qty in counter.most_common(3)])
#             least_consumed = "; ".join([f"{item}: {qty:.2f}" for item, qty in counter.most_common()[:-4:-1]])
#             monthly_summary.append({
#                 'Month': month_year,
#                 'Meal': meal,
#                 'Most Consumed Dishes (kg)': most_consumed,
#                 'Least Consumed Dishes (kg)': least_consumed
#             })

#     monthly_summary_df = pd.DataFrame(monthly_summary)
#     monthly_path="ml/csv_reports/monthly_report.csv"
#     monthly_summary_df.to_csv(monthly_path, index=False)
#     #print("Monthly report saved as 'monthly_report.csv'.")
#     return monthly_path

