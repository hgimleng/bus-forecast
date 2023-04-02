from flask import Flask, jsonify
from flask_cors import CORS

# configuration
DEBUG = True

# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})


# Sample data to return for the API endpoint.
sample_data = {
    '123': {
        'directions': ['1', '2'],
        'stops': {
            '1': [
                {'id': 'stop1', 'name': 'Stop 1'},
                {'id': 'stop2', 'name': 'Stop 2'},
            ],
            '2': [
                {'id': 'stop3', 'name': 'Stop 3'},
                {'id': 'stop4', 'name': 'Stop 4'},
            ],
        },
    },
}

@app.route('/api/bus/<string:bus_number>')
def get_bus_info(bus_number):
    bus_info = sample_data.get(bus_number)
    if bus_info:
        return jsonify(bus_info)
    else:
        return jsonify({'error': 'Bus number not found'}), 404

@app.route('/api/bus/<busNumber>/direction/<direction>/stop/<stopId>', methods=['GET'])
def get_bus_arrival_timing(busNumber, direction, stopId):
    # Fetch arrival timings based on the provided parameters
    # Replace the following line with your actual data fetching logic
    arrival_timing = fetch_arrival_timing(busNumber, direction, stopId)

    if arrival_timing is not None:
        return jsonify(arrival_timing)
    else:
        return jsonify({'error': 'Bus arrival timing not found'}), 404

# Replace this function with your actual data fetching logic
def fetch_arrival_timing(busNumber, direction, stopId):
    # Fetch bus arrival timings from a data source (e.g., database or external API)
    # Here's a dummy example, replace with your actual logic
    return {'arrivalTime': '11:30 AM'}

# sanity check route
@app.route('/test', methods=['GET'])
def ping_pong():
    return jsonify('hi!')

if __name__ == '__main__':
    app.run()
