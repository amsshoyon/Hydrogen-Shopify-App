import {createContext, useContext, useEffect, useState} from 'react';
import {useAnalytics} from '@shopify/hydrogen';


const DISCOVERY_OS_CONFIG_KEY = 'pa-discoveryos-config';
const DiscoveryOsContext = createContext(null);

const BRIDGED_EVENTS = [
  'page_viewed',
  'product_viewed',
  'collection_viewed',
  'search_viewed',
  'cart_viewed',
  'cart_updated',
  'product_added_to_cart',
  'product_removed_from_cart',
];

export function CustomAnalytics() {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('PA_Pixel_Bridge');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.paPixelQueue = window.paPixelQueue || [];
    }

    BRIDGED_EVENTS.forEach((name) => {
      subscribe(name, (data) => {
        window.paPixelQueue?.push({name, data, ts: Date.now()});
      });
    });

    ready();
  }, []);

  return null;
}


export function DiscoveryOsProvider({children, currency='AUD'}) {
  const [widgetList, setWidgetList] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const storeData = {
    "currency": currency,
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

  if(!isClient) return null;
  return (
    <DiscoveryOsContext.Provider value={{widgetList}}>
      <CustomAnalytics />
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