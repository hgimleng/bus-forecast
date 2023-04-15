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
        self.timings = []

    def add_timing(self, timing):
        self.timings.append(timing)

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
                 bus_stop: BusStop,
                 duration: float,
                 arrival_seq: int,
                 from_api=True):
        """
        Initializes a new Timing object.

        bus_stop: Bus stop which the bus is approaching for this timing.
        duration: Duration in seconds for the bus to reach the stop.
        arrival_seq: Sequence in which bus for this timing arrives at the stop.
        from_api: Indicates if the timing is obtained directly from the API
                  (default: True).
        """
        self.bus_stop = bus_stop
        self.duration = duration
        self.arrival_seq = arrival_seq
        self.from_api = from_api
        self.bus = None

        self.bus_stop.add_timing(self)

    def set_bus(self, bus):
        self.bus = bus
        bus.add_timing(self)

    """
    Checks whether this and other_timing are likely to be from the same bus.
    """
    def has_matching_bus(self, other_timing):
        if self.bus_stop == other_timing.bus_stop:
            return self.duration == other_timing.duration
        elif self.bus_stop.stop_seq < other_timing.bus_stop.stop_seq:
            # This timing bus stop comes before other_timing bus stop
            return self.duration < other_timing.duration
        else:
            # This timing bus stop comes after other_timing bus stop
            return self.duration > other_timing.duration

    def get_arrival_time(self, current_datetime):
        return (current_datetime +
                timedelta(seconds=self.duration)).strftime('%H:%M:%S')

    def __str__(self):
        return (
            f"Duration {self.duration} (next{self.arrival_seq}) "
            f"(bus {self.bus.id}) (stop {self.bus_stop.name})"
        )


class Bus:
    """
    Represents a bus with relevant information on its arrival to various stops.
    """

    _next_id = 0  # Class variable to keep track of next id

    def __init__(self):
        """
        Initializes a new Bus object with unique ID.
        """
        self.id = Bus._next_id
        self.timings = {}

        Bus._next_id = Bus._next_id + 1

    def add_timing(self, timing):
        """
        Adds an arrival timing to timings dict, with the stop_seq as key.
        """
        self.timings[timing.bus_stop.stop_seq] = timing

    def get_bus_diff(self, other_bus):
        """
        Obtain the duration difference between two buses based on the
        latest bus stop where they have timings in common. If they
        have no bus stop in common, None will be returned.
        """
        common_stops = set(self.timings.keys()) & set(other_bus.timings.keys())
        if common_stops:
            max_common_stop = max(common_stops)
            return (
                abs(self.timings[max_common_stop].duration -
                    other_bus.timings[max_common_stop].duration)
            )
        else:
            return None

    def is_last_bus(self):
        """
        Returns boolean of whether the bus is the last bus
        """
        return self.id == Bus._next_id - 1

    @classmethod
    def reset_id_counter(cls):
        cls._next_id = 0

    def __str__(self):
        return (
            f"Bus {self.id} with timings at "
            f"{[str(v) for k, v in self.timings.items()]}"
        )
