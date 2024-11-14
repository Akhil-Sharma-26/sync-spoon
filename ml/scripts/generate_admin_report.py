from fpdf import FPDF
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import tempfile
import os

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


# Function to create PDF report with additional features (graphs, tables)
def create_pdf(report_data, df, start_date=None, end_date=None, report_type='weekly'):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    title = f"Consumption Report for {start_date.strftime('%d/%m/%Y')} to {end_date.strftime('%d/%m/%Y')}"
    
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(200, 10, txt=title, ln=True, align='C')
    pdf.ln(10)

    # Filter the data for the specified date range
    df['Start Date'] = pd.to_datetime(df['Date Range'].str.split('-').str[0], format='%d/%m/%Y')
    df['End Date'] = pd.to_datetime(df['Date Range'].str.split('-').str[1], format='%d/%m/%Y')
    filtered_df = df[(df['End Date'] >= start_date) & (df['Start Date'] <= end_date)]

    # Add total consumption for the specified date range
    total_consumption = filtered_df.groupby('Meal')['Quantity (kg)'].sum().reset_index()

    # Add most and least consumed dishes
    for meal, data in report_data.items():
        total_meal = total_consumption[total_consumption['Meal'] == meal]
        total_quantity = f"{total_meal['Quantity (kg)'].values[0]:.2f} kg"
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(200, 10, txt=f"{meal} - Total Quantity Consumed: {total_quantity}", ln=True)
        for consumption_type, details in data.items():
            pdf.set_font('Arial', '', 12)
            pdf.cell(200, 10, txt=f"{consumption_type}: {details}", ln=True)
        pdf.ln(10)
    
    # Create and add a bar chart (for most and least consumed dishes per meal type)
    plt.figure(figsize=(8, 5))
    meal_data = filtered_df.groupby(['Meal', 'Dish Name'])['Quantity (kg)'].sum().reset_index()
    sns.barplot(x='Dish Name', y='Quantity (kg)', hue='Meal', data=meal_data)
    plt.title("Dish Consumption by Meal Type")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()

    # Save the plot as an image in memory
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='png')
    img_stream.seek(0)

    # Save the image to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmpfile:
        tmpfile.write(img_stream.read())  # Write the image data to the temporary file
        tmpfile_path = tmpfile.name  # Get the file path

    # Add image to PDF
    pdf.ln(3)
    pdf.image(tmpfile_path, x=10, y=pdf.get_y(), w=180)

    # Clean up the temporary file
    os.remove(tmpfile_path)

    # Save PDF with the report title in the filename
    if report_type == 'weekly':
        wn = f"consumption_report_from({start_date.strftime('%d_%m_%Y')})to({end_date.strftime('%d_%m_%Y')}).pdf"
        filename = f"ml/admin_reports/{wn}"
        pdf.output(filename)
        print(f"Saved consumption report as: {wn}")


# Main function for generating the report
def create_admin_report(most_expanded_file, least_expanded_file, date_range=None, report_type='weekly'):
    most_expanded_df = pd.read_csv(most_expanded_file)
    least_expanded_df = pd.read_csv(least_expanded_file)

    if date_range:
        start_date = pd.to_datetime(date_range[0], format='%d/%m/%Y')
        end_date = pd.to_datetime(date_range[1], format='%d/%m/%Y')
        report_data = get_weekly_report(most_expanded_df, least_expanded_df, start_date, end_date)
        create_pdf(report_data, most_expanded_df, start_date, end_date)