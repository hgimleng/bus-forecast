import asyncio

from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import func, exc

from models.database import init_db
from models.routes_table import RoutesTable
from models.last_updated_table import LastUpdatedTable
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

        bus_num = record_dict["bus_num"]
        direction = record_dict["direction"]
        dest_code = record_dict["dest_code"]
        stop_code = record_dict["stop_code"]
        loop_desc = record_dict["loop_desc"]
        show_destination = record_dict["show_destination"]
        first_visit_desc = record_dict["first_visit_desc"]
        second_visit_desc = record_dict["second_visit_desc"]

        # Add stop data
        if stop_code not in result["stop_data"]:
            result["stop_data"][stop_code] = {
                "lat": record_dict["latitude"],
                "lng": record_dict["longitude"],
                "name": record_dict["stop_name"],
                "road": record_dict["road_name"],
                "next_road_name": record_dict["next_road_name"],
                "buses": [],
                "show_destination": [],
                "visit_info": {}
            }

        # Add bus data
        if bus_num not in result["bus_data"]:
            result["bus_data"][bus_num] = {}
        if direction not in result["bus_data"][bus_num]:
            result["bus_data"][bus_num][direction] = {
                "dest_code": dest_code,
                "stops": [],
                "loop_desc": loop_desc
            }
        result["bus_data"][bus_num][direction]["stops"].append(stop_code)
        if bus_num not in result["stop_data"][stop_code]["buses"]:
            result["stop_data"][stop_code]["buses"].append(bus_num)
            if show_destination:
                result["stop_data"][stop_code]["show_destination"].append(bus_num)
            if first_visit_desc or second_visit_desc:
                result["stop_data"][stop_code]["visit_info"][bus_num] = [first_visit_desc, second_visit_desc]

    # Add destination name
    for bus_num in result["bus_data"]:
        for direction in result["bus_data"][bus_num]:
            dest_code = result["bus_data"][bus_num][direction]["dest_code"]
            route_info = result["bus_data"][bus_num][direction]
            route_info["dest_name"] = result["stop_data"][dest_code]["name"]

    return jsonify(result)


@app.route('/api/last-updated')
def get_last_updated():
    # Select last row from last_updated_table
    last_updated = LastUpdatedTable.query.order_by(LastUpdatedTable.id.desc()).first()
    if last_updated:
        return jsonify(last_updated.to_dict())
    else:
        # Return default last updated time if table is empty
        return jsonify({"id": 0, "last_updated": "2024-01-01 00:00:00"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
