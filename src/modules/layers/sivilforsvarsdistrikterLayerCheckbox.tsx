import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Layer } from "ol/layer";
import { CheckboxButton } from "../widgets/checkboxButton";
import { Feature, Map, MapBrowserEvent } from "ol";
import { Style, Stroke, Fill } from "ol/style";

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

const defaultStyle = new Style({
  stroke: new Stroke({
    color: "rgba(0, 0, 255, 0.1)",
    width: 1,
  }),
  fill: new Fill({
    color: "rgba(0, 0, 255, 0.1)",
  }),
});

const hoverStyle = new Style({
  stroke: new Stroke({
    color: "rgba(0, 0, 255, 0.5)",
    width: 2,
  }),
  fill: new Fill({
    color: "rgba(0, 0, 255, 0.2)",
  }),
});

const sivilforsvarsdistrikterLayer = new VectorLayer({
  source,
  style: (feature) => (feature.get("hover") ? hoverStyle : defaultStyle),
});

export function SivilforsvarsdistrikterLayerCheckbox({
  setLayers,
  map,
}: {
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  map: Map;
}) {
  const [selectedFeatures, setSelectedFeatures] = useState<
    SivilforsvarsdistriktProperties[]
  >([]);
  const [checked, setChecked] = useState(false);

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    const distrikter = source
      .getFeaturesAtCoordinate(e.coordinate)
      .map((f) => f.getProperties());
    setSelectedFeatures(distrikter);
  }

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, sivilforsvarsdistrikterLayer]);
      map.on("click", handleClick);

      const handlePointerMove = (e: MapBrowserEvent<MouseEvent>) => {
        source.forEachFeature((feature) => {
          feature.set("hover", false, true);
        });

        const features = map.getFeaturesAtPixel(e.pixel) as Feature[];
        if (features.length > 0) {
          features.forEach((feature) => feature.set("hover", true, true));
        }

        sivilforsvarsdistrikterLayer.changed();
      };

      map.on("pointermove", handlePointerMove);

      return () => {
        map.un("click", handleClick);
        map.un("pointermove", handlePointerMove);
        setLayers((old) =>
          old.filter((l) => l !== sivilforsvarsdistrikterLayer),
        );
      };
    }
  }, [checked]);

  return (
    <CheckboxButton checked={checked} onClick={() => setChecked((s) => !s)}>
      Vis sivilforsvarsdistrikter på kart
    </CheckboxButton>
  );
}
