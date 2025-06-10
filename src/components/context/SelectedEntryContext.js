import { createContext, useContext, useState } from "react";

const SelectedEntryContext = createContext();

export const SelectedEntryProvider = ({ children }) => {
  const [selectedPathSegment, setSelectedPathSegment] = useState(null);
  const [entryTypes, setEntryTypes] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState([]);
  const [extraFilter, setExtraFilter] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [resultData, setResultData] = useState([]);
  const [hasSearchResults, setHasSearchResult] = useState(false);

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
      }}
    >
      {children}
    </SelectedEntryContext.Provider>
  );
};

export const useSelectedEntry = () => useContext(SelectedEntryContext);
