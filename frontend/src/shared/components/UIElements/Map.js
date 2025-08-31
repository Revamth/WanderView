import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "./Map.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Map = ({ center, zoom, style, className, show }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // initialize map only once
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(leafletMapRef.current);

      L.marker([center.lat, center.lng]).addTo(leafletMapRef.current);
    }

    if (show && leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current.invalidateSize();
      }, 200);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [center, zoom, show]);

  return (
    <div ref={mapRef} className={`map ${className || ""}`} style={style} />
  );
};

export default Map;
