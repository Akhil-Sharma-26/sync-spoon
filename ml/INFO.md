##Features implemented-

Incorporated creation of reports(to be used by dashboard) and dynamic suggestion of menu items with appropriate quantities for a given date range in DD/MM/YYYY format (currently accepted by user from main.py). User can also view existing menus and get brief consumption reports for a time period in pdf format.


##'ml' folder structure-


'data' folder- the only files(sample uploaded already) that need to be uploaded by user: an aggregated csv file that contains data of each date and a holiday csv file that stores the ranges, names of holidays.


'scripts' folder- contains all python scripts:

generate_admin_report.py - generate pdf consumption reports for a time period(weekly/monthly)
generate_aggregated_reports.py - divide aggregated original data into weekly and monthly data csv files
generate_expanded_reports.py - divide weekly,monthly data into most consumed and least consumed csv files to make it easier for code to analyze
menu_suggest.py - suggest menu items and dishes for specified time period(holiday adjusting included)
combining_codes.py - combining functionality of above python files to provide role-centric features
main.py - main function for calling


'admin_reports' folder- stores the requested time period's reports created by code (pdf form).


'csv_reports' folder- the weekly, monthly reports created by code after analyzing original data.


'predictions' folder-the menu suggestions created by code for a given date range is saved as a csv file here.


##Requirements-

Install required modules using: 

pip install -r requirements.txt