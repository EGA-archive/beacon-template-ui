import { useEffect, useState } from "react";
import config from "../config/config.json";

export default function useBeaconMetadata() {
  const [beacons, setBeacons] = useState([]);
  const [envMap, setEnvMap] = useState({});

  useEffect(() => {
    const fetchBeacons = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/`);
        const data = await res.json();

        const responses = data.responses || [];

        setBeacons(responses);

        const map = {};
        responses.forEach((b) => {
          const id = b?.response?.id;
          const env = b?.response?.environment;

          if (id) map[id] = env;
        });

        setEnvMap(map);
      } catch (err) {
        console.error("Error fetching beacon metadata:", err);
        setBeacons([]);
        setEnvMap({});
      }
    };

    fetchBeacons();
  }, []);

  return { beacons, envMap };
}
