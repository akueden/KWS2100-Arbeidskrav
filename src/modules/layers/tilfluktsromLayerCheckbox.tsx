import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Layer } from "ol/layer";
import { CheckboxButton } from "../widgets/checkboxButton";
import { Feature, Map, MapBrowserEvent, Overlay } from "ol";

type TypedFeature<T> = { getProperties(): T } & Feature;

interface TilfluktsromProperties {
  adresse: string;
  plasser: number;
}

const source = new VectorSource<TypedFeature<TilfluktsromProperties>>({
  url: "/KWS2100-Arbeidskrav/geojson/tilfluktsrom.geojson",
  format: new GeoJSON(),
});

const tilfluktsromLayer = new VectorLayer({
  source,
});

const overlay = new Overlay({
  autoPan: true,
  positioning: "bottom-center",
});

function TilfluktsromOverlay({
  features,
}: {
  features: TilfluktsromProperties[];
}) {
  let className = "overlay";
  if (features.length === 1) {
    const plasser = features[0].plasser;
    if (plasser < 200) {
      className += " red";
    } else if (plasser < 500) {
      className += " orange";
    } else {
      className += " green";
    }
  }

  if (features.length >= 2) {
    return (
      <div className={className}>
        <h3>{features.length} tilfluktsrom</h3>
        <ul>
          {features.slice(0, 5).map(({ adresse, plasser }) => (
            <li key={adresse}>
              <strong>Adresse:</strong> {adresse} <br />
              <strong>Plasser:</strong> {plasser} <br />
            </li>
          ))}
          {features.length > 5 && <li>...</li>}
        </ul>
      </div>
    );
  } else if (features.length === 1) {
    return (
      <div className={className}>
        <h3>Tilfluktsrom</h3>
        <p>
          <strong>Adresse:</strong> {features[0].adresse}
        </p>
        <p>
          <strong>Plasser:</strong> {features[0].plasser}
        </p>
      </div>
    );
  }
  return <div className={className}></div>;
}

export function TilfluktsromLayerCheckbox({
  setLayers,
  map,
}: {
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  map: Map;
}) {
  const [selectedFeatures, setSelectedFeatures] = useState<
    TilfluktsromProperties[]
  >([]);
  const [checked, setChecked] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    const tilfluktsrom = map
      .getFeaturesAtPixel(e.pixel, {
        layerFilter: (l) => l === tilfluktsromLayer,
        hitTolerance: 5,
      })
      .map((f) => f.getProperties()) as TilfluktsromProperties[];

    if (tilfluktsrom.length > 0) {
      overlay.setPosition(e.coordinate);
    } else {
      overlay.setPosition(undefined);
    }
    setSelectedFeatures(tilfluktsrom);
  }

  useEffect(() => overlay.setElement(overlayRef.current || undefined), []);

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, tilfluktsromLayer]);
      map.on("click", handleClick);
      map.addOverlay(overlay);
    }
    return () => {
      overlay.setPosition(undefined);
      map.removeOverlay(overlay);
      map.un("click", handleClick);
      setLayers((old) => old.filter((l) => l !== tilfluktsromLayer));
    };
  }, [checked]);

  return (
    <CheckboxButton checked={checked} onClick={() => setChecked((s) => !s)}>
      Vis tilfluktsrom på kart
      <div ref={overlayRef} className={"overlay"}>
        <TilfluktsromOverlay features={selectedFeatures} />
      </div>
    </CheckboxButton>
  );
}
