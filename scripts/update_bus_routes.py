import os
from typing import Dict

from dotenv import load_dotenv
import pymysql
import requests

load_dotenv()

host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")
api_key = os.getenv("LTA_API_KEY")
URL_ROUTES = "http://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$skip="
URL_STOPS = "http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip="


def update_bus_routes():
    """
    Fetch bus routes from the LTA API and update to database.
    """
    # Fetch bus routes and bus stops data from LTA Datamall
    headers = {"AccountKey": api_key}
    bus_stops = {
        stop["BusStopCode"]: stop["Description"]
        for stop in fetch_all_records(URL_STOPS, headers)
    }
    bus_routes = [
        (record["ServiceNo"], record["Direction"],
         record["StopSequence"], record["BusStopCode"],
         bus_stops[record["BusStopCode"]], record["Distance"])
        for record in fetch_all_records(URL_ROUTES, headers)
    ]

    # print(len(bus_routes))
    # print((bus_stops))

    # Connect to mysql to update database
    connection = pymysql.connect(host=host,
                                 user=user,
                                 password=password,
                                 database=database)

    try:
        with connection.cursor() as cursor:
            # Create new table if required
            create_table_query = """
            CREATE TABLE IF NOT EXISTS routes_table (
                bus_num VARCHAR(100),
                direction INTEGER,
                stop_seq INTEGER,
                stop_code VARCHAR(100) NOT NULL,
                stop_name VARCHAR(100) NOT NULL,
                distance FLOAT NOT NULL,
                PRIMARY KEY (bus_num, direction, stop_seq)
            );
            """
            cursor.execute(create_table_query)

            # Empty data in table
            cursor.execute("TRUNCATE TABLE routes_table;")

            # Insert data into the table
            insert_data_query = """
            INSERT INTO routes_table (bus_num, direction, stop_seq, stop_code, stop_name, distance) VALUES (%s, %s, %s, %s, %s, %s);
            """

            cursor.executemany(insert_data_query, bus_routes)

            # Commit the changes
            connection.commit()

    finally:
        # Close the connection
        connection.close()


def fetch_all_records(url: str, headers: Dict[str, str]):
    """
    Fetch all records from given LTA api endpoint and return concatenated data.
    """
    records = []
    skip = 0
    while True:
        try:
            response = requests.get(url+str(skip), headers=headers)
            new_records = response.json().get("value")
            if len(new_records) == 0:
                return records
            else:
                records.extend(new_records)
                skip += len(new_records)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return records


if __name__ == '__main__':
    update_bus_routes()
