'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoutePlace } from '../services/api';

// Create custom numbered markers
const createNumberIcon = (num: number) => {
  return L.divIcon({
    html: `<div style="
      width: 28px;
      height: 28px;
      background-color: #4f46e5;
      border: 2px solid #ffffff;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 13px;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);
    ">${num}</div>`,
    className: 'custom-number-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const userPinIcon = L.divIcon({
    html: `<div style="
      width: 20px;
      height: 20px;
      background-color: #ef4444;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
    "></div>`,
    className: 'custom-user-pin',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

interface MapComponentProps {
  places: RoutePlace[];
  onLocationSelect?: (lat: number | null, lon: number | null) => void;
  selectedLat?: number | null;
  selectedLon?: number | null;
}

// Subcomponent to update map view bounds when places change
function ChangeView({ places, selectedLat, selectedLon }: { places: RoutePlace[], selectedLat?: number | null, selectedLon?: number | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (places.length > 0) {
      const points = places.map((rp) => L.latLng(rp.place.latitude, rp.place.longitude));
      const bounds = L.latLngBounds(points);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    } else if (selectedLat && selectedLon) {
      map.flyTo([selectedLat, selectedLon], 14, { duration: 1 });
    }
  }, [places, selectedLat, selectedLon, map]);
  
  return null;
}

function MapEvents({ onLocationSelect, selectedLat, selectedLon }: { onLocationSelect?: (lat: number | null, lon: number | null) => void, selectedLat?: number | null, selectedLon?: number | null }) {
  useMapEvents({
    contextmenu(e) {
      if (onLocationSelect) {
        if (selectedLat && selectedLon) {
          onLocationSelect(null, null);
        } else {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      }
    },
  });
  return null;
}

export default function MapComponent({ places, onLocationSelect, selectedLat, selectedLon }: MapComponentProps) {
  // Coordinates of center (default Istanbul)
  const defaultCenter: [number, number] = [41.0082, 28.9784];
  const defaultZoom = 12;

  const polylineCoords = places.map((rp) => [rp.place.latitude, rp.place.longitude] as [number, number]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onLocationSelect={onLocationSelect} selectedLat={selectedLat} selectedLon={selectedLon} />

        {selectedLat && selectedLon && (
           <Marker position={[selectedLat, selectedLon]} icon={userPinIcon}>
               <Popup>Seçilen Konum</Popup>
           </Marker>
        )}

        {places.map((rp, index) => (
          <Marker
            key={rp.id}
            position={[rp.place.latitude, rp.place.longitude]}
            icon={createNumberIcon(index + 1)}
          >
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <p className="font-bold text-sm border-b pb-1 mb-1">{rp.place.name}</p>
                <p className="text-xs text-slate-500 mb-1">Durak: #{index + 1}</p>
                <p className="text-xs text-slate-500">Varış: {rp.arrival_time}</p>
                <p className="text-xs text-slate-500">Ayrılış: {rp.departure_time}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#4f46e5"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        <ChangeView places={places} selectedLat={selectedLat} selectedLon={selectedLon} />
      </MapContainer>
    </div>
  );
}
