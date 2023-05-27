from datetime import datetime, timedelta
from typing import List
import os

import asyncio
from dotenv import load_dotenv
import httpx

from utils.helpers import BusStop, RouteSchedule, StopSchedule, Timing

# load env variables
load_dotenv()
timezone_offset = int(os.getenv("TIMEZONE_OFFSET"))
arrival_api_url = os.getenv("ARRIVAL_API_URL")


async def fetch_arrival_timing(
        bus_num: str, stops_info: List,
        stop_seq: str, dest_code: str) -> List[str]:
    """
    Fetch arrival timings for given bus number for all stops until stop_seq.

    Args:
        bus_num: The bus number.
        stops_info: List of dictionaries with stops info of the bus route.
        stop_seq: The stop sequence number of the target bus stop.
        dest_code: The destination code of the bus route.

    Returns:
        List[str]: A list of arrival timings for bus number at target stop.
        datetime: The datetime when data was fetched.
    """
    # Initialise variables
    cur_stop = None
    tasks = []
    route_schedule = RouteSchedule()
    all_stops = []

    # Create BusStop objects and fetch bus arrival timings
    for stop in stops_info:
        new_stop = BusStop(stop["id"],
                           stop["name"],
                           stop["stopSequence"],
                           stop["distance"])
        tasks.append(update_bus_stop_timing(new_stop, bus_num, dest_code))
        all_stops.append(new_stop)

        new_stop.set_prev_stop(cur_stop)
        if cur_stop:
            cur_stop.set_next_stop(new_stop)
        cur_stop = new_stop
        if str(cur_stop.stop_seq) == stop_seq:
            break

    # Run tasks concurrently
    all_timings = await asyncio.gather(*tasks)

    # Check if all of the timings are empty
    if all(not timings for timings in all_timings):
        return None, None, None

    for bus_stop, timings in zip(reversed(all_stops), reversed(all_timings)):
        stop_schedule = StopSchedule(bus_stop, timings)
        route_schedule.add_stop_schedule(stop_schedule)

    # Forecast timing based on time difference between buses
    route_schedule.forecast_new_timings()

    date = datetime.now() + timedelta(hours=timezone_offset)
    res = route_schedule.get_all_timings(date)
    bus_diff = route_schedule.bus_diff

    return date.strftime('%H:%M:%S'), res, bus_diff


async def update_bus_stop_timing(
        bus_stop: BusStop, bus_num: str, dest_code: str) -> List[Timing]:
    """
    Fetch arrival timings for given bus stop and update with timing object.

    Args:
        bus_stop: The bus stop object for which to fetch arrival timings.
        bus_num: The bus number.
        dest_code: The destination code of the bus route.

    Returns:
        List[Timing]: A list of Timing objects for the given stop and bus num.
    """
    url = f'{arrival_api_url}{bus_stop.id}'
    timings = []

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)

            # Parse response data and create Timing objects
            if response.status_code == 200:
                data = response.json()
                service = next(
                    (service
                     for service in data["services"]
                     if (service["no"].upper() == bus_num and
                         service["next"]["destination_code"] == dest_code)),
                    None,
                )

                if service:
                    timings = [
                        Timing(service[key]["duration_ms"]/1000,
                               i+1,
                               type=service[key]["type"],
                               origin=service[key]["origin_code"],
                               load=service[key]["load"],
                               lng=service[key]["lng"],
                               lat=service[key]["lat"])
                        for i, key in enumerate(["next", "next2", "next3"])
                        if service.get(key) is not None
                    ]
    except httpx.RequestError as e:
        print(f"Error fetching data from external API: {e}")

    return timings
