import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDistanceFromLatLonInKm } from '../../utilities/utils';

function RecenterButton({ center }) {
    const map = useMap();

    // Creating a custom Leaflet control to add to the map
    useEffect(() => {
        const button = L.control({ position: 'topright' });

        button.onAdd = function() {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            div.innerHTML = '<button style="font-size: 14px; padding: 8px 12px; border-radius: 2px; background-color: white; border: 1px solid #ccc;">Current Location</button>';
            div.onclick = () => {
                map.setView(center, map.getZoom());
            };
            return div;
        };

        button.addTo(map);

        // Cleanup the button on component unmount
        return () => map.removeControl(button);
    }, [map, center]);

    return null;
}

function MapDisplay({ coords, stopData, setSelectedStop, selectedStop, selectedBus, selectedDirection, stopList }) {
    const [zoomLevel, setZoomLevel] = useState(getZoom()); // Initialize zoom level state
    const [visibleStops, setVisibleStops] = useState(stopData);

    const mapBounds = [
        [1.159029, 103.590436], // Southwest corner
        [1.501001, 104.102502], // Northeast corner
    ];
    const minZoom = 12;
    const maxZoom = 18;

    // Function to get minDistance based on zoom level
    const getMinDistance = (zoom) => {
        switch (zoom) {
            case 18:
                return 0.2;
            case 17:
                return 0.05;
            case 16:
                return 0.1;
            case 15:
                return 0.2;
            case 14:
                return 0.4;
            default:
                return 0.8;
        }
    };

    const handleMapClick = (e) => {
        let nearestStop = null;
        let minDistance = getMinDistance(zoomLevel);

        // Calculate the distance to each stop
        for (const [busStopCode, busStop] of Object.entries(stopData)) {
            const dist = getDistanceFromLatLonInKm(e.latlng.lat, e.latlng.lng, busStop.lat, busStop.lng);
            if (dist < minDistance) {
                minDistance = dist;
                nearestStop = busStopCode;
            }
        }

        // Select the nearest stop
        if (nearestStop) {
            setSelectedStop(nearestStop);
        }
    };

    // Update visible stops based on map bounds
    const updateVisibleStops = (map) => {
        const bounds = map.getBounds();
        const filteredStops = Object.entries(stopData).filter(([busStopCode, busStop]) => {
            const stopLatLng = L.latLng(busStop.lat, busStop.lng);
            return bounds.contains(stopLatLng); // Check if stop is within bounds
        });
        setVisibleStops(Object.fromEntries(filteredStops)); // Update state with visible stops
    };

    // Handle map events
    const MapEventHandler = () => {
        useMapEvents({
            click: handleMapClick,
            zoomend: (e) => {
                setZoomLevel(e.target.getZoom()); // Get the current zoom level
                updateVisibleStops(e.target);
            },
            moveend: (e) => {
                updateVisibleStops(e.target); // Update visible stops on move
            },
        });
        return null;
    };

    const getStopMarkerSize = (zoom) => {
        if (zoom < 13) return [1, 1];
        if (zoom === 13) return [2, 1];
        if (zoom === 14) return [4, 1];
        if (zoom === 15) return [6, 2];
        if (zoom >= 16) return [8, 2];
        return [6, 2];
    }

    function getStopMarkerColour(busStopCode) {
        if (selectedStop === busStopCode) {
            return ['lightgreen', 'green'];
        } else if (selectedBus !== '' && stopList.includes(busStopCode)) {
            return ['lightpink', 'red'];
        }
        return ['grey', 'white'];
    }

    function getCenter() {
        if (coords) {
            return [coords.latitude, coords.longitude];
        }
        return [1.3521, 103.8198];  // Default center
    }

    function getZoom() {
        if (coords) {
            return 16;
        }
        return 12;  // Default zoom level
    }

    return (
        <div className={`container mt-4 mb-4`} style={{ height: '80vh', width: '100%' }}>
            <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={getCenter()}
            zoom={getZoom()}
            zoomControl={false}
            maxBounds={mapBounds}
            maxBoundsViscosity={1.0}
            minZoom={minZoom}
            maxZoom={maxZoom}
            attributionControl={false}
            dragging={true}
            inertia={true}
            inertiaDeceleration={200}
            inertiaMaxSpeed={Infinity}
            zoomAnimation={true}
            zoomSnap={0.5}
            wheelDebounceTime={40}
            wheelPxPerZoomLevel={60}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                bounds={mapBounds} />

                <MapEventHandler />

                <RecenterButton center={getCenter()} />
                
                {coords && coords.latitude && coords.longitude && (
                    <CircleMarker 
                    center={[coords.latitude, coords.longitude]} 
                    radius={6} 
                    fillColor="black"
                    fillOpacity={0.8}
                    color="blue" 
                    opacity={0.2}
                    weight={20} />
                )}

                {/* Loop through the bus stop data and display a CircleMarker for each bus stop */}
                {stopData && Object.entries(visibleStops).map(([busStopCode, busStop]) => {
                    let [radius, weight] = getStopMarkerSize(zoomLevel);
                    const [fillColour, colour] = getStopMarkerColour(busStopCode);

                    return (
                    <CircleMarker
                        key={`${busStopCode}-${selectedStop}-${selectedBus}-${selectedDirection}`}  // Re-render the marker when the selected stop/bus changes
                        center={[busStop.lat, busStop.lng]}  // Use lat/lng from the data object
                        radius={radius}  // Adjust size for bus stops
                        fillColor={fillColour}  // Color for bus stop markers
                        color={colour}
                        fillOpacity={0.7}
                        weight={weight}
                    />
                )})}
            </MapContainer>
        </div>
    );
}

export default MapDisplay;
