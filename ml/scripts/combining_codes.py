import pandas as pd
from datetime import datetime

from generate_admin_report import(
    create_admin_report
)
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
from view_menu import display_menu

def comb(agg_file,holiday_file,role):

    # Load the dataset
    data = pd.read_csv(agg_file)
    
    # Generate both reports
    weekly_path=generate_weekly_report(data)
    monthly_path=generate_monthly_report(data)

    # Load the data for expanded reports
    weekly_df = pd.read_csv(weekly_path)
    monthly_df = pd.read_csv(monthly_path)

    # Generate the expanded and aggregated reports
    #print("Generating expanded reports for most consumed dishes...")
    weekly_most=expand_and_sum_most_consumed_weekly(weekly_df)
    weekly_least=expand_and_sum_least_consumed_weekly(weekly_df)
    monthly_most=expand_and_sum_most_consumed_monthly(monthly_df)
    monthly_least=expand_and_sum_least_consumed_monthly(monthly_df)

    # Load the data for menu suggestion
    most_expanded_df = pd.read_csv(weekly_most)
    least_expanded_df = pd.read_csv(weekly_least)

    # Load the holiday data from CSV
    holiday_data = load_holiday_data(holiday_file)
    

    if(role==3):
        #accept date range from user
        sd=input("Enter start date in format DD/MM/YYYY: ")
        ed=input("Enter end date in format DD/MM/YYYY: ")
        print(f"Viewing menu for the date range {sd} to {ed}...")
        display_menu(data,sd,ed,role)


    elif(role==2):
        choice=0
        while(choice!=1 and choice !=2 and choice!=3):
            choice=int(input("Enter 1 to create a suggested menu, 2 to view current menu, 3 to cancel:"))
        
        if(choice==1):
            
            sd=input("Enter start date in format DD/MM/YYYY: ")
            ed=input("Enter end date in format DD/MM/YYYY: ")

            generate_menu_for_date_range(sd, ed, most_expanded_df, least_expanded_df, holiday_data, n_dishes=3, adjustment_factor=0.75)

        elif(choice==2):
            sd=input("Enter start date in format DD/MM/YYYY: ")
            ed=input("Enter end date in format DD/MM/YYYY: ")
            print(f"Viewing menu for the date range {sd} to {ed}...")
            display_menu(data,sd,ed,role)

        else:
            print('Cancelled Process')
            return

    
    elif(role==1):
        choice=0
        while(choice!=1 and choice !=2 and choice!=3 and choice!=4):
            choice=int(input("Enter 1 to see reports,2 to create a suggested menu, 3 to view current menu, 4 to cancel:"))
        
        if(choice==1):
            rt="a"
            while(rt!="w" and rt!="m"):
                rt=input("Enter W for weekly report and M for monthly report: ").strip().lower()
            
            if(rt=="w"):
                sd=input("Enter start date in format DD/MM/YYYY: ")
                ed=input("Enter end date in format DD/MM/YYYY: ")
        
                print(f"Making consumption report for the date range {sd} to {ed}...")
                create_admin_report('weekly', weekly_most, weekly_least, date_range=(sd,ed))


            elif(rt=='m'):
                moy=input("Enter Month and year in format mmmYYYY (ex-aug2023): ").strip().lower()
                create_admin_report('monthly', monthly_most, monthly_least, month_year=moy)

            
        elif(choice==2):
            
            sd=input("Enter start date in format DD/MM/YYYY: ")
            ed=input("Enter end date in format DD/MM/YYYY: ")

            # Call the function to generate menu for a date range
            print(f"Generating menu for the date range {sd} to {ed}...")
            generate_menu_for_date_range(sd, ed, most_expanded_df, least_expanded_df, holiday_data, n_dishes=3, adjustment_factor=0.75)

        elif(choice==3):
            sd=input("Enter start date in format DD/MM/YYYY: ")
            ed=input("Enter end date in format DD/MM/YYYY: ")
            print(f"Viewing menu for the date range {sd} to {ed}...")
            display_menu(data,sd,ed,role)

        else:
            print('Cancelled Process')
            return