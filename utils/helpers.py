from datetime import timedelta


class BusStop:
    """
    Represents a bus stop with relevant information about arrivals to the stop.
    """

    def __init__(self, id: str, name: str, stop_seq: str):
        """
        Initializes a new BusStop object.

        id: The unique identifier of the bus stop.
        name: The description name of the bus stop.
        stop_seq: The stop sequence number along the bus route.
        """
        self.id = id
        self.name = name
        self.stop_seq = stop_seq
        self.prev_stop = None
        self.next_stop = None

    def set_prev_stop(self, prev_stop):
        self.prev_stop = prev_stop

    def set_next_stop(self, next_stop):
        self.next_stop = next_stop

    def __str__(self):
        return f"Bus Stop {self.id} ({self.name})"


class Timing:
    """
    Represents a bus arrival timing for a specific bus stop and bus.
    """

    def __init__(self,
                 duration: float,
                 arrival_seq: int,
                 is_forecasted=False):
        """
        Initializes a new Timing object.

        duration: Duration in seconds for the bus to reach the stop.
        arrival_seq: Sequence in which bus for this timing arrives at the stop.
        is_forecasted: Indicates if the timing is forecasted. (default: True)
        """
        self.duration = duration
        self.arrival_seq = arrival_seq
        self.is_forecasted = is_forecasted

    def get_arrival_time(self, current_datetime):
        return (current_datetime +
                timedelta(seconds=self.duration)).strftime('%H:%M:%S')

    def is_before(self, other_timing):
        return self.duration < other_timing.duration

    def __str__(self):
        return (
            f"Duration {self.duration} (next{self.arrival_seq}) "
        )


class StopSchedule:
    """
    Schedule of arrival timings and buses for specific stop
    """

    def __init__(self, bus_stop: BusStop, timings: list[Timing]):
        self.bus_stop = bus_stop
        self.timings = timings
        self.buses = []

    def get_stop_seq(self):
        return int(self.bus_stop.stop_seq)

    def get_num_timings(self):
        return len(self.timings)

    def get_bus(self, timing):
        return self.buses[self.timings.index(timing)]

    def get_last_bus(self):
        return max(self.buses)

    def get_bus_diff(self, bus):
        bus_idx = self.buses.index(bus)
        current_bus_duration = self.timings[bus_idx].duration
        prev_bus_duration = self.timings[bus_idx - 1].duration
        return current_bus_duration - prev_bus_duration

    def add_timing(self, timing):
        self.timings.append(timing)

    def assign_buses(self, next_stop_schedule):
        """
        Compare with scheule of next stop and assign buses to self
        """
        if (next_stop_schedule is None or
                self.get_num_timings() > next_stop_schedule.get_num_timings()):
            # Assign new buses
            self.buses = [i for i in range(len(self.timings))]
        else:
            next_stop_timings = next_stop_schedule.timings[:]
            for cur_stop_timing in self.timings:
                found_bus = False
                for next_stop_timing in next_stop_timings.copy():
                    next_stop_timings.remove(next_stop_timing)
                    if (cur_stop_timing.is_before(next_stop_timing)):
                        self.buses.append(
                            next_stop_schedule.get_bus(next_stop_timing))
                        found_bus = True
                        break
                if not found_bus:
                    self.buses.append(next_stop_schedule.get_last_bus() + 1)

    def forecast_new_timings(self, bus_diff):
        next_bus = self.buses[-1] + 1
        last_timing = self.timings[-1]
        while next_bus in bus_diff:
            self.add_timing(Timing(last_timing.duration + bus_diff[next_bus],
                                   last_timing.arrival_seq,
                                   True))
            self.buses.append(next_bus)
            next_bus += 1


class RouteSchedule:
    """
    Contains schedules of all the stops and methods
    to get more information about buses
    """

    def __init__(self):
        self.schedules = {}
        self.bus_diff = {}  # duration difference between bus i and bus i-1
        self.bus_location = {}  # predicted location of buses based on timing

    def add_stop_schedule(self, stop_schedule: StopSchedule):
        schedule_stop_seq = stop_schedule.get_stop_seq()
        self.schedules[schedule_stop_seq] = stop_schedule
        stop_schedule.assign_buses(self.schedules.get(schedule_stop_seq + 1))

    def update_bus_info(self):
        """
        Loop through stop schedules and add duration diff between buses
        and predicted locations.
        """
        for stop_seq in sorted(self.schedules, reverse=True):
            schedule = self.schedules[stop_seq]
            for i, bus in enumerate(schedule.buses):
                # Update location of bus
                self.bus_location[bus] = schedule.bus_stop.name
                # Update duration difference between bus and bus - 1
                if i > 0 and bus not in self.bus_diff:
                    self.bus_diff[bus] = schedule.get_bus_diff(bus)

    def forecast_new_timings(self):
        self.update_bus_info()
        for schedule in self.schedules.values():
            schedule.forecast_new_timings(self.bus_diff)

    def get_timings_from_bus(self, bus, current_datetime):
        """
        Get arrival timings for all stops for specific bus
        """
        timings = {}
        for schedule in self.schedules.values():
            if bus in schedule.buses:
                bus_idx = schedule.buses.index(bus)
                timings[schedule.get_stop_seq()] = {
                    "time": schedule.timings[bus_idx].get_arrival_time(
                        current_datetime),
                    "isForecasted": schedule.timings[bus_idx].is_forecasted,
                }
        return timings

    def get_all_timings(self, current_datetime):
        """
        Returns all the timings for the bus as an object with
        busId, busLocation, and busTimings, with busTimings
        being an object with stop sequence as key and
        stop name and time as value
        """
        all_timings = []
        for bus in sorted(self.bus_location.keys()):
            all_timings.append({
                "busId": bus + 1,
                "busLocation": self.bus_location[bus],
                "busTimings": self.get_timings_from_bus(bus, current_datetime),
            })
        return all_timings


def transform_route_records(records):
    """
    Transforms list of route records to dictionary.
    """
    bus_info = {
        "directions": {},
        "stops": {}
    }

    for record in records:
        direction = record["direction"]
        stop_seq = record["stop_seq"]
        stop_code = record["stop_code"]
        stop_name = record["stop_name"]
        distance = record["distance"]

        if direction not in bus_info["stops"]:
            bus_info["stops"][direction] = []

        if stop_seq != 1:
            bus_info["stops"][direction].append({
                "id": stop_code,
                "stopSequence": stop_seq,
                "name": stop_name,
                "distance": distance,
            })

    # Add destination stop for each direction
    # Ensure stopSequence is sequential without gaps and remove last stop
    for direction in bus_info["stops"]:
        stops = bus_info["stops"][direction]
        stops.sort(key=lambda x: x["stopSequence"])
        bus_info["directions"][direction] = f"To {stops[-1]['name']}"

        for i, stop in enumerate(stops):
            stop["stopSequence"] = i+2
        bus_info["stops"][direction] = stops[:-1]

    return bus_info
