from datetime import timedelta
import logging
from typing import List

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] - %(message)s',
    handlers=[
        logging.StreamHandler()  # Output logs to the console
    ]
)


class BusStop:
    """
    Represents a bus stop with relevant information about arrivals to the stop.
    """

    def __init__(self, id: str, name: str, stop_seq: str, distance: float):
        """
        Initializes a new BusStop object.

        id: The unique identifier of the bus stop.
        name: The description name of the bus stop.
        stop_seq: The stop sequence number along the bus route.
        distance: The distance from the bus stop to origin.
        """
        self.id = id
        self.name = name
        self.stop_seq = stop_seq
        self.distance = distance
        self.prev_stop = None
        self.next_stop = None

    def set_prev_stop(self, prev_stop):
        self.prev_stop = prev_stop

    def set_next_stop(self, next_stop):
        self.next_stop = next_stop

    def get_distance(self):
        """
        Get distance between this stop and previous stop
        """
        if self.prev_stop:
            return self.distance - self.prev_stop.distance
        else:
            return self.distance

    def __str__(self):
        return f"Bus Stop {self.id} ({self.name})"


class Timing:
    """
    Represents a bus arrival timing for a specific bus stop and bus.
    """

    def __init__(self,
                 duration: float,
                 arrival_seq: int,
                 type: str = None,
                 origin: str = None,
                 load: str = None,
                 lng: float = None,
                 lat: float = None,
                 is_forecasted=False):
        """
        Initializes a new Timing object.

        duration: Duration in seconds for the bus to reach the stop.
        arrival_seq: Sequence in which bus for this timing arrives at the stop.
        type: Type of bus, single, double, or bendy (default: None).
        origin: Origin bus stop code of bus (default: None).
        load: Load of bus, SEA, SDA, LSD, or EMPTY (default: None).
        lng: Longitude of bus (default: None).
        lat: Latitude of bus (default: None).
        is_forecasted: Indicates if the timing is forecasted. (default: True)
        """
        self.duration = duration
        self.arrival_seq = arrival_seq
        self.type = type
        self.origin = origin
        self.load = load
        self.lng = lng
        self.lat = lat
        self.is_forecasted = is_forecasted

    def get_arrival_time(self, current_datetime):
        return (current_datetime +
                timedelta(seconds=self.duration)).strftime('%H:%M:%S')

    def has_same_profile(self, other_timing):
        """
        Checks if two timings have same bus type and origin
        """
        return (self.type == other_timing.type
                and self.origin == other_timing.origin)

    def is_special_departure(self, first_stop_id):
        """
        Check if bus is a special departure based on origin.
        """
        if self.origin and self.origin != first_stop_id:
            return True
        else:
            return False

    def get_load(self):
        """
        Get load of bus based on load.
        """
        if self.load == "SEA":
            return "Low"
        elif self.load == "SDA":
            return "Medium"
        elif self.load == "LSD":
            return "High"
        else:
            return "NA"

    def get_latlng(self):
        """
        Get latitude and longitude of bus.
        """
        return (self.lat, self.lng)

    def get_bus_type(self):
        """
        Get bus type.
        """
        if self.type == "SD":
            return "Single Deck"
        elif self.type == "DD":
            return "Double Deck"
        elif self.type == "BD":
            return "Bendy"
        else:
            return "NA"

    def __str__(self):
        return (
            f"Duration {self.duration} (next{self.arrival_seq}) "
        )


class StopSchedule:
    """
    Schedule of arrival timings and buses for specific stop
    """

    def __init__(self, bus_stop: BusStop, timings: List[Timing]):
        self.bus_stop = bus_stop
        self.timings = timings
        self.buses = []

    def get_stop_seq(self):
        return int(self.bus_stop.stop_seq)

    def get_num_timings(self):
        return len(self.timings)

    def get_bus(self, timing: Timing):
        return self.buses[self.timings.index(timing)]

    def get_timing(self, bus: int):
        return self.timings[self.buses.index(bus)]

    def get_last_bus(self):
        return max(self.buses, default=0)

    def get_bus_diff(self, bus: int):
        """
        Get duration difference between current bus and previous bus.
        """
        bus_idx = self.buses.index(bus)
        current_bus_duration = self.timings[bus_idx].duration
        prev_bus_duration = self.timings[bus_idx - 1].duration
        return current_bus_duration - prev_bus_duration

    def add_timing(self, timing: Timing):
        self.timings.append(timing)

    def assign_buses(self, next_stop_schedule):
        """
        Compare with scheule of next stop and assign buses to self
        """
        if next_stop_schedule is None:
            # Assign new buses for first stop schedule
            self.buses = [i for i in range(len(self.timings))]
            return

        # If no timings, return
        if (self.get_num_timings() == 0 or
                next_stop_schedule.get_num_timings() == 0):
            return
        # Look for timings that match
        def is_different(this_stop_timings, next_stop_timings,
                         dist, check_range=True):
            """
            Checks if any of the timings are significantly different
            """
            travel_time = [
                t2.duration - t1.duration + 1e-9
                for t1, t2 in zip(this_stop_timings, next_stop_timings)
            ]
            profiles = [
                t2.has_same_profile(t1)
                for t1, t2 in zip(this_stop_timings, next_stop_timings)
            ]
            average_speed = [dist/(t/3600) for t in travel_time]
            if min(travel_time) < -120:
                # Skip if travel time is beyond negative threshold
                logging.debug(f"{self.bus_stop.name} negative skip")
                return True
            if check_range and max(travel_time) - min(travel_time) > 180:
                # Skip if range of travel time is beyond 3 mins
                logging.debug(f"{self.bus_stop.name} max range skip")
                return True
            if not all(profiles):
                # Skip if type or origin is different
                logging.debug(f"{self.bus_stop.name} profile skip")
                return True
            if (dist > 2 and
                    any(speed > 60 or speed < 0
                        for speed in average_speed)):
                # Skip if long distance and speed is more than 60km/h
                logging.debug(f"{self.bus_stop.name} high speed skip")
                return True
            if any(0 < speed < 2 for speed in average_speed):
                # Skip if speed is less than 2km/h and non negative
                logging.debug(f"{self.bus_stop.name} low speed skip")
                return True
            logging.debug(f"{self.bus_stop.name} speed: {average_speed}")
            return False

        # Assign buses based on next stop schedule
        # Get timings for next stop excluding special departures
        next_stop_timings = [t for t in next_stop_schedule.timings
                             if t.origin != next_stop_schedule.bus_stop.id]
        distance = next_stop_schedule.bus_stop.get_distance()
        for offset in range(len(next_stop_timings)):
            logging.info(f"check if different {offset} at {self.bus_stop.name}")
            if is_different(self.timings, next_stop_timings[offset:],
                            distance):
                continue

            # Assign same buses as next stop
            self.buses = next_stop_schedule.buses[offset:]
            self.buses = self.buses[:len(self.timings)]
            break
        # Check with offset on current stop timings
        logging.info(f"check if different -1 at {self.bus_stop.name}")
        if (len(self.buses) == 0 and
            self.get_num_timings() > 1 and
            not is_different(
                self.timings[1:], next_stop_timings, distance)):
            self.buses = [bus - 1 for bus in next_stop_schedule.buses]
        # If still no buses and distance is less than 2km
        # check for difference without range check
        if (len(self.buses) == 0 and distance < 2):
            logging.debug(f"{self.bus_stop.name} no initial match")
            for offset in range(len(next_stop_timings)):
                if is_different(self.timings,
                                next_stop_timings[offset:],
                                distance, check_range=False):
                    continue
                self.buses = next_stop_schedule.buses[offset:]
                break
        # If no buses assigned and speed is very low, remove
        # last timing which may be an anomaly
        speed_est = distance/(next_stop_timings[-1].duration/3600)
        if (len(self.buses) == 0 and speed_est < 2 and
                len(self.timings) == 3):
            logging.warning(
                f"{self.bus_stop.name} low speed, remove last timing"
                f" speed: {speed_est}"
                f" buses: {self.buses}"
                )
            self.timings = self.timings[:-1]
            self.assign_buses(next_stop_schedule)
            return
        # Assign new buses if some are not allocated
        while len(self.buses) < len(self.timings):
            last_bus = max(self.get_last_bus(),
                           next_stop_schedule.get_last_bus())
            self.buses.append(last_bus + 1)

    def forecast_new_timings(self, bus_diff):
        # If no timings, return
        if self.get_num_timings() == 0 or len(self.buses) == 0:
            return

        def find_median(arr):
            arr = sorted(arr)
            if len(arr) % 2 == 0:
                return (arr[len(arr)//2 - 1] + arr[len(arr)//2])/2
            else:
                return arr[len(arr)//2]
        next_bus = self.buses[-1] + 1
        while next_bus in bus_diff:
            last_timing = self.timings[-1]
            new_duration = last_timing.duration+find_median(bus_diff[next_bus])
            self.add_timing(Timing(new_duration,
                                   last_timing.arrival_seq,
                                   is_forecasted=True))
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
        # Update bus diff
        for bus in stop_schedule.buses[1:]:
            if bus not in self.bus_diff:
                self.bus_diff[bus] = []
            self.bus_diff[bus].append(stop_schedule.get_bus_diff(bus))

    def update_bus_info(self):
        """
        Loop through stop schedules and add duration diff between buses
        and predicted locations.
        """
        for stop_seq in sorted(self.schedules, reverse=True):
            schedule = self.schedules[stop_seq]
            for bus in schedule.buses:
                # Update location of bus
                if schedule.bus_stop.stop_seq == 2:
                    self.bus_location[bus] = "Yet to depart"
                elif (schedule.bus_stop.stop_seq < 5 and
                      all(t.get_latlng() == (0, 0) for t in schedule.timings)):
                    # Check if all timing of bus has no location
                    self.bus_location[bus] = "Yet to depart"
                elif (schedule.get_timing(bus).duration < 0 and
                      bus in self.bus_location):
                    # Ignore stops with negative duration if
                    # bus is already in the dict
                    continue
                else:
                    self.bus_location[bus] = schedule.bus_stop.name

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
                bus_timing = schedule.timings[bus_idx]
                # Get stop schedule with smallest key
                first_stop_id = min(self.schedules.values(),
                                    key=lambda x: x.get_stop_seq()).bus_stop.id
                timings[schedule.get_stop_seq()] = {
                    "time": bus_timing.get_arrival_time(current_datetime),
                    "isForecasted": bus_timing.is_forecasted,
                    "isSpecial": bus_timing.is_special_departure(
                        first_stop_id),
                    "load": bus_timing.get_load(),
                    "latlng": bus_timing.get_latlng(),
                    "busType": bus_timing.get_bus_type(),
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

    unique_dists = {1: [], 2: []}

    for record in records:
        direction = record["direction"]
        stop_seq = record["stop_seq"]
        stop_code = record["stop_code"]
        stop_name = record["stop_name"]
        distance = record["distance"]

        if direction not in bus_info["stops"]:
            bus_info["stops"][direction] = []

        if distance not in unique_dists[direction]:
            unique_dists[direction].append(distance)
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
