from datetime import datetime
from typing import List

import asyncio
import httpx

from utils.helpers import BusStop, RouteSchedule, StopSchedule, Timing

ARRIVAL_API_URL = "https://arrivelah2.busrouter.sg"


async def fetch_arrival_timing(
        bus_num: str, stops_info: List, stop_seq: str) -> List[str]:
    """
    Fetch arrival timings for given bus number for all stops until stop_seq.

    Args:
        bus_num: The bus number.
        stops_info: List of dictionaries with stops info of the bus route.
        stop_seq: The stop sequence number of the target bus stop.

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
        tasks.append(update_bus_stop_timing(new_stop, bus_num))
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
        return None, None

    for bus_stop, timings in zip(reversed(all_stops), reversed(all_timings)):
        stop_schedule = StopSchedule(bus_stop, timings)
        route_schedule.add_stop_schedule(stop_schedule)

    # Forecast timing based on time difference between buses
    route_schedule.forecast_new_timings()

    date = datetime.now()
    res = route_schedule.get_all_timings(date)

    return res, date.strftime('%H:%M:%S')


async def update_bus_stop_timing(
        bus_stop: BusStop, bus_num: str) -> List[Timing]:
    """
    Fetch arrival timings for given bus stop and update with timing object.

    Args:
        bus_stop: The bus stop object for which to fetch arrival timings.
        bus_num: The bus number.

    Returns:
        List[Timing]: A list of Timing objects for the given stop and bus num.
    """
    url = f'{ARRIVAL_API_URL}/?id={bus_stop.id}'
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
                     if service["no"] == bus_num),
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
