import React, { useRef, useEffect } from "react";
import "ol/ol.css";
import { Map as OlMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

import "./Map.css";

const Map = ({ center, zoom, style, className }) => {
  const mapRef = useRef();

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new OlMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([center.lng, center.lat]),
        zoom: zoom,
      }),
    });

    // Cleanup on unmount
    return () => {
      map.setTarget(null);
    };
  }, [center, zoom]);

  return (
    <div ref={mapRef} className={`map ${className || ""}`} style={style} />
  );
};

export default Map;
