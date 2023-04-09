import asyncio
import httpx
from typing import List

from flask import Flask, jsonify
from flask_cors import CORS
from utils.helpers import Bus, BusStop, Timing

# configuration
DEBUG = True

# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})

# Sample data to return for the API endpoint.
sample_data = {
    '920': {
        'directions': {'1': "To Bt Panjang Int"},
        'stops': {
            '1': [{"id": 44631, "stopSequence": 2, "name": "Opp Bt Panjang Plaza"}, {"id": 44641, "stopSequence": 3, "name": "Blk 602"}, {"id": 44791, "stopSequence": 4, "name": "West View Pr Sch"}, {"id": 44801, "stopSequence": 5, "name": "Opp Blk 628"}, {"id": 44861, "stopSequence": 6, "name": "BLK 636A"}, {"id": 44951, "stopSequence": 7, "name": "Blk 638A"}, {"id": 44931, "stopSequence": 8, "name": "Blk 643 CP"}, {"id": 44721, "stopSequence": 9, "name": "Opp Jelapang Stn"}, {"id": 44661, "stopSequence": 10, "name": "Blk 532"}, {"id": 44671, "stopSequence": 11, "name": "Bet Blks 502/503"}, {"id": 44601, "stopSequence": 12, "name": "Blk 413"}, {"id": 44349, "stopSequence": 13, "name": "Bet Blks 443A/443B"}, {"id": 44339, "stopSequence": 14, "name": "Blk 442D"}, {"id": 44329, "stopSequence": 15, "name": "Bangkit Stn"}, {"id": 44301, "stopSequence": 16, "name": "Opp Blk 271"}, {"id": 44311, "stopSequence": 17, "name": "Opp Blk 253"}, {"id": 44321, "stopSequence": 18, "name": "Opp Bangkit Stn"}, {"id": 44331, "stopSequence": 19, "name": "Blk 239"}, {"id": 44341, "stopSequence": 20, "name": "Blk 401A CP"}, {"id": 44609, "stopSequence": 21, "name": "Blk 408"}, {"id": 44679, "stopSequence": 22, "name": "Opp Blk 502"}, {"id": 44669, "stopSequence": 23, "name": "Opp Blk 532"}, {"id": 44829, "stopSequence": 24, "name": "Opp Blk 650"}, {"id": 44959, "stopSequence": 25, "name": "Blk 643A"}, {"id": 44819, "stopSequence": 26, "name": "Opp West Spring Sec Sch"}, {"id": 44869, "stopSequence": 27, "name": "Bef Blk 629A Cp"}, {"id": 44809, "stopSequence": 28, "name": "Blk 628"}, {"id": 44799, "stopSequence": 29, "name": "Blk 610"}, {"id": 44649, "stopSequence": 30, "name": "Blk 541A CP"}, {"id": 44639, "stopSequence": 31, "name": "Bt Panjang Plaza"}]
        },
    },
}

@app.route('/api/bus/<string:bus_number>')
def get_bus_info(bus_number):
    bus_info = sample_data.get(bus_number)
    if bus_info:
        return jsonify(bus_info)
    else:
        return jsonify({'error': 'Bus number not found'}), 404

@app.route('/api/bus/<busNumber>/direction/<direction>/stop/<stopId>', methods=['GET'])
def get_bus_arrival_timing(busNumber, direction, stopId):
    # Fetch arrival timings based on the provided parameters
    arrival_timing = asyncio.run(fetch_arrival_timing(busNumber, direction, stopId))

    if arrival_timing is not None:
        return jsonify(arrival_timing)
    else:
        return jsonify({'error': 'Bus arrival timing not found'}), 404

async def fetch_arrival_timing(busNumber: str, direction: str, stopId: str) -> List[str]:
    # Fetch arrivals for all stops
    bus_info = sample_data.get(busNumber)['stops'][direction]
    cur_stop = None
    tasks = []
    buses = []

    for stop in bus_info:
        new_stop = BusStop(stop["id"], stop["name"], stop["stopSequence"])

        # Fetch bus arrival timings from external source
        tasks.append(update_bus_stop_timing(new_stop, busNumber))

        new_stop.set_prev_stop(cur_stop)
        if cur_stop:
            cur_stop.set_next_stop(new_stop)
        cur_stop = new_stop
        if str(cur_stop.id) == stopId:
            break
    selected_stop = cur_stop

    # Run tasks concurrently
    await asyncio.gather(*tasks)

    # Set timings for selected stop as earliest buses
    for timing in cur_stop.timings:
        bus = Bus()
        timing.set_bus(bus)
        buses.append(bus)
    
    # Iterate through stops backwards to assign bus to timings
    while cur_stop.prev_stop:
        next_stop = cur_stop
        cur_stop = cur_stop.prev_stop

        num_timings = len(cur_stop.timings)
        if len(next_stop.timings) == 3:
            # All timings for cur_stop have same buses as timings for next_stop
            if num_timings == 3 and all(x.has_same_bus(y) for x, y in zip(cur_stop.timings, next_stop.timings)):
                cur_stop.timings[0].set_bus(next_stop.timings[0].bus)
                cur_stop.timings[1].set_bus(next_stop.timings[1].bus)
                cur_stop.timings[2].set_bus(next_stop.timings[2].bus)
            elif num_timings >= 2 and cur_stop.timings[0].has_same_bus(next_stop.timings[1]) and cur_stop.timings[1].has_same_bus(next_stop.timings[2]):
                # First 2 buses of cur_stop are the same as 2nd and 3rd bus of next_stop
                cur_stop.timings[0].set_bus(next_stop.timings[1].bus)
                cur_stop.timings[1].set_bus(next_stop.timings[2].bus)
            elif num_timings >= 1 and cur_stop.timings[0].has_same_bus(next_stop.timings[2]):
                # First bus of cur_stop is the same as 3rd bus of next_stop
                cur_stop.timings[0].set_bus(next_stop.timings[2].bus)
        elif len(next_stop.timings) == 2:
            if num_timings >= 2 and cur_stop.timings[0].has_same_bus(next_stop.timings[0]) and cur_stop.timings[1].has_same_bus(next_stop.timings[1]):
                cur_stop.timings[0].set_bus(next_stop.timings[0].bus)
                cur_stop.timings[1].set_bus(next_stop.timings[1].bus)
            elif num_timings >= 1 and cur_stop.timings[0].has_same_bus(next_stop.timings[1]):
                cur_stop.timings[0].set_bus(next_stop.timings[1].bus)
        elif len(next_stop.timings) == 1:
            if num_timings >= 1 and cur_stop.timings[0].has_same_bus(next_stop.timings[0]):
                cur_stop.timings[0].set_bus(next_stop.timings[0].bus)
        # Set the remaining timings to be new buses
        for timing in cur_stop.timings:
            if not timing.bus:
                bus = Bus()
                timing.set_bus(bus)
                buses.append(bus)

    cur_stop = selected_stop
    res = []
    for bus1, bus2 in zip(buses[:-1], buses[1:]):
        res.append(f"{bus1.id} to {bus2.id}: {str(bus2.get_bus_diff(bus1))}");
    # while cur_stop:
    #     res.append(f"{str(cur_stop)} {[str(x) for x in cur_stop.timings]}")
    #     cur_stop = cur_stop.prev_stop

    return res

async def update_bus_stop_timing(bus_stop: BusStop, bus_num: str) -> List[Timing]:
    url = f'https://arrivelah2.busrouter.sg/?id={bus_stop.id}'
    timings = []

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)

            if response.status_code == 200:
                data = response.json()
                service = next(
                    (service for service in data["services"] if service["no"] == bus_num),
                    None,
                )

                if service:
                    durations = [service["next"]["duration_ms"]]
                    if service['next2']:
                        durations.append(service['next2']['duration_ms'])
                        if service['next3']:
                            durations.append(service['next3']['duration_ms'])

                    timings = [
                        Timing(bus_stop, duration / 1000, idx + 1)
                        for idx, duration in enumerate(durations)
                    ]

        return timings
    except httpx.RequestError as e:
        print(f"Error fetching data from external API: {e}")
        return timings


# sanity check route
@app.route('/test', methods=['GET'])
def ping_pong():
    return jsonify('hi!')

if __name__ == '__main__':
    app.run()
