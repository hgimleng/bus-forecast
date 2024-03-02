import csv
import io
import os
from typing import Dict

from dotenv import load_dotenv
import psycopg2
import requests

load_dotenv()

host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")
api_key = os.getenv("LTA_API_KEY")
URL_ROUTES = "http://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$skip="
URL_STOPS = "http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip="
URL_SERVICES = "http://datamall2.mytransport.sg/ltaodataservice/BusServices?$skip="


def update_bus_routes():
    """
    Fetch bus routes from the LTA API and update to database.
    """
    # Fetch bus routes and bus stops data from LTA Datamall
    headers = {"AccountKey": api_key}
    bus_stops = {
        stop["BusStopCode"]: [
            get_bus_stop_description(stop["BusStopCode"], stop["Description"]),
            stop["Latitude"], stop["Longitude"], stop["RoadName"]
        ]
        for stop in fetch_all_records(URL_STOPS, headers)
    }
    bus_services = {
        (record["ServiceNo"], record["Direction"]): [
            record["Category"], record["OriginCode"],
            record["DestinationCode"], record["LoopDesc"],
        ]
        for record in fetch_all_records(URL_SERVICES, headers)
    }
    bus_routes = [
        (record["ServiceNo"], record["Direction"],
        record["StopSequence"], record["BusStopCode"], record["Distance"])
        for record in fetch_all_records(URL_ROUTES, headers)
    ]
    buses_to_show_destination = get_buses_to_show_destination(bus_routes)

    bus_data = []
    for record, next_record in zip(bus_routes, bus_routes[1:]+[bus_routes[0]]):
        # Skip records with same bus number, direction and bus stop twice in a row
        if (record[0], record[1], record[3]) == (next_record[0], next_record[1], next_record[3]):
            print(f"Skipping duplicate record: {record}")
            continue
        show_destination = (record[0], record[3]) in buses_to_show_destination
        bus_data.append((
            record[0], record[1], record[2], record[3],
            *bus_stops[record[3]], record[4],
            *bus_services[(record[0], record[1])],
            "", "", show_destination))

    # Connect to mysql to update database
    connection = psycopg2.connect(host=host,
                                  user=user,
                                  password=password,
                                  database=database)

    try:
        with connection.cursor() as cursor:
            # Create a new last_updated_table if not exists and insert new last updated time
            cursor.execute("CREATE TABLE IF NOT EXISTS last_updated_table (id SERIAL PRIMARY KEY, last_updated TIMESTAMP);")
            cursor.execute("INSERT INTO last_updated_table (last_updated) VALUES (NOW());")

            cursor.execute("DROP TABLE routes_table;")
            # Create new table if required
            create_table_query = """
            CREATE TABLE IF NOT EXISTS routes_table (
                bus_num VARCHAR(100),
                direction INTEGER,
                stop_seq INTEGER,
                stop_code VARCHAR(100) NOT NULL,
                stop_name VARCHAR(100) NOT NULL,
                latitude FLOAT NOT NULL,
                longitude FLOAT NOT NULL,
                road_name VARCHAR(100) NOT NULL,
                distance FLOAT NOT NULL,
                category VARCHAR(100) NOT NULL,
                origin_code VARCHAR(100) NOT NULL,
                destination_code VARCHAR(100) NOT NULL,
                loop_desc VARCHAR(100),
                first_visit_desc VARCHAR(100),
                second_visit_desc VARCHAR(100),
                show_destination BOOLEAN,
                PRIMARY KEY (bus_num, direction, stop_seq)
            );
            """
            cursor.execute(create_table_query)

            # Empty data in table
            cursor.execute("TRUNCATE TABLE routes_table;")

            # Create a temporary file with the data in CSV format
            csv_file = io.StringIO()
            csv_writer = csv.writer(csv_file)
            csv_writer.writerows(bus_data)
            csv_file.seek(0)

            # Use COPY command to load data from the file to the database
            copy_command = (
                "COPY routes_table "
                "(bus_num, direction, stop_seq, "
                "stop_code, stop_name, latitude, longitude, road_name, "
                "distance, category, origin_code, destination_code, loop_desc, "
                "first_visit_desc, second_visit_desc, show_destination)"
                "FROM STDIN WITH CSV"
            )
            cursor.copy_expert(copy_command, csv_file)

            # Commit the changes
            connection.commit()

            # Write files to csv locally
            with open("bus_stops.csv", "w", newline='') as f:
                csv_writer = csv.writer(f)
                for stop_code, values in bus_stops.items():
                        row = [stop_code] + values
                        csv_writer.writerow(row)
            with open("bus_services.csv", "w") as f:
                csv_writer = csv.writer(f)
                csv_writer.writerows(bus_services.items())
            with open("bus_routes.csv", "w") as f:
                csv_writer = csv.writer(f)
                csv_writer.writerows(bus_routes)
            with open("bus_data.csv", "w") as f:
                csv_writer = csv.writer(f)
                csv_writer.writerows(bus_data)

            print("Update successful")
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
                print(f"Fetched {len(records)} records from {url}")
                return records
            else:
                records.extend(new_records)
                skip += len(new_records)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return records

def get_bus_stop_description(bus_stop_code: str, description: str):
    """
    Function to extend certain bus stop descriptions
    """
    map = {
        "46101": " (To JB)",
        "46211": " (To JB)",
        "46219": " (To SG)",
        "46109": " (To SG)",
        "64541": " (Bus Stop)",
        "95131": " (To Airline Rd)",
        "95139": " (To Nicoll Dr)"
    }
    return description + map.get(bus_stop_code, "")


def get_buses_to_show_destination(bus_routes):
    """
    Function to get buses that show destination
    """
    buses_to_show_destination = []
    bus_routes_dict = {}
    for record in bus_routes:
        bus_num, direction, stop_seq, stop_code, distance = record
        if bus_num not in bus_routes_dict:
            bus_routes_dict[bus_num] = {}
        if direction not in bus_routes_dict[bus_num]:
            bus_routes_dict[bus_num][direction] = []
        bus_routes_dict[bus_num][direction].append(stop_code)
    # Remove last stop from each route
    for bus_num, directions in bus_routes_dict.items():
        for direction, stops in directions.items():
            bus_routes_dict[bus_num][direction] = stops[:-1]
        if len(directions) == 2:
            # Get stop codes that appear in both directions
            common_stops = set(bus_routes_dict[bus_num][1]) & set(bus_routes_dict[bus_num][2])
            buses_to_show_destination.extend([(bus_num, stop) for stop in common_stops])
    return buses_to_show_destination

if __name__ == '__main__':
    update_bus_routes()
