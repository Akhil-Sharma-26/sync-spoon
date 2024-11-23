import pandas as pd
import os
import logging

logger = logging.getLogger(__name__)

def generate_weekly_report(most_expanded_df, least_expanded_df, start_datetime, end_datetime):
    """
    Generate a comprehensive weekly report
    """
    # Print DataFrame columns for debugging
    logger.info(f"Most Expanded DF Columns: {most_expanded_df.columns}")
    logger.info(f"Least Expanded DF Columns: {least_expanded_df.columns}")

    # Ensure the required columns exist
    required_columns = ['Date Range', 'Meal', 'Dish Name', 'Quantity (kg)']
    
    for col in required_columns:
        if col not in most_expanded_df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Extract start date from 'Date Range' and convert to datetime
    most_expanded_df['start_date'] = most_expanded_df['Date Range'].str.split('-').str[0]
    least_expanded_df['start_date'] = least_expanded_df['Date Range'].str.split('-').str[0]

    most_expanded_df['start_date'] = pd.to_datetime(most_expanded_df['start_date'], format='%d/%m/%Y', errors='coerce')
    least_expanded_df['start_date'] = pd.to_datetime(least_expanded_df['start_date'], format='%d/%m/%Y', errors='coerce')

    # Check for NaT values after conversion
    if most_expanded_df['start_date'].isnull().any():
        logger.error("There are invalid date entries in most_expanded_df.")
        raise ValueError("Invalid date entries found in most_expanded_df.")
    
    if least_expanded_df['start_date'].isnull().any():
        logger.error("There are invalid date entries in least_expanded_df.")
        raise ValueError("Invalid date entries found in least_expanded_df.")

    # Filter data within the specified date range
    filtered_most_expanded = most_expanded_df[
        (most_expanded_df['start_date'] >= start_datetime) & 
        (most_expanded_df['start_date'] <= end_datetime)
    ]
    filtered_least_expanded = least_expanded_df[
        (least_expanded_df['start_date'] >= start_datetime) & 
        (least_expanded_df['start_date'] <= end_datetime)
    ]

    # Generate summary statistics
    summary = {
        'Total Quantity (kg)': filtered_most_expanded['Quantity (kg)'].sum(),
        'Most Consumed Dishes': filtered_most_expanded.groupby('Dish Name')['Quantity (kg)'].sum().nlargest(10).to_dict(),
        'Least Consumed Dishes': filtered_least_expanded.groupby('Dish Name')['Quantity (kg)'].sum().nsmallest(10).to_dict(),
        'Meal Type Distribution': filtered_most_expanded.groupby('Meal')['Quantity (kg)'].sum().to_dict()
    }

    # Create a DataFrame for the summary
    summary_df = pd.DataFrame.from_dict(summary, orient='index').T

    # Ensure the directory exists
    # os.makedirs('../csv_reports', exist_ok=True)

    # # Save the summary to CSV
    # summary_path = '../csv_reports/weekly_summary_report.csv'
    # summary_df.to_csv(summary_path, index=False)

    return summary_df, filtered_most_expanded, filtered_least_expanded