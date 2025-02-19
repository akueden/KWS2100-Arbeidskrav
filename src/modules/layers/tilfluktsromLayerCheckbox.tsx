import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Layer } from "ol/layer";
import React, { useEffect, useRef, useState } from "react";
import { Map, MapBrowserEvent, Overlay } from "ol";
import { FeatureLike } from "ol/Feature";

const source = new VectorSource({
  url: "/KWS2100-Arbeidskrav/geojson/tilfluktsrom.geojson",
  format: new GeoJSON(),
});
const tilfluktsromLayer = new VectorLayer({ source });
const overlay = new Overlay({
  positioning: "bottom-center",
});

export function TilfluktsromLayerCheckbox({
  setLayers,
  map,
}: {
  setLayers: (value: (prevState: Layer[]) => Layer[]) => void;
  map: Map;
}) {
  const [checked, setChecked] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [selectedTilfluktsrom, setSelectedTilfluktsrom] = useState<
    FeatureLike[]
  >([]);

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    setSelectedTilfluktsrom(map.getFeaturesAtPixel(e.pixel));
    overlay.setPosition(e.coordinate);
  }

  useEffect(() => {
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);
  }, []);

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, tilfluktsromLayer]);
      map.on("click", handleClick);
    } else {
      setLayers((old) => old.filter((l) => l !== tilfluktsromLayer));
    }
  }, [checked]);

  return (
    <button onClick={() => setChecked((b) => !b)}>
      <input type={"checkbox"} checked={checked} />
      Vis tilfluktsrom på kartet
      <div ref={overlayRef}>
        Klikkede tilfluktsrom:{" "}
        {selectedTilfluktsrom.map((s) => s.getProperties().navn).join(", ")}
      </div>
    </button>
  );
}
