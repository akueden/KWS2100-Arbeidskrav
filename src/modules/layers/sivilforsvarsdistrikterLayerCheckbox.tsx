import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Layer } from "ol/layer";
import React, { useEffect, useRef, useState } from "react";
import { Map, MapBrowserEvent, Overlay } from "ol";
import { FeatureLike } from "ol/Feature";

const source = new VectorSource({
  url: "/KWS2100-Arbeidskrav/geojson/sivilforsvarsdistrikter.geojson",
  format: new GeoJSON(),
});
const sivilforsvarsdistrikterLayer = new VectorLayer({ source });
const overlay = new Overlay({
  positioning: "bottom-center",
});

export function SivilforsvarsdistrikterLayerCheckbox({
  setLayers,
  map,
}: {
  setLayers: (value: (prevState: Layer[]) => Layer[]) => void;
  map: Map;
}) {
  const [checked, setChecked] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [selectedSivilforsvarsdistrikter, setSelectedSivilforsvarsdistrikter] =
    useState<FeatureLike[]>([]);

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    setSelectedSivilforsvarsdistrikter(map.getFeaturesAtPixel(e.pixel));
    overlay.setPosition(e.coordinate);
  }

  useEffect(() => {
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);
  }, []);

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, sivilforsvarsdistrikterLayer]);
      map.on("click", handleClick);
    } else {
      setLayers((old) => old.filter((l) => l !== sivilforsvarsdistrikterLayer));
    }
  }, [checked]);

  return (
    <button onClick={() => setChecked((b) => !b)}>
      <input type={"checkbox"} checked={checked} />
      Vis sivilforsvarsdistrikter på kartet
      <div ref={overlayRef}>
        Klikkede sivilforsvarsdistrikter:{" "}
        {selectedSivilforsvarsdistrikter
          .map((s) => s.getProperties().navn)
          .join(", ")}
      </div>
    </button>
  );
}
