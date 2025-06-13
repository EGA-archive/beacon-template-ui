import { useEffect, useState } from "react";
import config from "../config/config.json";

export default function useFilteringTerms() {
  const [filteringTerms, setFilteringTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTerms = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${config.apiUrlNetwork}/filtering_terms`);
        const data = await response.json();
        setFilteringTerms(data.response?.filteringTerms || []);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching filtering terms:", err);
        setError("Failed to fetch filtering terms.");
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return { filteringTerms, loading, error };
}
