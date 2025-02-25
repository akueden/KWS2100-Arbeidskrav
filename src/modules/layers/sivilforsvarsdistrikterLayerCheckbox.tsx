import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Layer } from "ol/layer";
import { CheckboxButton } from "../widgets/checkboxButton";
import { Feature, Map, MapBrowserEvent } from "ol";

type TypedFeature<T> = { getProperties(): T } & Feature;

interface SivilforsvarsdistriktProperties {
  distriktnummer: number;
  distriktnavn: string;
  id: string;
  name: string;
}

const source = new VectorSource<TypedFeature<SivilforsvarsdistriktProperties>>({
  url: "/KWS2100-Arbeidskrav/geojson/sivilforsvarsdistrikter.geojson",
  format: new GeoJSON(),
});
const sivilforsvarsdistrikterLayer = new VectorLayer({ source });

export function SivilforsvarsdistrikterLayerCheckbox({
  setLayers,
  map,
}: {
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  map: Map;
}) {
  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    const distrikter = source
      .getFeaturesAtCoordinate(e.coordinate)
      .map((f) => f.getProperties());
    setSelectedFeatures(distrikter);
  }

  const [selectedFeatures, setSelectedFeatures] = useState<
    SivilforsvarsdistriktProperties[]
  >([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, sivilforsvarsdistrikterLayer]);
      map.on("click", handleClick);
    }
    return () => {
      map.un("click", handleClick);
      setLayers((old) => old.filter((l) => l !== sivilforsvarsdistrikterLayer));
    };
  }, [checked]);
  return (
    <CheckboxButton checked={checked} onClick={() => setChecked((s) => !s)}>
      Vis sivilforsvarsdistrikter på kart
    </CheckboxButton>
  );
}
