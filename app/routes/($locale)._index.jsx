import {useLoaderData} from 'react-router';
import {useDiscoveryOs} from '~/context/DiscoveryOsContext';

export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

export default function Homepage() {
  const data = useLoaderData();
  const {widgetList} = useDiscoveryOs();

  return (
    <div className="home">
      <pa-recommendation data-widget-id={widgetList["Shopify Test Recommandation"]} />
      <pa-rich-media data-widget-id={widgetList["Shopify Rich Media Banner"]} />
    </div>
  );
}