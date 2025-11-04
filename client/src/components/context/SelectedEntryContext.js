import { createContext, useContext, useState, useRef, useEffect } from "react";

/**
 * SelectedEntryContext is a shared state used across the app
 * to manage values related to search, filters, results, and UI behavior.
 * It helps avoid prop drilling by storing and sharing these values globally.
 */

const SelectedEntryContext = createContext(); // Create a new context

// This component wraps part of the app that needs access to this shared state
export const SelectedEntryProvider = ({ children }) => {
  // Store the selected path segment
  const [selectedPathSegment, setSelectedPathSegment] = useState(null);

  // List of available entry types fetched from config or API
  const [entryTypes, setEntryTypes] = useState([]);

  // Filters currently selected by the user
  const [selectedFilter, setSelectedFilter] = useState([]);

  // Optional extra filter (e.g., numeric value with operator)
  const [extraFilter, setExtraFilter] = useState(null);

  // Shows whether data is currently being loaded
  const [loadingData, setLoadingData] = useState(false);

  // Stores the results returned from the query
  const [resultData, setResultData] = useState([]);

  // Flag to know if the user has performed a search
  const [hasSearchResults, setHasSearchResult] = useState(false);

  // Info about beacons used in the network
  const [beaconsInfo, setBeaconsInfo] = useState([]);

  // Configuration object for different entry types
  const [entryTypesConfig, setEntryTypesConfig] = useState({});

  // Message to show user feedback (error, warning, info)
  const [message, setMessage] = useState(null);

  // Tracks if the search has been triggered (even without results)
  const [hasSearchBeenTriggered, setHasSearchBeenTriggered] = useState(false);

  // Temporary storage for genomic builder inputs before submitting
  const [genomicDraft, setGenomicDraft] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);

  const [hasQueryStarted, setHasQueryStarted] = useState(false);

  const [queryDirty, setQueryDirty] = useState(false);

  const [lastSearchedFilters, setLastSearchedFilters] = useState([]);

  const [lastSearchedPathSegment, setLastSearchedPathSegment] = useState(null);

  const valueInputRef = useRef(null);
  const filteringTermsRef = useRef(null);
  const prevPathSegmentRef = useRef(null);

  // Provide all state variables and their updaters to children
  return (
    <SelectedEntryContext.Provider
      value={{
        selectedPathSegment,
        setSelectedPathSegment,
        entryTypes,
        setEntryTypes,
        selectedFilter,
        setSelectedFilter,
        extraFilter,
        setExtraFilter,
        loadingData,
        setLoadingData,
        resultData,
        setResultData,
        hasSearchResults,
        setHasSearchResult,
        beaconsInfo,
        setBeaconsInfo,
        entryTypesConfig,
        setEntryTypesConfig,
        message,
        setMessage,
        hasSearchBeenTriggered,
        setHasSearchBeenTriggered,
        genomicDraft,
        setGenomicDraft,
        isLoaded,
        setIsLoaded,
        valueInputRef,
        filteringTermsRef,
        hasQueryStarted,
        setHasQueryStarted,
        queryDirty,
        setQueryDirty,
        lastSearchedFilters,
        setLastSearchedFilters,
        lastSearchedPathSegment,
        setLastSearchedPathSegment,
        prevPathSegmentRef,
      }}
    >
      {children}
    </SelectedEntryContext.Provider>
  );
};

// This custom hook makes it easy to access the context from any component
export const useSelectedEntry = () => useContext(SelectedEntryContext);
