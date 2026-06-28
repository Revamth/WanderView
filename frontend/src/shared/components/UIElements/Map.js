/**
 * Map — renders a Leaflet map (OpenStreetMap tiles) with a single marker.
 *
 * Shows the location of a place given its center coordinates and zoom. Built on
 * the imperative Leaflet API (not react-leaflet), so the map instance is created
 * inside a useEffect and tracked in a ref. Commonly displayed inside a Modal,
 * which is why it has special handling for sizing when it becomes visible.
 */
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "./Map.css";

// Leaflet's default marker icon URLs break under most bundlers (webpack/CRA): it
// computes them relative to the JS bundle, so the images 404. The well-known fix is
// to delete the internal URL getter and re-point the icon options at the image
// files we imported above (which the bundler resolves to real, hashed URLs).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Map = ({ center, zoom, style, className, show }) => {
  const mapRef = useRef(null);        // the <div> Leaflet renders into
  const leafletMapRef = useRef(null); // the Leaflet map instance (persists across renders)

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize the map only once — guarding on the ref prevents Leaflet from
    // throwing "Map container is already initialized" on re-renders.
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

    // When the map becomes visible (e.g. inside a modal that just opened), the
    // container's size was 0 while hidden, so Leaflet renders grey/half tiles.
    // invalidateSize() forces it to re-measure; the 200ms delay waits for the
    // modal's open transition to finish so the final dimensions are correct.
    if (show && leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current.invalidateSize();
      }, 200);
    }

    // Tear down the Leaflet instance on unmount to free listeners/DOM and allow
    // a fresh init next time the component mounts.
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
