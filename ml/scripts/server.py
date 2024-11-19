from flask import Flask, request, jsonify
import pandas as pd
from generate_aggregated_reports import (
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

app = Flask(__name__)

# Load data and holiday data at startup
data_file_path = '../data/aug2023_24_meals.csv'
holiday_file_path = '../data/holidays2023_24.csv'
data = pd.read_csv(data_file_path)
holiday_data = load_holiday_data(holiday_file_path)

@app.route('/generate_reports', methods=['POST'])
def generate_reports():
    try:
        # Generate weekly and monthly reports
        generate_weekly_report(data)
        generate_monthly_report(data)

        # Load the generated reports
        weekly_df = pd.read_csv('../reports/weekly_report.csv')
        monthly_df = pd.read_csv('../reports/monthly_report.csv')

        # Generate expanded reports
        expand_and_sum_most_consumed_weekly(weekly_df)
        expand_and_sum_least_consumed_weekly(weekly_df)
        expand_and_sum_most_consumed_monthly(monthly_df)
        expand_and_sum_least_consumed_monthly(monthly_df)

        return jsonify({"message": "Reports generated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate_menu', methods=['POST'])
def generate_menu():
    try:
        # Get date range from request
        req_data = request.json
        start_date = req_data.get('start_date')
        end_date = req_data.get('end_date')

        # Load the expanded reports
        most_expanded_df = pd.read_csv('../reports/most_expanded_weekly_report.csv')
        least_expanded_df = pd.read_csv('../reports/least_expanded_weekly_report.csv')

        # Generate the menu for the given date range
        generate_menu_for_date_range(start_date, end_date, most_expanded_df, least_expanded_df, holiday_data, n_dishes=3, adjustment_factor=0.75)

        return jsonify({"message": f"Menu generated from {start_date} to {end_date}!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)