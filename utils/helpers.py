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

    def __init__(self, id: str, name: str, stop_seq: str, distance: float,
                 visit_num: int):
        """
        Initializes a new BusStop object.

        id: The unique identifier of the bus stop.
        name: The description name of the bus stop.
        stop_seq: The stop sequence number along the bus route.
        distance: The distance from the bus stop to previous stop.
        visit_num: The visit number of the bus stop.
        """
        self.id = id
        self.name = name
        self.stop_seq = stop_seq
        self.distance = distance
        self.prev_stop = None
        self.next_stop = None
        self.visit_num = visit_num

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

    def get_stop_seq(self):
        return int(self.stop_seq)

    def __str__(self):
        return f"Bus Stop {self.id} ({self.name})"


class Timing:
    """
    Represents a bus arrival timing for a specific bus stop and bus.
    """

    def __init__(self,
                 duration: float,
                 arrival_seq: int = None,
                 type: str = None,
                 origin: str = None,
                 load: str = None,
                 lng: float = None,
                 lat: float = None,
                 visit_num: int = None,
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
        visit_num: Visit number of bus (default: None).
        is_forecasted: Indicates if the timing is forecasted. (default: True)
        """
        self.duration = duration
        self.arrival_seq = arrival_seq
        self.type = type
        self.origin = origin
        self.load = load
        self.lng = lng
        self.lat = lat
        self.visit_num = visit_num
        self.is_forecasted = is_forecasted

    def get_arrival_time(self, current_datetime):
        return (current_datetime +
                timedelta(seconds=self.duration)).strftime('%H:%M:%S')

    def has_same_profile(self, other_timing):
        """
        Checks if two timings have same bus type and origin
        """
        return ((self.type == other_timing.type
                and self.origin == other_timing.origin)
                or self.is_forecasted or other_timing.is_forecasted)

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


class BusSchedule:
    """
    Contains timings of a bus for stops along a route
    """

    def __init__(self, id: int, bus_stops: List[BusStop]):
        self.id = id
        self.schedule = {}
        self.bus_stops = {stop.stop_seq: stop
                          for stop in bus_stops}

    def has_suitable_slot(self, stop_seq: int, timing: Timing):
        """
        Checks if timing aligns with existing timings
        """
        if stop_seq in self.schedule:
            return False
        if self.get_bus_type() != timing.type:
            return False
        if self.get_bus_origin() != timing.origin:
            return False
        if self.has_latlng(timing.get_latlng()):
            return True
        if stop_seq + 1 in self.schedule:
            next_stop_duration = self.schedule[stop_seq + 1].duration
            current_stop_duration = timing.duration
            travel_time = next_stop_duration - current_stop_duration
            dist = self.bus_stops[stop_seq + 1].get_distance()
            if travel_time == 0:
                speed = 0
            else:
                speed = dist / (travel_time / 3600)

            if travel_time < -120:
                # Check if travel time is beyond negative threshold
                return False
            if (dist > 2 and (speed > 60 or speed < 0)):
                # Check for speed for long distance
                return False
            if (0 < speed < 3):
                # Check if speed is too slow
                return False

        return True

    def has_perfect_slot(self, stop_seq: int, timing: Timing):
        """
        Checks if timing aligns with existing timings exactly
        based on bus type, origin, and latlng
        """
        if stop_seq in self.schedule:
            return False
        return (self.get_bus_type() == timing.type and
                self.get_bus_origin() == timing.origin and
                self.has_latlng(timing.get_latlng()))

    def set_timing(self, stop_seq: int, timing: Timing):
        self.schedule[stop_seq] = timing

    def remove_timing(self, stop_seq: int):
        del self.schedule[stop_seq]

    def get_location(self):
        for stop_seq in sorted(self.schedule.keys()):
            if stop_seq == 2:
                return "Yet to depart"
            elif stop_seq < 5 and self.has_no_latlng():
                return "Yet to depart"
            elif self.schedule[stop_seq].duration > 0:
                return self.bus_stops[stop_seq].name
        return self.bus_stops[max(self.schedule.keys())].name

    def has_no_latlng(self):
        for timing in self.schedule.values():
            latlng = timing.get_latlng()
            if latlng is not None and latlng != (0, 0):
                return False
        return True

    def get_bus_type(self):
        for timing in self.schedule.values():
            if timing.type is not None:
                return timing.type

    def get_bus_load(self):
        for timing in self.schedule.values():
            if timing.load is not None:
                return timing.load

    def get_bus_origin(self):
        for timing in self.schedule.values():
            if timing.origin is not None:
                return timing.origin

    def get_all_timings(self, current_datetime):
        all_timings = {}
        for stop_seq, timing in self.schedule.items():
            all_timings[stop_seq] = {
                "time": timing.get_arrival_time(current_datetime),
                "isForecasted": timing.is_forecasted,
                "isSpecial": timing.is_special_departure(
                    self.bus_stops[2].id),
                "load": timing.get_load(),
                "latlng": timing.get_latlng(),
                "busType": timing.get_bus_type(),
            }
        return all_timings

    def has_latlng(self, latlng):
        if 0 in latlng or None in latlng:
            return False
        for timing in self.schedule.values():
            if timing.get_latlng() == latlng:
                return True

    def is_before(self, other):
        common_stop_seq = (set(self.schedule.keys()) &
                           set(other.schedule.keys()))
        if len(common_stop_seq) == 0:
            return max(self.schedule.keys()) > max(other.schedule.keys())
        else:
            max_common_stop = max(common_stop_seq)
            return (self.schedule[max_common_stop].duration
                    < other.schedule[max_common_stop].duration)

    def get_min_stop_seq(self):
        return min(self.schedule.keys(), default=100)

    def has_latlng_match(self, stop_seq):
        latlng = self.schedule[stop_seq].get_latlng()
        if 0 in latlng or None in latlng:
            return False
        for (other_seq, timing) in self.schedule.items():
            if timing.get_latlng() == latlng and other_seq != stop_seq:
                return True
        return False


class RouteSchedule:
    """
    Contains schedules of all the stops and methods
    to get more information about buses
    """

    SPECIAL_BUSES = ['160', '950']

    def __init__(self, bus_stops: List[BusStop], bus_num: str):
        self.bus_schedules = []
        self.bus_stops = bus_stops
        self.bus_num = bus_num

    def get_candidate_schedules(self, stop_seq: int):
        candidates = [schedule.id for schedule in self.bus_schedules
                      if stop_seq in schedule.schedule]
        if len(candidates) == 0:
            return []
        return [schedule for schedule in self.bus_schedules
                if min(candidates) <= schedule.id <= max(candidates)]

    def get_last_schedule_id(self):
        if len(self.bus_schedules) == 0:
            return 0
        else:
            return self.bus_schedules[-1].id

    def add_timings(self, timings: List[Timing], bus_stop: BusStop):
        # Main logic for assigning timings to schedules
        assigned_schedules = []
        current_stop_seq = bus_stop.get_stop_seq()
        next_stop_seq = current_stop_seq + 1
        candidate_schedules = self.get_candidate_schedules(next_stop_seq)
        if len(candidate_schedules) == 0:
            # If no schedules have timings for next stop, create new schedule
            last_id = self.get_last_schedule_id()
            for idx, timing in enumerate(timings):
                bus_schedule = BusSchedule(last_id + idx + 1, self.bus_stops)
                bus_schedule.set_timing(current_stop_seq, timing)
                self.bus_schedules.append(bus_schedule)
            return
        for idx, timing in enumerate(timings):
            for schedule in self.bus_schedules:
                # Skip latlng matches for special buses
                if self.bus_num in self.SPECIAL_BUSES:
                    continue
                # First match by latlng and bus type
                if schedule.has_perfect_slot(current_stop_seq, timing):
                    schedule.set_timing(current_stop_seq, timing)
                    assigned_schedules.append(schedule)
                    break
            else:
                # If no perfect match, match by duration and other factors
                for schedule in candidate_schedules:
                    if schedule.has_suitable_slot(current_stop_seq, timing):
                        schedule.set_timing(current_stop_seq, timing)
                        assigned_schedules.append(schedule)
                        break
                else:
                    # Check if adding timing to schedule before first
                    # candidate is more reasonable than adding to schedule
                    # after last candidate
                    if (idx <= 1 and
                            self.is_suitable_before(current_stop_seq, timing)):
                        bus_schedule = self.get_bus_schedule_before(
                            candidate_schedules[0])
                    else:
                        bus_schedule = self.get_bus_schedule_after(
                            candidate_schedules[-1], current_stop_seq)
                    bus_schedule.set_timing(current_stop_seq, timing)
                    assigned_schedules.append(bus_schedule)
        # Further optimisation to remove gaps between timings
        sorted_schedule = sorted(assigned_schedules, key=lambda x: x.id)
        for i in range(len(sorted_schedule) - 1, 0, -1):
            schedule2 = sorted_schedule[i]
            schedule2_before = self.get_bus_schedule_before(schedule2)
            schedule1 = sorted_schedule[i - 1]
            timing = schedule1.schedule[current_stop_seq]
            if schedule2_before in sorted_schedule:
                continue
            if (schedule2_before.has_suitable_slot(current_stop_seq, timing)
                    and not schedule1.has_latlng_match(current_stop_seq)):
                schedule2_before.set_timing(current_stop_seq, timing)
                schedule1.remove_timing(current_stop_seq)
                sorted_schedule[i - 1] = schedule2_before

    def sort_schedules(self):
        for i in range(len(self.bus_schedules)):
            swapped = False
            for j, (s1, s2) in enumerate(zip(self.bus_schedules,
                                             self.bus_schedules[1:])):
                if s2.is_before(s1):
                    self.bus_schedules[j] = s2
                    self.bus_schedules[j + 1] = s1
                    s1.id, s2.id = s2.id, s1.id
                    swapped = True
            if not swapped:
                break

    def is_suitable_before(self, stop_seq: int, timing: Timing):
        # TODO: Check for bus type
        for schedule in self.bus_schedules:
            if stop_seq + 1 in schedule.schedule:
                min_duration = schedule.schedule[stop_seq + 1].duration
                return min_duration - timing.duration > -60
        return False

    def get_bus_schedule_before(self, schedule: BusSchedule):
        if schedule == self.bus_schedules[0]:
            new_schedule = BusSchedule(schedule.id - 1, self.bus_stops)
            self.bus_schedules.insert(0, new_schedule)
            return new_schedule
        else:
            return self.bus_schedules[self.bus_schedules.index(schedule) - 1]

    def get_bus_schedule_after(self, schedule: BusSchedule, stop_seq: int):
        """
        Returns the next available bus schedule after the given schedule
        that does not have a timing at the given stop seq
        """
        if schedule == self.bus_schedules[-1]:
            new_schedule = BusSchedule(schedule.id + 1, self.bus_stops)
            self.bus_schedules.append(new_schedule)
            return new_schedule
        else:
            next_schedule = self.bus_schedules[
                self.bus_schedules.index(schedule) + 1]
            if stop_seq in next_schedule.schedule:
                return self.get_bus_schedule_after(next_schedule, stop_seq)
            else:
                return next_schedule

    def get_all_bus_diff(self):
        all_diff = {}
        for bus_schedule, next_schedule in zip(
                self.bus_schedules, self.bus_schedules[1:]):
            bus_diff = self.get_bus_diff(bus_schedule, next_schedule)
            if bus_diff is None:
                continue
            all_diff[bus_schedule.id] = bus_diff
        return all_diff

    def get_bus_diff(self, bus_schedule, next_schedule,
                     exclude_forecast=True):
        common_stops = set(bus_schedule.schedule.keys()) & set(
            next_schedule.schedule.keys())
        all_diff = []
        for stop_seq in common_stops:
            current_timing = bus_schedule.schedule[stop_seq]
            next_timing = next_schedule.schedule[stop_seq]
            # Skip if any timing is forecasted and exclude_forecast
            # is True
            if (exclude_forecast and
                (current_timing.is_forecasted or
                 next_timing.is_forecasted)):
                continue
            bus_diff = (next_timing.duration - current_timing.duration)
            all_diff.append(bus_diff)
        # Find and return the median of all the differences
        if len(all_diff) == 0:
            return None
        return sorted(all_diff)

    def get_last_stop_seq(self):
        return max([stops.stop_seq for stops in self.bus_stops])

    def forecast_new_timings(self):
        def make_forecast(real_schedule, forecast_schedule, stop_seq,
                          bus_diff):
            can_forecast = (stop_seq not in forecast_schedule.schedule and
                            stop_seq in real_schedule.schedule and
                            forecast_schedule.get_min_stop_seq() < stop_seq)
            if can_forecast:
                prev_duration = real_schedule.schedule[stop_seq].duration
                new_timing = Timing(prev_duration + bus_diff,
                                    is_forecasted=True)
                forecast_schedule.set_timing(stop_seq, new_timing)

        for exclude_forecast in [True, False]:
            for bus_schedule, next_schedule in zip(
                    self.bus_schedules, self.bus_schedules[1:]):
                bus_diff = self.get_bus_diff(
                    bus_schedule, next_schedule, exclude_forecast)
                if bus_diff is None:
                    continue

                # Get the median bus diff
                bus_diff = bus_diff[len(bus_diff) // 2]

                for bus_stop in self.bus_stops:
                    stop_seq = bus_stop.get_stop_seq()
                    make_forecast(bus_schedule, next_schedule,
                                  stop_seq, bus_diff)
                    make_forecast(next_schedule, bus_schedule,
                                  stop_seq, -bus_diff)

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
        def convert_schedule_to_dict(schedule):
            return {
                "busId": schedule.id,
                "busLocation": schedule.get_location(),
                "busTimings": schedule.get_all_timings(current_datetime),
            }
        all_timings = list(map(convert_schedule_to_dict, self.bus_schedules))
        return all_timings


def transform_route_records(records):
    """
    Transforms list of route records to dictionary.
    """
    directions_info = {}
    stops_info = {}

    unique_dists = {1: [], 2: []}

    for record in records:
        direction = record["direction"]
        stop_seq = record["stop_seq"]
        stop_code = record["stop_code"]
        stop_name = record["stop_name"]
        latitude = record["latitude"]
        longitude = record["longitude"]
        distance = record["distance"]
        dest_code = record["dest_code"]
        loop_desc = record["loop_desc"]

        if direction not in stops_info:
            stops_info[direction] = []
        if direction not in directions_info:
            directions_info[direction] = {
                "destCode": dest_code,
                "loopDesc": loop_desc,
            }

        if distance not in unique_dists[direction]:
            unique_dists[direction].append(distance)
            stops_info[direction].append({
                "id": stop_code,
                "stopSequence": stop_seq,
                "name": stop_name,
                "distance": distance,
                "latitude": latitude,
                "longitude": longitude,
            })

    # Add destination stop for each direction
    # Ensure stopSequence is sequential without gaps and remove last stop
    for direction in stops_info:
        stops = stops_info[direction]
        stops.sort(key=lambda x: x["stopSequence"])
        directions_info[direction]["text"] = f"To {stops[-1]['name']}"

        for i, stop in enumerate(stops):
            stop["stopSequence"] = i+2
        stops_info[direction] = stops[:-1]

    return {"directions": directions_info, "stops": stops_info}
