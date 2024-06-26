from models.database import db


class RoutesTable(db.Model):
    """
    Model class to represent routes_table for fetching stops info
    """
    __tablename__ = "routes_table"

    bus_num = db.Column(db.String(100), primary_key=True)
    direction = db.Column(db.Integer, primary_key=True)
    stop_seq = db.Column(db.Integer, primary_key=True)
    stop_code = db.Column(db.String(100), nullable=False)
    stop_name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    road_name = db.Column(db.String(100), nullable=False)
    next_road_name = db.Column(db.String(200), nullable=False)
    distance = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    origin_code = db.Column(db.String(100), nullable=False)
    destination_code = db.Column(db.String(100), nullable=False)
    loop_desc = db.Column(db.String(100))
    first_visit_desc = db.Column(db.String(100))
    second_visit_desc = db.Column(db.String(100))
    show_destination = db.Column(db.Boolean)

    def to_dict(self):
        return {
            "bus_num": self.bus_num,
            "direction": self.direction,
            "stop_seq": self.stop_seq,
            "stop_code": self.stop_code,
            "stop_name": self.stop_name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "road_name": self.road_name,
            "next_road_name": self.next_road_name,
            "distance": self.distance,
            "dest_code": self.destination_code,
            "loop_desc": self.loop_desc,
            "first_visit_desc": self.first_visit_desc,
            "second_visit_desc": self.second_visit_desc,
            "show_destination": self.show_destination
        }
