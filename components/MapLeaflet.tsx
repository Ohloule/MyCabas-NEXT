"use client";

import "@/lib/fix-leaflet-icons";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type Market = {
  _id: string;
  name: string;
  address: string;
  zip: string;
  town: string;
  location: {
    lat: number;
    lng: number;
  };
};

export default function MapLeaflet({ markets }: { markets: Market[] }) {
  if (!markets || markets.length === 0) return null;

  const center: LatLngExpression = [
    markets[0].location.lat,
    markets[0].location.lng,
  ];

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {markets.map((market) => (
          <Marker
            key={market._id}
            position={[market.location.lat, market.location.lng]}
          >
            <Popup>
              <strong>{market.name}</strong>
              <br />
              {market.address}, {market.zip} {market.town}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
