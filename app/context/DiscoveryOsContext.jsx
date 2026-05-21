import {createContext, useContext, useEffect, useState} from 'react';

const DISCOVERY_OS_CONFIG_KEY = 'pa-discoveryos-config';
const DiscoveryOsContext = createContext(null);

export function DiscoveryOsProvider({children}) {
  const [widgetList, setWidgetList] = useState([]);

  const storeData = {
    "currency": "AUD",
  }

  if(typeof window !== 'undefined') {
    window.paDiscoveryOsApp = window.paDiscoveryOsApp || {};
    window.paDiscoveryOsApp.storeData = storeData;
  }

  const readWidgetListFromStorage = () => {
    if (typeof window === 'undefined') return [];
  
    try {
      const raw = localStorage.getItem(DISCOVERY_OS_CONFIG_KEY);
      if (!raw) return {};
  
      const config = JSON.parse(raw);
      if(!config?.widgetList) return {};

      const widgetMap = config.widgetList.reduce((acc, widget) => {
        acc[widget.widget_name] = widget.widget_id;
        return acc;
    }, {});

      return widgetMap;
    } catch {
      return {};
    }
  };

  useEffect(() => {
    setWidgetList(readWidgetListFromStorage());
  }, []);

  return (
    <DiscoveryOsContext.Provider value={{widgetList}}>
      <pa-context-provider>
        {children}
      </pa-context-provider>
    </DiscoveryOsContext.Provider>
  );
}

export function useDiscoveryOs() {
  const context = useContext(DiscoveryOsContext);
  if (!context) {
    throw new Error('useDiscoveryOs must be used within a DiscoveryOsProvider');
  }
  return context;
}