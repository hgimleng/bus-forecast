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
    distance = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "bus_num": self.bus_num,
            "direction": self.direction,
            "stop_seq": self.stop_seq,
            "stop_code": self.stop_code,
            "stop_name": self.stop_name,
            "distance": self.distance,
        }
