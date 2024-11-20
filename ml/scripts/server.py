import os
import json
import logging
import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import pandas as pd

# Import custom modules
from menu_suggest import (
    generate_menu_for_date_range,
    save_menu_to_csv,
    load_holiday_data
)
from generate_aggregated_reports import (
    generate_weekly_report, 
    generate_monthly_report
)
from generate_expanded_reports import (
    expand_and_sum_most_consumed_weekly,
    expand_and_sum_least_consumed_weekly,
    expand_and_sum_most_consumed_monthly,
    expand_and_sum_least_consumed_monthly
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Flask App Configuration
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "methods": ["GET", "POST", "PATCH", "DELETE"]
    }
})

# Database Connection Utility
class DatabaseConnection:
    @staticmethod
    def get_connection():
        try:
            conn = psycopg2.connect(os.getenv('DATABASE_URL'))
            logger.info("Database connection established successfully")
            return conn
        except psycopg2.Error as db_err:
            logger.error(f"Database connection failed: {db_err}")
            raise Exception(f"Database connection failed: {db_err}")

# Utility Functions
def generate_menu_suggestion_route(start_date, end_date, consumption_data, holiday_data):
    """
    Prepare meal data and generate menu suggestions
    """
    # Organize consumption data by meal type
    meal_data = {
        'Breakfast': [],
        'Lunch': [],
        'Dinner': []
    }
    
    for record in consumption_data:
        # Robust meal type handling
        meal_type = record.get('meal_type', '').title().strip()
        
        if meal_type not in meal_data:
            logger.warning(f"Invalid meal type '{meal_type}'. Skipping record.")
            continue
        
        meal_data[meal_type].append({
            'food_item_id': record.get('food_item_id'),
            'dish_name': record.get('dish_name', 'Unknown Dish'),
            'category': record.get('category', 'Unknown'),
            'total_consumed': record.get('total_consumed', 0)
        })

    # Generate menu
    menu_items = generate_menu_for_date_range(
        start_date, 
        end_date, 
        meal_data, 
        holiday_data,
        n_dishes=3
    )
    
    # Save to CSV
    # save_menu_to_csv(menu_items, start_date, end_date)
    
    return menu_items

# Route Handlers
@app.route('/generate_menu_suggestion', methods=['POST'])
def generate_menu_suggestion():
    conn = None
    try:
        # Parse and validate request data
        req_data = request.json
        start_date = req_data.get('start_date')
        end_date = req_data.get('end_date')
        user_id = req_data.get('user_id')

        # Validate input dates
        try:
            start_datetime = datetime.strptime(start_date, '%d/%m/%Y')
            end_datetime = datetime.strptime(end_date, '%d/%m/%Y')
            
            # Convert to PostgreSQL date format (YYYY-MM-DD)
            start_date_pg = start_datetime.strftime('%Y-%m-%d')
            end_date_pg = end_datetime.strftime('%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format. Use dd/mm/yyyy"}), 400

        # Establish database connection
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # Check for existing valid menu suggestion
        cursor.execute("""
            SELECT id, menu_data 
            FROM se_menu_suggestions 
            WHERE suggested_by = %s 
            AND status = 'PENDING' 
            AND start_date = %s 
            AND end_date = %s
            ORDER BY created_at DESC 
            LIMIT 1
        """, (user_id, start_date_pg, end_date_pg))
        existing_suggestion = cursor.fetchone()

        # If existing suggestion found, return it
        if existing_suggestion:
            return jsonify({
                "message": "Existing menu suggestion retrieved",
                "suggestion_id": existing_suggestion['id'],
                "start_date": start_date,
                "end_date": end_date,
                "menu_items": json.loads(existing_suggestion['menu_data'])
            }), 200

        # Load holiday data
        holiday_data = load_holiday_data('../data/original_holidays.csv')

        # Fetch consumption records for menu suggestion
        cursor.execute("""
            WITH ranked_dishes AS (
                SELECT 
                    f.id AS food_item_id, 
                    f.name AS dish_name, 
                    f.category,
                    UPPER(TRIM(cr.meal_type)) AS meal_type,
                    SUM(cr.quantity) AS total_consumed,
                    RANK() OVER (
                        PARTITION BY UPPER(TRIM(cr.meal_type)) 
                        ORDER BY SUM(cr.quantity) DESC
                    ) as consumption_rank
                FROM 
                    se_food_items f
                    LEFT JOIN se_consumption_records cr ON f.id = cr.food_item_id
                WHERE 
                    UPPER(TRIM(cr.meal_type)) IN ('BREAKFAST', 'LUNCH', 'DINNER')
                GROUP BY 
                    f.id, f.name, f.category, cr.meal_type
            )
            SELECT 
                food_item_id, 
                dish_name, 
                category, 
                meal_type, 
                total_consumed
            FROM 
                ranked_dishes
            WHERE 
                consumption_rank <= 5
            ORDER BY 
                meal_type, total_consumed DESC
        """)
        consumption_data = cursor.fetchall()

        # Use default dishes if no consumption data
        if not consumption_data:
            default_dishes = [
                {
                    'food_item_id': None,
                    'dish_name': dish,
                    'category': 'Default',
                    'meal_type': meal_type,
                    'total_consumed': qty
                } 
                for meal_type, dishes in {
                    'BREAKFAST': [('Idli', 100), ('Dosa', 80), ('Upma', 60)],
                    'LUNCH': [('Roti', 200), ('Rice', 180), ('Chicken Curry', 150)],
                    'DINNER': [('Roti', 180), ('Rice', 160), ('Fruit Salad', 100)]
                }.items() 
                for dish, qty in dishes
            ]
            consumption_data = default_dishes

        # Normalize consumption data
        normalized_consumption_data = [
            {
                'food_item_id': row['food_item_id'],
                'dish_name': row['dish_name'],
                'category': row['category'],
                'meal_type': row['meal_type'].title(),
                'total_consumed': row['total_consumed']
            } for row in consumption_data
        ]

        # Generate menu suggestions
        menu_items = generate_menu_suggestion_route(
            start_date, 
            end_date, 
            normalized_consumption_data, 
            holiday_data
        )

        # Save menu suggestion to database
        cursor.execute("""
            INSERT INTO se_menu_suggestions 
            (start_date, end_date, status, suggested_by, menu_data, created_at) 
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP) 
            RETURNING id
        """, (
            start_date_pg, 
            end_date_pg, 
            'PENDING', 
            user_id, 
            json.dumps(menu_items)
        ))
        suggestion_id = cursor.fetchone()['id']
        
        # Commit the transaction
        conn.commit()

        return jsonify({
            "message": "Menu suggestion generated successfully",
            "suggestion_id": suggestion_id,
            "start_date": start_date,
            "end_date": end_date,
            "menu_items": menu_items
        }), 200

    except Exception as e:
        # Rollback the transaction in case of error
        if conn:
            conn.rollback()
        
        logger.error(f"Error generating menu suggestion: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

            
@app.route('/get_menu_suggestions', methods=['GET'])
def get_menu_suggestions():
    """
    Retrieve menu suggestions
    """
    conn = None
    try:
        # Parse query parameters
        user_id = request.args.get('user_id')
        status = request.args.get('status', 'PENDING')

        # Establish database connection
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # Fetch menu suggestions
        query = """
            SELECT id, start_date, end_date, status, suggested_by, menu_data, created_at
            FROM se_menu_suggestions
            WHERE suggested_by = %s AND status = %s AND end_date >= CURRENT_DATE
            ORDER BY created_at DESC
        """
        
        # Execute the query
        cursor.execute(query, (user_id, status))
        suggestions = cursor.fetchall()

        # Convert suggestions to a list of dictionaries
        menu_suggestions = [{
            'id': suggestion['id'],
            'start_date': suggestion['start_date'].strftime('%d/%m/%Y'),
            'end_date': suggestion['end_date'].strftime('%d/%m/%Y'),
            'status': suggestion['status'],
            'suggested_by': suggestion['suggested_by'],
            'menu_data': json.loads(suggestion['menu_data']),
            'created_at': suggestion['created_at'].isoformat()
        } for suggestion in suggestions]

        return jsonify({
            "message": "Menu suggestions retrieved successfully",
            "suggestions": menu_suggestions
        }), 200

    except Exception as e:
        logger.error(f"Error retrieving menu suggestions: {e}")
        return jsonify({" error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Define allowed statuses
ALLOWED_STATUSES = ['ACCEPTED', 'REJECTED']

@app.route('/update_menu_suggestion_status', methods=['PATCH'])
def update_menu_suggestion_status():
    """
    Update the status of a menu suggestion
    """
    conn = None
    try:
        # Parse request data
        req_data = request.json
        suggestion_id = req_data.get('suggestion_id')
        new_status = req_data.get('status', '').upper().strip()
        user_id = req_data.get('user_id')

        # Validate input
        if not suggestion_id:
            return jsonify({"error": "Suggestion ID is required"}), 400

        # Validate status
        if new_status not in ALLOWED_STATUSES:
            return jsonify({
                "error": f"Invalid status. Allowed statuses are: {', '.join(ALLOWED_STATUSES)}"
            }), 400

        # Establish database connection
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # First, retrieve the full suggestion details
        cursor.execute("""
            SELECT * FROM se_menu_suggestions 
            WHERE id = %s
        """, (suggestion_id,))
        suggestion = cursor.fetchone()

        if not suggestion:
            return jsonify({"error": "Menu suggestion not found"}), 404

        # Ensure menu_data is a list or can be converted to a list
        try:
            # If menu_data is a string (JSON), load it
            if isinstance(suggestion['menu_data'], str):
                menu_data = json.loads(suggestion['menu_data'])
            # If it's already a list, use it directly
            elif isinstance(suggestion['menu_data'], list):
                menu_data = suggestion['menu_data']
            else:
                # If it's neither, try to convert
                menu_data = list(suggestion['menu_data'])
        except Exception as json_err:
            logger.error(f"Error parsing menu_data: {json_err}")
            return jsonify({"error": "Invalid menu data format"}), 400

        # Update menu suggestion status
        cursor.execute("""
            UPDATE se_menu_suggestions
            SET status = %s, 
                updated_by = %s, 
                updated_at = CURRENT_TIMESTAMP,
                accepted_at = CASE 
                    WHEN %s = 'ACCEPTED' THEN CURRENT_TIMESTAMP 
                    ELSE NULL 
                END
            WHERE id = %s
            RETURNING *
        """, (new_status, user_id, new_status, suggestion_id))

        updated_suggestion = cursor.fetchone()

        # If status is ACCEPTED, replace existing menu for the date range
        menu_items_to_insert = []
        if new_status == 'ACCEPTED':
            # Delete existing menu plans for the date range
            cursor.execute("""
                DELETE FROM se_menu_plan 
                WHERE date BETWEEN %s AND %s
            """, (suggestion['start_date'], suggestion['end_date']))

            # Prepare batch insert for menu plan
            for item in menu_data:
                # Find the food item ID based on the dish name
                cursor.execute("""
                    SELECT id FROM se_food_items 
                    WHERE name = %s
                """, (item['dish_name'],))
                food_item = cursor.fetchone()
                
                if food_item:
                    menu_items_to_insert.append((
                        datetime.strptime(item['date'], '%d/%m/%Y').date(),
                        item['meal_type'],
                        food_item[0],
                        item.get('planned_quantity', 0),  # Default to 0 if not specified
                        user_id
                    ))

            # Batch insert new menu items
            if menu_items_to_insert:
                cursor.executemany("""
                    INSERT INTO se_menu_plan 
                    (date, meal_type, food_item_id, planned_quantity, created_by)
                    VALUES (%s, %s, %s, %s, %s)
                """, menu_items_to_insert)

        # Commit the transaction
        conn.commit()

        return jsonify({
            "message": "Menu suggestion status updated successfully",
            "suggestion": {
                'id': updated_suggestion['id'],
                'status': updated_suggestion['status'],
                'items_replaced': len(menu_items_to_insert) if new_status == 'ACCEPTED' else 0
            }
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error updating menu suggestion status: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

            
@app.route('/delete_menu_suggestion', methods=['DELETE'])
def delete_menu_suggestion():
    """
    Delete a menu suggestion
    """
    conn = None
    try:
        # Parse query parameters
        suggestion_id = request.args.get('suggestion_id')
        user_id = request.args.get('user_id')

        # Validate input
        if not suggestion_id:
            return jsonify({"error": "Suggestion ID is required"}), 400

        # Establish database connection
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # Delete menu suggestion
        cursor.execute("""
            DELETE FROM se_menu_suggestions
            WHERE id = %s AND suggested_by = %s
            RETURNING id
        """, (suggestion_id, user_id))

        deleted_suggestion = cursor.fetchone()
        conn.commit()

        if not deleted_suggestion:
            return jsonify({"error": "Menu suggestion not found or unauthorized"}), 404

        return jsonify({
            "message": "Menu suggestion deleted successfully",
            "suggestion_id": suggestion_id
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error deleting menu suggestion: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/food_items', methods=['GET'])
def get_food_items():
    """
    Retrieve food items with optional filtering
    """
    conn = None
    try:
        # Parse query parameters
        category = request.args.get('category')
        meal_type = request.args.get('meal_type')

        # Establish database connection
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # Build dynamic query
        query = """
            SELECT id, name, category, description
            FROM se_food_items
            WHERE 1=1
        """
        params = []

        if category:
            query += " AND category = %s"
            params.append(category)

        if meal_type:
            query += " AND id IN (SELECT DISTINCT food_item_id FROM se_consumption_records WHERE meal_type = %s)"
            params.append(meal_type)

        cursor.execute(query, params)
        food_items = cursor.fetchall()

        # Convert to list of dictionaries
        items_list = [{
            'id': item['id'],
            'name': item['name'],
            'category': item['category'],
            'description': item['description']
        } for item in food_items]

        return jsonify({
            "message": "Food items retrieved successfully",
            "food_items": items_list
        }), 200

    except Exception as e:
        logger.error(f"Error retrieving food items: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Main Application Runner
if __name__ == '__main__':
    # Run the Flask app
    app.run(
        host=os.getenv('APP_HOST', '0.0.0.0'), 
        port=int(os.getenv('APP_PORT', 5000)), 
        debug=True
    )