export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

export default function Homepage() {
  return (
    <div className="home">
      <pa-recommendation data-widget-name="Shopify Test Recommandation" />
      <pa-rich-media data-widget-name="Shopify Rich Media Banner" />
    </div>
  );
}
