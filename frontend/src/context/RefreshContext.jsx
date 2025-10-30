import { createContext, useCallback, useContext, useState } from "react";

const RefreshContext = createContext({
  refreshKey: 0,
  triggerRefresh: () => {},
});

export const RefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Gọi hàm này ở bất kỳ đâu để báo cho toàn app biết cần reload
  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => {
      const next = k + 1;
      console.log("triggerRefresh -> new refreshKey:", next);
      return next;
    });
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
