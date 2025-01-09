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

    return best_rf_model, label_encoder


#for execution of model
start_date=pd.to_datetime("12/11/2024", format='%d/%m/%Y')
end_date=pd.to_datetime("18/11/2024", format='%d/%m/%Y')
most_df=pd.read_csv('most_expanded_weekly_report.csv')
least_df=pd.read_csv('least_expanded_weekly_report.csv')
holiday_data = pd.read_csv('original_holidays.csv')

holiday_data['Start Date'] = pd.to_datetime(holiday_data['Start Date'], format='%d/%m/%Y')
holiday_data['End Date'] = pd.to_datetime(holiday_data['End Date'], format='%d/%m/%Y')
holiday_data['Duration'] = (holiday_data['End Date'] - holiday_data['Start Date']).dt.days
holiday_data = holiday_data[holiday_data['Duration'] >= 7]

# generate_menu_pdf(start_date, end_date, most_df, least_df, holiday_data, n_dishes=3, adjustment_factor=0.75)
model, label_encoder = train_random_forest_model(most_df, least_df,holiday_data)



#for predicting quantity(replace the base_quantity with this if possible)
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