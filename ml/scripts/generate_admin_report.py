from fpdf import FPDF
import pandas as pd

# Helper function to find most and least consumed dishes
def find_most_least_consumed(df):
    dish_consumption = df.groupby(['Meal', 'Dish Name'])['Quantity (kg)'].sum().reset_index()
    result = {}

    for meal in ['Breakfast', 'Lunch', 'Dinner']:
        meal_data = dish_consumption[dish_consumption['Meal'] == meal]
        if not meal_data.empty:
            most_consumed = meal_data.loc[meal_data['Quantity (kg)'].idxmax()]
            least_consumed = meal_data.loc[meal_data['Quantity (kg)'].idxmin()]

            # Format the quantities to two decimal points
            most_consumed_str = f"{most_consumed['Dish Name']} - {most_consumed['Quantity (kg)']:.2f} kg"
            least_consumed_str = f"{least_consumed['Dish Name']} - {least_consumed['Quantity (kg)']:.2f} kg"

            result[meal] = {
                'Most Consumed': most_consumed_str,
                'Least Consumed': least_consumed_str
            }
    
    return result


# Function to process weekly report
def get_weekly_report(most_expanded_weekly, least_expanded_weekly, start_date, end_date):
    most_expanded_weekly['Start Date'] = pd.to_datetime(most_expanded_weekly['Date Range'].str.split('-').str[0], format='%d/%m/%Y')
    most_expanded_weekly['End Date'] = pd.to_datetime(most_expanded_weekly['Date Range'].str.split('-').str[1], format='%d/%m/%Y')
    least_expanded_weekly['Start Date'] = pd.to_datetime(least_expanded_weekly['Date Range'].str.split('-').str[0], format='%d/%m/%Y')
    least_expanded_weekly['End Date'] = pd.to_datetime(least_expanded_weekly['Date Range'].str.split('-').str[1], format='%d/%m/%Y')

    # Filter data for the specified date range
    most_filtered = most_expanded_weekly[(most_expanded_weekly['End Date'] >= start_date) & (most_expanded_weekly['Start Date'] <= end_date)]
    least_filtered = least_expanded_weekly[(least_expanded_weekly['End Date'] >= start_date) & (least_expanded_weekly['Start Date'] <= end_date)]

    # Combine filtered data
    combined_df = pd.concat([most_filtered, least_filtered])
    return find_most_least_consumed(combined_df)

# Function to process monthly report
def get_monthly_report(most_expanded_monthly, least_expanded_monthly, month_year):
    most_expanded_monthly['Month']= [x.lower() for x in most_expanded_monthly['Month']]
    least_expanded_monthly['Month']= [x.lower() for x in least_expanded_monthly['Month']]
    combined_df = pd.concat([most_expanded_monthly[most_expanded_monthly['Month'] == month_year],
                             least_expanded_monthly[least_expanded_monthly['Month'] == month_year]])
    return find_most_least_consumed(combined_df)

# Function to create PDF report
def create_pdf(report_data, report_type, start_date=None, end_date=None, month_year=None):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Set title based on report type
    if report_type == 'weekly':
        title = f"Weekly Consumption Report for {start_date.strftime('%d/%m/%Y')} to {end_date.strftime('%d/%m/%Y')}"
    elif report_type == 'monthly':
        title = f"Monthly Consumption Report for {month_year}"
    
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(200, 10, txt=title, ln=True, align='C')

    # Set content
    pdf.ln(10)
    
    for meal, data in report_data.items():
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(200, 10, txt=f"{meal}:", ln=True)
        
        for consumption_type, details in data.items():
            pdf.set_font('Arial', '', 12)
            pdf.cell(200, 10, txt=f"{consumption_type}: {details}", ln=True)
        
        pdf.ln(5)
    
    # Save PDF with the report title in the filename
    
    if report_type == 'weekly':
        wn=f"weekly_consumption_report_from({start_date.strftime('%d_%m_%Y')})to({end_date.strftime('%d_%m_%Y')}).pdf"
        filename = f"ml/admin_reports/{wn}"
        pdf.output(filename)
        print("Saved consumption report as: ",wn)
    elif report_type == 'monthly':
        mn=f"monthly_consumption_report_{month_year}.pdf"
        filename = f"ml/admin_reports/{mn}"
        pdf.output(filename)
        print("Saved consumption report as: ",mn)
    
    
# Main function for generating the report
def create_admin_report(report_type, most_expanded_file, least_expanded_file, date_range=None, month_year=None):
    most_expanded_df = pd.read_csv(most_expanded_file)
    least_expanded_df = pd.read_csv(least_expanded_file)

    if report_type == 'weekly' and date_range:
        start_date = pd.to_datetime(date_range[0], format='%d/%m/%Y')
        end_date = pd.to_datetime(date_range[1], format='%d/%m/%Y')
        report_data = get_weekly_report(most_expanded_df, least_expanded_df, start_date, end_date)
        create_pdf(report_data, report_type, start_date, end_date)
        
    elif report_type == 'monthly' and month_year:
        report_data = get_monthly_report(most_expanded_df, least_expanded_df, month_year)
        create_pdf(report_data, report_type, month_year=month_year)
        

