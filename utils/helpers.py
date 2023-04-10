class BusStop:
    def __init__(self, id, name, stopSequence):
        self.id = id
        self.name = name
        self.stopSequence = stopSequence
        self.prev_stop = None
        self.next_stop = None
        self.timings = []
    
    def add_timing(self, timing):
        self.timings.append(timing)

    def set_prev_stop(self, prev_stop):
        self.prev_stop = prev_stop

    def set_next_stop(self, next_stop):
        self.next_stop = next_stop
    
    def __str__ (self):
        return f"Bus Stop {self.id} ({self.name})"


class Timing:
    def __init__(self, bus_stop, duration, bus_seq, from_api=True):
        self.bus_stop = bus_stop
        self.duration = duration
        self.bus_seq = bus_seq
        self.from_api = from_api
        self.next_timing = None
        self.prev_timing = None
        self.bus = None

        self.bus_stop.add_timing(self)

    def set_bus(self, bus):
        self.bus = bus
        bus.add_timing(self)

    def set_prev_timing(self, prev_timing):
        self.prev_timing = prev_timing

    def set_next_timing(self, next_timing):
        self.next_timing = next_timing

    """ Checks whether this and other_timing are likely to be from the same bus """
    def has_same_bus(self, other_timing):
        if self.bus_stop == other_timing.bus_stop:
            return self.duration == other_timing.duration
        elif self.bus_stop.stopSequence < other_timing.bus_stop.stopSequence:
            # This timing bus stop comes before other_timing bus stop
            return self.duration < other_timing.duration
        else:
            # This timing bus stop comes after other_timing bus stop
            return self.duration > other_timing.duration
    
    def __str__(self):
        return f"Duration {self.duration} (next{self.bus_seq}) (bus {self.bus.id})"


class Bus:
    _next_id = 1  # Class variable to keep track of next id

    def __init__(self):
        self.id = Bus._next_id
        self.timings = {}

        Bus._next_id = Bus._next_id + 1
    
    def add_timing(self, timing):
        self.timings[timing.bus_stop.stopSequence] = timing

    def get_bus_diff(self, other_bus):
        common_stops = set(self.timings.keys()) & set(other_bus.timings.keys())
        if common_stops:
            max_common_stop = max(common_stops)
            return abs(self.timings[max_common_stop].duration - other_bus.timings[max_common_stop].duration)
        else:
            return None

    @classmethod
    def reset_id_counter(cls):
        cls._next_id = 1

    def __str__(self):
        return f"Bus {self.id} with timings at {[str(v) for k, v in self.timings.items()]}"
