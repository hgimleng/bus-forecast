import asyncio

from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import func

from models.database import init_db
from models.routes_table import RoutesTable
from utils.forecaster import fetch_arrival_timing
from utils.helpers import transform_route_records

# configuration
DEBUG = True

# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)

init_db(app)

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})


@app.route('/api/bus/<string:bus_num>')
def get_bus_info(bus_num):
    records = RoutesTable.query.filter(
        func.upper(RoutesTable.bus_num) == bus_num).all()
    records = [record.to_dict() for record in records]
    bus_info = transform_route_records(records)

    if bus_info:
        return jsonify(bus_info)
    else:
        return jsonify({'error': 'Bus number not found'}), 404


@app.route('/api/bus/<bus_num>/direction/<direction>/stop/<stop_seq>', methods=['GET'])
def get_bus_arrival_timing(bus_num, direction, stop_seq):
    # Fetch arrival timings based on the provided parameters
    records = RoutesTable.query.filter(
        func.upper(RoutesTable.bus_num) == bus_num).all()
    records = [record.to_dict() for record in records]
    routes_info = transform_route_records(records)
    stops_info = routes_info['stops'][int(direction)]
    dest_code = routes_info['directions'][int(direction)]['destCode']
    update_time, arrival_timing, bus_diff = asyncio.run(
        fetch_arrival_timing(bus_num, stops_info, stop_seq, dest_code))

    if arrival_timing is not None:
        return jsonify({
            'timing': arrival_timing,
            'updateTime': update_time,
            'busDiff': bus_diff
        })
    else:
        return jsonify({'error': 'Bus arrival timing not found'}), 404


if __name__ == '__main__':
    app.run()
