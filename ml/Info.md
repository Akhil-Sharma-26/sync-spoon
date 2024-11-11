##Current capabilities of model-

Incorporated creation of reports(to be used by dashboard) and dynamic suggestion of menu items with appropriate quantities for a given date range in DD/MM/YYYY format (currently accepted by user from main.py).

##ml folder structure-

'data' folder- the only files(sample uploaded already) that need to be uploaded by user: an aggregated csv file that contains data of each date and a holiday csv file that stores the ranges, names of holidays.

'scripts' folder- contains all python scripts:

generate_aggregated_reports.py ,
generate_expanded_reports.py,
menu_suggest.py
main.py
'reports' folder- the weekly, monthly reports are created and placed by code here.

'predictions' folder-the menu suggestions created by code for a given date range is saved as a csv file here.
