import pandas as pd
import random
from datetime import datetime
from fpdf import FPDF
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import GridSearchCV
from sklearn.model_selection import cross_val_score

import numpy as np



def are_dishes_similar(dish1, dish2):
    common_variations = ['rice', 'roti', 'chapati', 'bhaji', 'chole', 'paneer', 'aloo', 'gobi', 'mushroom', 'bhindi']
    for word in common_variations:
        if word in dish1.lower() and word in dish2.lower():
            return True
    return False

# Function to select the staple item for lunch and dinner
def select_staple_item(meal_data):
    staple_candidates = meal_data.groupby('Dish Name')['Quantity (kg)'].sum().sort_values(ascending=False)
    staple_item = staple_candidates.index[0] if not staple_candidates.empty else None
    return staple_item

def is_holiday(date, holiday_data):
    """
    Checks if the given date falls within any holiday period of at least 7 days.
    """
    for _, row in holiday_data.iterrows():
        start_date = pd.to_datetime(row['Start Date'], format='%d/%m/%Y')
        end_date = pd.to_datetime(row['End Date'], format='%d/%m/%Y')
        duration = (end_date - start_date).days

        # Only consider holidays lasting at least 7 days
        if duration >= 7 and start_date <= date <= end_date:
            return True
    return False


def train_random_forest_model(most_df, least_df, holiday_data):
    combined_df = pd.concat([most_df, least_df], ignore_index=True)

    # Feature Engineering
    combined_df[['Start Date', 'End Date']] = combined_df['Date Range'].str.split('-', expand=True)
    combined_df['Start Date'] = pd.to_datetime(combined_df['Start Date'], format='%d/%m/%Y')
    combined_df['End Date'] = pd.to_datetime(combined_df['End Date'], format='%d/%m/%Y')
    combined_df['Duration'] = (combined_df['End Date'] - combined_df['Start Date']).dt.days + 1
    combined_df['Daily Quantity'] = combined_df['Quantity (kg)'] / combined_df['Duration']

    # Check if the date range overlaps with any holiday period
    combined_df['Holiday'] = combined_df.apply(lambda row: is_holiday(row['Start Date'], holiday_data), axis=1)

    # Encode categorical features
    label_encoder = LabelEncoder()
    combined_df['Dish Code'] = label_encoder.fit_transform(combined_df['Dish Name'])
    combined_df['Meal Code'] = label_encoder.fit_transform(combined_df['Meal'])

    # Prepare features and target
    X = combined_df[['Dish Code', 'Meal Code', 'Duration', 'Holiday']]
    y = combined_df['Daily Quantity']

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    param_grid = {
    'n_estimators': [100, 200, 500],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'max_features': ['auto', 'sqrt', 'log2']
    }

    grid_search = GridSearchCV(estimator=RandomForestRegressor(), param_grid=param_grid, cv=5, scoring='neg_mean_squared_error', verbose=2, n_jobs=-1)
    grid_search.fit(X_train, y_train)

    print("Best parameters:", grid_search.best_params_)

    best_rf_model = RandomForestRegressor(
    n_estimators=grid_search.best_params_['n_estimators'],
    max_depth=grid_search.best_params_['max_depth'],
    min_samples_split=grid_search.best_params_['min_samples_split'],
    min_samples_leaf=grid_search.best_params_['min_samples_leaf'],
    max_features=grid_search.best_params_['max_features'],
    random_state=42
    )

    best_rf_model.fit(X_train, y_train)


    # Evaluate the model
    y_pred = best_rf_model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    print(f"Random Forest Regressor MSE: {mse:.2f}")
    cv_scores = cross_val_score(best_rf_model, X_train, y_train, cv=5, scoring='neg_mean_squared_error')

    # Print cross-validation MSE
    print(f"Cross-validation MSE: {-cv_scores.mean()} ± {cv_scores.std()}")

    return best_rf_model, label_encoder

# Function to calculate median and range of quantities for each dish
def get_dish_quantity_range(df, dish, meal):
    df[['Start Date', 'End Date']] = df['Date Range'].str.split('-', expand=True)
    df['Start Date'] = pd.to_datetime(df['Start Date'], format='%d/%m/%Y')
    df['End Date'] = pd.to_datetime(df['End Date'], format='%d/%m/%Y')

    relevant_data = df[(df['Meal'] == meal) & (df['Dish Name'] == dish)]
    if not relevant_data.empty:
        quantities = []
        for _, row in relevant_data.iterrows():
            start_date = row['Start Date']
            end_date = row['End Date']
            total_quantity = row['Quantity (kg)']
            date_range_days = (end_date - start_date).days + 1
            daily_quantity = total_quantity / date_range_days
            quantities.append(daily_quantity)
        
        median_quantity = pd.Series(quantities).median()
        min_quantity = pd.Series(quantities).min()
        max_quantity = pd.Series(quantities).max()
        
        return median_quantity, min_quantity, max_quantity
    else:
        return 0, 0, 0

# Function to compute weighted average of quantities from both datasets
def get_weighted_quantity_range(dish, meal, most_df, least_df, factor=1.0):

    most_median_quantity, most_min_quantity, most_max_quantity = get_dish_quantity_range(most_df, dish, meal)
    least_median_quantity, least_min_quantity, least_max_quantity = get_dish_quantity_range(least_df, dish, meal)

    # If no historical data, return a fallback quantity
    if most_median_quantity == 0 and least_median_quantity == 0:
        return random.uniform(0.5, 1.5)  # fallback range

    # Combining ranges based on presence in datasets
    if most_median_quantity == 0:
        return random.uniform(least_min_quantity, least_max_quantity) * factor
    elif least_median_quantity == 0:
        return random.uniform(most_min_quantity, most_max_quantity) * factor

    # Weighted averaging of min and max ranges
    weighted_min = (most_min_quantity + least_min_quantity) / 2
    weighted_max = (most_max_quantity + least_max_quantity) / 2
    return random.uniform(weighted_min, weighted_max) * factor

def predict_quantity(dish, meal, duration, model, label_encoder, most_df, least_df, holiday_data, date, adjustment_factor=0.75, use_old_data=True):
    """
    Predicts the quantity for the given dish, considering whether it's old or new data
    and applies adjustments for holiday periods.
    """

    # Check if the date is a holiday
    is_holiday_flag = is_holiday(date, holiday_data)

    # Initialize variables
    quantity = None
    historical_data_found = False

    # Check if the dish and meal combination exists in the old data (most_df and least_df)
    if use_old_data:
        # Use the weighted quantity range method to get the quantity based on most_df and least_df
        quantity = get_weighted_quantity_range(dish, meal, most_df, least_df)

        # If historical data exists, flag it
        if quantity > 0:
            historical_data_found = True

    # If no historical data found or not using old data, use the model prediction
    if not historical_data_found:
        if dish not in label_encoder.classes_:
            label_encoder.classes_ = np.append(label_encoder.classes_, dish)

        dish_code = label_encoder.transform([dish])[0]
        meal_code = label_encoder.transform([meal])[0]
        features = np.array([[dish_code, meal_code, duration, int(is_holiday_flag)]])
        quantity = model.predict(features)[0]

    # Apply holiday adjustment if it's a holiday
    if is_holiday_flag:
        quantity *= adjustment_factor

    # Ensure a minimum fallback quantity
    return max(quantity, 0.5)


def generate_menu_for_date(date, most_df, least_df, n_dishes, model, label_encoder,holiday_data, holiday=False, adjustment_factor=0.75):
    final_menu = []

    for meal in ['Breakfast', 'Lunch', 'Dinner']:
        most_meal_data = most_df[most_df['Meal'] == meal]
        least_meal_data = least_df[least_df['Meal'] == meal]

        if meal in ['Lunch', 'Dinner']:
            staple_item = select_staple_item(most_meal_data)
            selected_dishes = [staple_item] if staple_item else []

            most_meal_data = most_meal_data[~most_meal_data['Dish Name'].apply(lambda x: are_dishes_similar(x, staple_item))]
            least_meal_data = least_meal_data[~least_meal_data['Dish Name'].apply(lambda x: are_dishes_similar(x, staple_item))]
        else:
            selected_dishes = []

        while len(selected_dishes) < n_dishes:
            candidate_pool = most_meal_data if len(selected_dishes) < n_dishes // 2 else least_meal_data
            candidate_dishes = candidate_pool['Dish Name'].tolist()
            candidate_dishes = [dish for dish in candidate_dishes if dish not in selected_dishes and
                                all(not are_dishes_similar(dish, selected) for selected in selected_dishes)]

            if not candidate_dishes:
                break

            chosen_dish = random.choice(candidate_dishes)
            selected_dishes.append(chosen_dish)

        for dish in selected_dishes:
            duration = 1
            quantity = predict_quantity(dish, meal, duration, model, label_encoder, most_df, least_df, holiday_data, date)

            if holiday:
                quantity *= adjustment_factor

            final_menu.append([date.strftime('%d/%m/%Y'), meal, dish, round(quantity, 2)])

    return final_menu


def generate_menu_pdf(start_date, end_date, most_df, least_df, holiday_data, n_dishes=3, adjustment_factor=0.75):
    # Format start and end dates for the filename
    sd = f"({start_date.replace('/', '_')})"
    ed = f"({end_date.replace('/', '_')})"

    model, label_encoder = train_random_forest_model(most_df, least_df,holiday_data)
    
    # Convert dates to datetime format
    start_date = pd.to_datetime(start_date, format='%d/%m/%Y')
    end_date = pd.to_datetime(end_date, format='%d/%m/%Y')

    # Set up FPDF object
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Add title
    pdf.set_font("Arial", size=16, style='B')
    pdf.cell(200, 10, txt=f"Suggested Menu for {start_date.strftime('%d/%m/%Y')} to {end_date.strftime('%d/%m/%Y')}", ln=True, align='C')
    pdf.ln(10)  # Line break

    # Column headers
    pdf.set_font("Arial", size=10, style='B')
    pdf.cell(40, 10, "Date", border=1, align='C')
    pdf.cell(40, 10, "Meal", border=1, align='C')
    pdf.cell(80, 10, "Dish Name", border=1, align='C')
    pdf.cell(30, 10, "Quantity (kg)", border=1, align='C')
    pdf.ln()

    # Set font for table content
    pdf.set_font("Arial", size=10)

    # Generate the menu for the date range
    date_range = pd.date_range(start=start_date, end=end_date)
    complete_menu = []

    for date in date_range:
        # Check if the current date is a holiday
        holiday_name = is_holiday(date, holiday_data)
        is_holiday_flag = holiday_name is not None

        # Generate the menu for the current date
        daily_menu = generate_menu_for_date(date, most_df, least_df, n_dishes, model, label_encoder, holiday_data=holiday_data,holiday=is_holiday_flag, adjustment_factor=adjustment_factor)
        complete_menu.extend(daily_menu)

    # Add each dish to the PDF
    for row in complete_menu:
        pdf.cell(40, 10, row[0], border=1, align='C')  # Date
        pdf.cell(40, 10, row[1], border=1, align='C')  # Meal
        pdf.cell(80, 10, row[2], border=1, align='L')  # Dish Name
        pdf.cell(30, 10, f"{row[3]:.2f}", border=1, align='R')  # Quantity (formatted to two decimal places)
        pdf.ln()

    # Define the output file path
    pdf_output_path = f"ml/predictions/Suggested_Menu_from({start_date.strftime('%d_%m_%Y')})to({end_date.strftime('%d_%m_%Y')}).pdf"
    pdf.output(pdf_output_path)

    print(f"Menu from {start_date.strftime('%d/%m/%Y')} to {end_date.strftime('%d/%m/%Y')} saved as {pdf_output_path}")

