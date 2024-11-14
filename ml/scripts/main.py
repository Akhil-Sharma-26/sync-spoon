import pandas as pd
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from combining_codes import comb

AGGREGATED_FILE_PATH = 'ml/data/aggregated_data.csv'
HOLIDAY_FILE_PATH= 'ml/data/original_holidays.csv'

app = Flask(__name__)
@app.route('/run-comb', methods=['POST'])

def run_comb():
    # Get the JSON data from the request
    data = request.get_json()

    # Extract the parameters from the request
    role = data.get('role')
    subopt = data.get('subopt')
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    # Validate input
    if not all([role, subopt, start_date, end_date]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        # Call the comb function
        comb(AGGREGATED_FILE_PATH, HOLIDAY_FILE_PATH, start_date, end_date, role, subopt)
        return jsonify({"message": "Report generated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)
    
