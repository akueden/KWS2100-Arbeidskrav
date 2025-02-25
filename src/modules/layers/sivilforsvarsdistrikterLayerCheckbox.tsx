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
const overlay = new Overlay({
  autoPan: true,
  positioning: "bottom-center",
});

function SivilforsvarsdistriktOverlay({
  features,
}: {
  features: SivilforsvarsdistriktProperties[];
}) {
  if (features.length > 0) {
    return (
      <div>
        <h3>{features[0].distriktnavn}</h3>
        <p>
          <strong>Navn:</strong> {features[0].distriktnavn}
        </p>
      </div>
    );
  }
  return <div></div>;
}

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
    if (distrikter.length > 0) {
      overlay.setPosition(e.coordinate);
    } else {
      overlay.setPosition(undefined);
    }
    setSelectedFeatures(distrikter);
  }

  const [selectedFeatures, setSelectedFeatures] = useState<
    SivilforsvarsdistriktProperties[]
  >([]);
  const [checked, setChecked] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => overlay.setElement(overlayRef.current || undefined), []);

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, sivilforsvarsdistrikterLayer]);
      map.on("click", handleClick);
      map.addOverlay(overlay);
    }
    return () => {
      overlay.setPosition(undefined);
      map.removeOverlay(overlay);
      map.un("click", handleClick);
      setLayers((old) => old.filter((l) => l !== sivilforsvarsdistrikterLayer));
    };
  }, [checked]);
  return (
    <CheckboxButton checked={checked} onClick={() => setChecked((s) => !s)}>
      Vis sivilforsvarsdistriker på kart
      <div ref={overlayRef} className={"overlay"}>
        <SivilforsvarsdistriktOverlay features={selectedFeatures} />
      </div>
    </CheckboxButton>
  );
}
