import pandas as pd
from datetime import datetime

from generate_admin_report import(
    create_admin_report
)
from generate_aggregated_reports import(
    generate_weekly_report
)
from generate_expanded_reports import (
    expand_and_sum_most_consumed_weekly,
    expand_and_sum_least_consumed_weekly
)
from menu_suggest import (
    generate_menu_pdf
)
from view_menu import display_menu

def comb(agg_file,holiday_file,start_date,end_date,role,subopt):

    # Load the dataset
    data = pd.read_csv(agg_file)
    
    # Generate weekly reports
    weekly_path=generate_weekly_report(data)


    # Load the data for expanded reports
    weekly_df = pd.read_csv(weekly_path)

    # Generate the expanded and aggregated reports
    #print("Generating expanded reports for most consumed dishes...")
    weekly_most_path=expand_and_sum_most_consumed_weekly(weekly_df)
    weekly_least_path=expand_and_sum_least_consumed_weekly(weekly_df)

    # Load the data for menu suggestion
    most_expanded_df = pd.read_csv(weekly_most_path)
    least_expanded_df = pd.read_csv(weekly_least_path)

    # Load the holiday data from CSV
    holiday_data = pd.read_csv(holiday_file)
    

    if(role==2):
        
        generate_menu_pdf(start_date, end_date, most_expanded_df, least_expanded_df, holiday_data, n_dishes=3, adjustment_factor=0.75)

    
    elif(role==1):
        
        if(subopt=='/generate_reports'):

            print(f"Making consumption report for the date range {start_date} to {end_date}...")
            create_admin_report(weekly_most_path, weekly_least_path, date_range=(start_date,end_date))

        elif(subopt=='/generate_menu'):

            # Call the function to generate menu for a date range
            print(f"Generating menu for the date range {start_date} to {end_date}...")
            generate_menu_pdf(start_date, end_date, most_expanded_df, least_expanded_df, holiday_data, n_dishes=3, adjustment_factor=0.75)