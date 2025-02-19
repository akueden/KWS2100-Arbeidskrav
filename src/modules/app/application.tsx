import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";
import { Layer } from "ol/layer";
import { TilfluktsromLayerCheckbox } from "../layers/tilfluktsromLayerCheckbox";

import "ol/ol.css";

useGeographic();

const view = new View({ center: [10.8, 59.9], zoom: 13 });

const map = new Map({
  view,
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState<Layer[]>([
    new TileLayer({ source: new OSM() }),
  ]);

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  useEffect(() => {
    map.setLayers(layers);
  }, [layers]);

  return (
    <>
      <nav>
        <TilfluktsromLayerCheckbox setLayers={setLayers} map={map} />
      </nav>
      <main>
        <div ref={mapRef} style={{ width: "100%", height: "100vh" }}></div>
      </main>
    </>
  );
}
