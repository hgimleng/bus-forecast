from datetime import datetime
from typing import List

import asyncio
import httpx

from utils.helpers import Bus, BusStop, Timing

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
    Bus.reset_id_counter()
    cur_stop = None
    tasks = []
    buses = []

    # Create BusStop objects and fetch bus arrival timings
    for stop in stops_info:
        new_stop = BusStop(stop["id"], stop["name"], stop["stopSequence"])
        tasks.append(update_bus_stop_timing(new_stop, bus_num))

        new_stop.set_prev_stop(cur_stop)
        if cur_stop:
            cur_stop.set_next_stop(new_stop)
        cur_stop = new_stop
        if str(cur_stop.stop_seq) == stop_seq:
            break
    selected_stop = cur_stop

    # Run tasks concurrently
    await asyncio.gather(*tasks)

    # Set timings for target stop to be the first few buses
    for timing in cur_stop.timings:
        bus = Bus()
        timing.set_bus(bus)
        buses.append(bus)

    # Iterate through stops backwards to assign bus to timings
    while cur_stop.prev_stop:
        next_stop = cur_stop
        cur_stop = cur_stop.prev_stop

        if len(next_stop.timings) < 3:
            # All timings for cur_stop are for different buses from next_stop
            for timing in cur_stop.timings:
                if not timing.bus:
                    timing.set_bus(Bus())
                    buses.append(timing.bus)
        else:
            # Some timings for cur_stop may be for same bus as next_stop
            next_stop_timings = next_stop.timings[:]
            for cur_stop_timing in cur_stop.timings:
                # Find the earliest timing at next_stop that matches
                for next_stop_timing in next_stop_timings:
                    next_stop_timings.remove(next_stop_timing)
                    if (cur_stop_timing.has_matching_bus(next_stop_timing)):
                        cur_stop_timing.set_bus(next_stop_timing.bus)
                        break
                # If there are no more timings at next stop to allocate,
                # timing for cur_stop will be treated as new bus
                if len(next_stop_timings) == 0 and cur_stop_timing.bus is None:
                    cur_stop_timing.set_bus(Bus())
                    buses.append(cur_stop_timing.bus)

    # Forecast timing based on time difference between buses
    last_timing = selected_stop.timings[-1]
    last_duration = last_timing.duration
    while not last_timing.bus.is_last_bus():
        next_bus = buses[last_timing.bus.id + 1]
        bus_duration_diff = next_bus.get_bus_diff(last_timing.bus)
        if bus_duration_diff is None:
            break
        last_duration = last_duration + bus_duration_diff
        forecast_timing = Timing(
            selected_stop,
            last_duration,
            len(selected_stop.timings) + 1,
            False
        )
        forecast_timing.set_bus(next_bus)
        last_timing = selected_stop.timings[-1]

    date = datetime.now()
    res = []
    for timing in selected_stop.timings:
        res.append({
            "bus": timing.bus.id + 1,
            "time": timing.get_arrival_time(date),
            "currentLoc": "Unknown",
            "isOriginal": timing.from_api,
            })

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
                    (service for service in data["services"] if service["no"] == bus_num),
                    None,
                )

                if service:
                    timings = [
                        Timing(bus_stop, service[key]["duration_ms"]/1000, i+1)
                        for i, key in enumerate(["next", "next2", "next3"])
                        if service.get(key) is not None
                    ]
    except httpx.RequestError as e:
        print(f"Error fetching data from external API: {e}")

    return timings
