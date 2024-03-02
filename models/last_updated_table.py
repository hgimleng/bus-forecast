from models.database import db


class LastUpdatedTable(db.Model):
    """
    Model class to represent last_updated_table for storing last updated time
    """
    __tablename__ = "last_updated_table"

    id = db.Column(db.Integer, primary_key=True)
    last_updated = db.Column(db.DateTime, primary_key=False)

    def to_dict(self):
        return {
            "id": self.id,
            "last_updated": self.last_updated
        }
