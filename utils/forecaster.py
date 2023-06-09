from datetime import datetime, timedelta
from dateutil import tz, parser
from typing import List
import os

import asyncio
from dotenv import load_dotenv
import httpx

from utils.helpers import BusStop, RouteSchedule, Timing

# load env variables
load_dotenv()
timezone_offset = int(os.getenv("TIMEZONE_OFFSET"))
arrival_api_url = os.getenv("ARRIVAL_API_URL")


async def fetch_arrival_timing(
        bus_num: str, stops_info: List,
        stop_seq: str, dest_codes: tuple):
    """
    Fetch arrival timings for given bus number for all stops until stop_seq.

    Args:
        bus_num: The bus number.
        stops_info: List of dictionaries with stops info of the bus route.
        stop_seq: The stop sequence number of the target bus stop.
        dest_codes: The possible destination code of the bus route.

    Returns:
        datetime: The datetime when data was fetched.
        List[str]: A list of arrival timings for bus number at target stop.
        bus_diff: The time difference between buses.
        status: The status code of the request.
    """
    # Initialise variables
    cur_stop = None
    tasks = []
    all_stops = []
    date = datetime.now() + timedelta(hours=timezone_offset)

    # Create BusStop objects and fetch bus arrival timings
    added_stops = []
    for stop in stops_info:
        added_stops.append(stop["id"])
        visit_num = added_stops.count(stop["id"])
        new_stop = BusStop(stop["id"],
                           stop["name"],
                           stop["stopSequence"],
                           stop["distance"],
                           visit_num)
        tasks.append(update_bus_stop_timing(
            new_stop, bus_num, dest_codes, date))
        all_stops.append(new_stop)

        new_stop.set_prev_stop(cur_stop)
        if cur_stop:
            cur_stop.set_next_stop(new_stop)
        cur_stop = new_stop
        if str(cur_stop.stop_seq) == stop_seq:
            break

    # Run tasks concurrently
    all_timings = await asyncio.gather(*tasks)

    # Check if any of the timings is None
    if any(timings is None for timings in all_timings):
        return None, None, None, 501

    # Check if all of the timings are empty
    if all(not timings for timings in all_timings):
        return None, None, None, 200

    route_schedule = RouteSchedule(all_stops, bus_num)
    # Keep track of visit count for routes with multiple visits
    visit_count = {stop.id: 0 for stop in all_stops}
    for stop in all_stops:
        visit_count[stop.id] += 1
    for bus_stop, timings in zip(reversed(all_stops), reversed(all_timings)):
        timings = [timing for timing in timings
                   if timing.visit_num == visit_count[bus_stop.id]]
        route_schedule.add_timings(timings, bus_stop)
        visit_count[bus_stop.id] -= 1

    # Sort schedules by arrival time of common stops
    route_schedule.sort_schedules()

    # Forecast timing based on time difference between buses
    route_schedule.forecast_new_timings()

    res = route_schedule.get_all_timings(date)
    bus_diff = route_schedule.get_all_bus_diff()

    return date.strftime('%H:%M:%S'), res, bus_diff, 200


async def update_bus_stop_timing(
        bus_stop: BusStop, bus_num: str, dest_codes, date) -> List[Timing]:
    """
    Fetch arrival timings for given bus stop and update with timing object.

    Args:
        bus_stop: The bus stop object for which to fetch arrival timings.
        bus_num: The bus number.
        dest_codes: The possible destination codes of the bus route.
        date: The datetime when data was fetched.

    Returns:
        List[Timing]: A list of Timing objects for the given stop and bus num.
    """
    url = f'{arrival_api_url}{bus_stop.id}'
    timings = []

    # Helper function to get duration in seconds
    def get_duration(date, time_str):
        str_time = parser.parse(time_str[:19])
        str_time = str_time.astimezone(tz.tzlocal()).replace(tzinfo=None)
        diff = str_time - date
        return diff.total_seconds()

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
                         service["next"]["destination_code"] in dest_codes)),
                    None,
                )

                if service:
                    timings = [
                        Timing(get_duration(date, service[key]["time"]),
                               i+1,
                               type=service[key]["type"],
                               origin=service[key]["origin_code"],
                               load=service[key]["load"],
                               lng=service[key]["lng"],
                               lat=service[key]["lat"],
                               visit_num=service[key]["visit_number"])
                        for i, key in enumerate(["next", "next2", "next3"])
                        if service.get(key) is not None
                    ]
    except httpx.RequestError as e:
        print(f"Error fetching data from external API: {e}")
        return None

    return timings
