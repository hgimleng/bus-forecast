class BusStop:
    def __init__(self, id, name, stopSequence):
        self.id = id
        self.name = name
        self.stopSequence = stopSequence
        self.prev_stop = None
        self.next_stop = None
        self.timings = []
    
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

    def set_prev_timing(self, prev_timing):
        self.prev_timing = prev_timing

    def set_next_timing(self, next_timing):
        self.next_timing = next_timing
    
    def __str__(self):
        return f"Duration {self.duration} (next{self.bus_seq}) for {str(self.bus_stop)}"
