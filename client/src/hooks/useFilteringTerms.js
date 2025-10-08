import { useEffect, useState } from "react";
import config from "../config/config.json";

// Custom hook to fetch filtering terms from the Beacon API
export default function useFilteringTerms() {
  // Store the list of filtering terms
  const [filteringTerms, setFilteringTerms] = useState([]);

  // Manage loading state (true while fetching)
  const [loading, setLoading] = useState(false);

  // Store any fetch error message
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch the filtering terms
    const fetchTerms = async () => {
      setLoading(true); // Start loading spinner

      try {
        // Make the GET request to the filtering_terms endpoint
        // const response = await fetch(`${config.apiUrl}/filtering_terms`);
        const response = await fetch("/api.json");
        // Convert the response to JSON
        const data = await response.json();

        // Save the filtering terms or fallback to empty array if not present
        setFilteringTerms(data.response?.filteringTerms || []);

        // Clear any previous errors
        setError(null);
      } catch (err) {
        // If something goes wrong, log and store error
        console.error("❌ Error fetching filtering terms:", err);
        setError("Failed to fetch filtering terms.");
      } finally {
        // Hide the loading spinner
        setLoading(false);
      }
    };

    // Run the fetch function once when the component mounts
    fetchTerms();
  }, []);

  // Return the results so the component can use them
  return { filteringTerms, loading, error };
}
