import pandas as pd

def display_menu(df, start_date, end_date, role):

    # Convert 'date' column to datetime format
    df['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y')
    start_date = pd.to_datetime(start_date, format='%d/%m/%Y')
    end_date = pd.to_datetime(end_date, format='%d/%m/%Y')

    # Filter the data for the given date range
    filtered_df = df[(df['date'] >= start_date) & (df['date'] <= end_date)]

    # Check if the filtered data is empty
    if filtered_df.empty:
        print("No menu data available for the entire given date range.")
        return

    # Check for missing dates beyond or before the available data
    min_date_in_data = df['date'].min()
    max_date_in_data = df['date'].max()
    
    if start_date < min_date_in_data:
        print(f"Menu data not available before {min_date_in_data.strftime('%d/%m/%Y')}.")
    if end_date > max_date_in_data:
        print(f"Menu data not available beyond {max_date_in_data.strftime('%d/%m/%Y')}.")

    # Display the menu based on the role
    print("\nMenu Details:\n" + "-" * 60)
    for _, row in filtered_df.iterrows():
        date_str = row['date'].strftime('%d/%m/%Y')

        breakfast_items = row['breakfast_items'].split(';')
        lunch_items = row['lunch_items'].split(';')
        dinner_items = row['dinner_items'].split(';')

        breakfast_quantities = row['breakfast_kg'].split(';') if role in [1, 2] else []
        lunch_quantities = row['lunch_kg'].split(';') if role in [1, 2] else []
        dinner_quantities = row['dinner_kg'].split(';') if role in [1, 2] else []

        print(f"Date: {date_str}")
        
        # Breakfast Menu
        print("Breakfast:")
        for i, item in enumerate(breakfast_items):
            if role in [1, 2]:
                quantity = breakfast_quantities[i] if i < len(breakfast_quantities) else "N/A"
                print(f"  - {item.strip()} ({quantity} kg)")
            else:
                print(f"  - {item.strip()}")

        # Lunch Menu
        print("Lunch:")
        for i, item in enumerate(lunch_items):
            if role in [1, 2]:
                quantity = lunch_quantities[i] if i < len(lunch_quantities) else "N/A"
                print(f"  - {item.strip()} ({quantity} kg)")
            else:
                print(f"  - {item.strip()}")

        # Dinner Menu
        print("Dinner:")
        for i, item in enumerate(dinner_items):
            if role in [1, 2]:
                quantity = dinner_quantities[i] if i < len(dinner_quantities) else "N/A"
                print(f"  - {item.strip()} ({quantity} kg)")
            else:
                print(f"  - {item.strip()}")
        
        print("-" * 60)

# Sample usage
# Role 1 or 2: Display menu with quantities
# Role 3: Display menu without quantities

