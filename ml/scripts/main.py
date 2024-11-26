import pandas as pd
from datetime import datetime

from generate_aggregated_reports import(
    generate_monthly_report,
    generate_weekly_report
)
from generate_expanded_reports import (
    expand_and_sum_most_consumed_weekly,
    expand_and_sum_least_consumed_weekly,
    expand_and_sum_most_consumed_monthly,
    expand_and_sum_least_consumed_monthly
)
from menu_suggest import (
    generate_menu_for_date_range,
    load_holiday_data
)

def main():
    
    # Load the dataset
    file_path = '../data/aug2023_24_meals.csv'
    data = pd.read_csv(file_path)

    # Generate both reports
    generate_weekly_report(data)
    generate_monthly_report(data)

    # Load the data for expanded reports
    weekly_df = pd.read_csv('../reports/weekly_report.csv')
    monthly_df = pd.read_csv('../reports/monthly_report.csv')

    # Generate the expanded and aggregated reports
    print("Generating expanded reports for most consumed dishes...")
    expand_and_sum_most_consumed_weekly(weekly_df)
    expand_and_sum_least_consumed_weekly(weekly_df)
    expand_and_sum_most_consumed_monthly(monthly_df)
    expand_and_sum_least_consumed_monthly(monthly_df)

    # Load the data for menu suggestion
    most_expanded_df = pd.read_csv('../reports/most_expanded_weekly_report.csv')
    least_expanded_df = pd.read_csv('../reports/least_expanded_weekly_report.csv')

    # Load the holiday data from CSV
    holiday_data = load_holiday_data('../data/holidays2023_24.csv')

    #accept date range from user
    sd=input("Enter start date in format DD/MM/YYYY: ")
    ed=input("Enter end date in format DD/MM/YYYY: ")

    # Call the function to generate menu for a date range
    print(f"Generating menu for the date range {sd} to {ed}...")
    generate_menu_for_date_range(sd, ed, most_expanded_df, least_expanded_df, holiday_data, n_dishes=3, adjustment_factor=0.75)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)
    
