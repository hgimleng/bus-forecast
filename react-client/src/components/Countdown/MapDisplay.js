import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapDisplay({ coords, stopData, setSelectedStop, selectedStop }) {
    const [zoomLevel, setZoomLevel] = useState(getZoom()); // Initialize zoom level state

    // Update zoom level dynamically
    const MapZoomHandler = () => {
        useMapEvents({
            zoomend: (e) => {
                setZoomLevel(e.target.getZoom()); // Get the current zoom level
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
            console.log("Selected stop:", busStopCode);
            return ['red', 'red'];
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
            center={getCenter()} 
            zoom={getZoom()} style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                <MapZoomHandler />
                
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
                {stopData && Object.entries(stopData).map(([busStopCode, busStop]) => {
                    let [radius, weight] = getStopMarkerSize(zoomLevel);
                    const [fillColour, colour] = getStopMarkerColour(busStopCode);
                    
                    return (
                    <CircleMarker 
                        key={busStopCode}
                        center={[busStop.lat, busStop.lng]}  // Use lat/lng from the data object
                        radius={radius}  // Adjust size for bus stops
                        fillColor={fillColour}  // Color for bus stop markers
                        color={colour}
                        fillOpacity={0.7}
                        weight={weight}
                        eventHandlers={{
                            click: () => setSelectedStop(busStopCode) // Handle click event
                        }} />
                )})}
            </MapContainer>
        </div>
    );
};

export default MapDisplay;
