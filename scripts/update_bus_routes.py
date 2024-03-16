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

# Services/directions that are not in operation
DEFUNCT_SERVICES = [("359", 2), ("382", 1), ("382", 2), ("812T", 1)]

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
        if (record["ServiceNo"], record["Direction"]) not in DEFUNCT_SERVICES
    ]
    # Remove stops that appear twice in a row
    for i in range(len(bus_routes)-1, 0, -1):
        # If service number, direction, and stop code is same for consecutive stops, remove the second stop
        route_info1 = bus_routes[i]
        route_info2 = bus_routes[i-1]
        if route_info1[0] == route_info2[0] and route_info1[1] == route_info2[1] and route_info1[3] == route_info2[3]:
            print(f"Removing duplicate stop {route_info1[3]} from bus {route_info1[0]} direction {route_info1[1]}")
            bus_routes.pop(i)
    buses_to_show_destination, multi_visit_stops = get_buses_visit_info(bus_routes)

    bus_data = []
    for record in bus_routes:
        show_destination = (record[0], record[3]) in buses_to_show_destination
        first_visit_desc, second_visit_desc = get_visit_descriptions(record, multi_visit_stops)
        bus_data.append((
            record[0], record[1], record[2], record[3],
            *bus_stops[record[3]], record[4],
            *bus_services[(record[0], record[1])],
            first_visit_desc, second_visit_desc, show_destination))

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
    finally:
        # Close the connection
        connection.close()
    print("Update completed")


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


def get_visit_descriptions(record, multi_visit_stops):
    """
    Function to get first and second visit descriptions
    """
    map = {
        ("11", 1, "80199"): ("Tanjong Rhu", "Lor 1 Geylang"),
        ("11", 1, "80191"): ("Tanjong Rhu", "Lor 1 Geylang"),
        ("121", 1, "03218"): ("", "No Boarding"),
        ("123M", 1, "14389"): ("Tiong Bahru", "Harbourfront"),
        ("123M", 1, "14381"): ("Tiong Bahru", "Harbourfront"),
        ("125", 1, "52109"): ("St. Michael's Ter", "Aljunied"),
        ("125", 1, "52129"): ("St. Michael's Ter", "Aljunied"),
        ("177", 1, "43719"): ("Bukit Panjang", "Bukit Batok"),
        ("182", 1, "25269"): ("Tuas South", "Joo Koon"),
        ("265", 1, "54009"): ("Ang Mo Kio Ave 10", "Ang Mo Kio Ave 9"),
        ("291", 1, "75009"): ("West", "East"),
        ("293", 1, "75009"): ("West", "East"),
        ("315", 1, "66271"): ("Serangoon North", "Serangoon Int"),
        ("317", 1, "66271"): ("Berwick Dr", "Serangoon Int"),
        ("35", 1, "96219"): ("Alps Ave", "Bedok"),
        ("358", 1, "77009"): ("West", "East"),
        ("359", 1, "77009"): ("West", "East"),
        ("60", 1, "84511"): ("Bedok", "Eunos"),
        ("60", 1, "84501"): ("Bedok", "Eunos"),
        ("73", 1, "66271"): ("Toa Payoh", "Ang Mo Kio"),
        ("883", 1, "58621"): ("Canberra", "Sembawang"),
        ("883M", 1, "58621"): ("Canberra", "Sembawang"),
        ("98", 1, "21069"): ("Jurong Island Checkpoint", "Jurong East"),
        ("98", 1, "21079"): ("Jurong Island Checkpoint", "Jurong East"),
        ("98", 1, "21109"): ("Jurong Island Checkpoint", "Jurong East"),
        ("98", 1, "21089"): ("Jurong Island Checkpoint", "Jurong East")
    }

    if (record[0], record[1]) in multi_visit_stops and record[3] in multi_visit_stops[(record[0], record[1])]:
        description = map.get((record[0], record[1], record[3]), ("Visit 1", "Visit 2"))
        if description[0] == "Visit 1":
            print(f"Visit description not found for bus {record[0]} direction {record[1]} stop {record[3]}")
        return description
    else:
        return ("", "")


def get_buses_visit_info(bus_routes):
    """
    Function to get buses that show destination and visit info
    """
    buses_to_show_destination = []
    multi_visit_stops = {}
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
            stops = stops[:-1]
            bus_routes_dict[bus_num][direction] = stops
            # Get stops that appear more than once
            duplicate_stops = [stop for stop in stops if stops.count(stop) > 1]
            if duplicate_stops:
                multi_visit_stops[(bus_num, direction)] = duplicate_stops
        if len(directions) == 2:
            # Get stop codes that appear in both directions
            common_stops = set(bus_routes_dict[bus_num][1]) & set(bus_routes_dict[bus_num][2])
            buses_to_show_destination.extend([(bus_num, stop) for stop in common_stops])
    return (buses_to_show_destination, multi_visit_stops)

if __name__ == '__main__':
    update_bus_routes()
