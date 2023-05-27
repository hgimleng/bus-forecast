import argparse
import json
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
import httpx
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from models.routes_table import RoutesTable

host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")

# Create the database URI
database_uri = f"postgresql+psycopg2://{user}:{password}@{host}/{database}"

# Create the SQLAlchemy engine and session
engine = create_engine(database_uri)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

# Parse bus number from command line
parser = argparse.ArgumentParser()
parser.add_argument("bus_num", type=str)

args = parser.parse_args()

bus_num = args.bus_num

# Query database for bus stop information
records = session.query(RoutesTable).filter(
    func.upper(RoutesTable.bus_num) == bus_num).all()
records = [record.to_dict() for record in records]
session.close()


async def fetch_data_from_api(stop_code):
    url = f'https://arrivelah2.busrouter.sg/?id={stop_code}'
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            return {}

async def fetch_all_data(records):
    tasks = []
    for record in records:
        stop_code = record["stop_code"]
        tasks.append(fetch_data_from_api(stop_code))

    return await asyncio.gather(*tasks)

new_data = {}
all_timings = asyncio.run(fetch_all_data(records))

for record, timings in zip(records, all_timings):
    stop_code = record["stop_code"]
    stop_name = record["stop_name"]
    new_data[stop_code] = {**timings, "stop_name": stop_name}

with open('test_arrivals.json', 'w') as f:
    json.dump(new_data, f, indent=2)
