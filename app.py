import asyncio

from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import func, exc

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
    try:
        records = RoutesTable.query.filter(
            func.upper(RoutesTable.bus_num) == bus_num).all()
        records = [record.to_dict() for record in records]
        routes_info = transform_route_records(records)
        stops_info = routes_info['stops'][int(direction)]
        dest_codes = (routes_info['directions'][int(direction)]['destCode'],
                      stops_info[-1]["id"])
        update_time, arrival_timing, bus_diff, status = asyncio.run(
            fetch_arrival_timing(bus_num, stops_info, stop_seq, dest_codes))
    except exc.SQLAlchemyError as e:
        print(e)
        return jsonify({'error': 'Database error'}), 503
    except Exception as e:
        print(e)
        return jsonify({'error': 'An unexpected error occured'}), 500

    if status == 200:
        if arrival_timing is None:
            return jsonify({'error': 'No timing found'}), 502

        return jsonify({
            'timing': arrival_timing,
            'updateTime': update_time,
            'busDiff': bus_diff
        })
    else:
        return jsonify({'error': 'External API error'}), status


@app.route('/api/all-bus-info')
def get_all_bus_info():
    records = RoutesTable.query.all()

    result = {"bus_data": {}, "stop_data": {}}
    for record in records:
        record_dict = record.to_dict()

        # Add bus data
        bus_num = record_dict["bus_num"]
        direction = record_dict["direction"]
        dest_code = record_dict["dest_code"]
        stop_code = record_dict["stop_code"]

        if bus_num not in result["bus_data"]:
            result["bus_data"][bus_num] = {}
        if direction not in result["bus_data"][bus_num]:
            result["bus_data"][bus_num][direction] = {
                "dest_code": dest_code,
                "stops": []
            }
        result["bus_data"][bus_num][direction]["stops"].append(stop_code)

        # Add stop data
        if stop_code not in result["stop_data"]:
            result["stop_data"][stop_code] = {
                "lat": record_dict["latitude"],
                "lng": record_dict["longitude"],
                "name": record_dict["stop_name"],
                "road": record_dict["road_name"],
            }

    return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
