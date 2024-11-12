from combining_codes import comb
def main():
    role=int(input('Enter 1 for Admin, 2 for Mess Staff, 3 for Student: '))

    aggregated_file_path = 'ml/data/aug2023_24_meals.csv'
    holiday_file_path= 'ml/data/holidays2023_24.csv'

    comb(aggregated_file_path,holiday_file_path,role)

if __name__ == "__main__":
    main()
