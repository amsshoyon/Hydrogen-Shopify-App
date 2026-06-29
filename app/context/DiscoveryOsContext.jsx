import {useEffect, useState} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {useMatches} from 'react-router';
import {BRIDGED_EVENTS, parseProductRefId} from 'pa-widget/hydrogen';

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

export function useProductPage() {
  const matches = useMatches();

  const productMatch = matches.find((m) => m.id.includes('products.$handle'));
  const product = productMatch?.data?.product ?? null;

  return {
    isProductPage: Boolean(productMatch),
    handle: productMatch?.params?.handle ?? null,
    product,
    refId: parseProductRefId(product?.id),
  };
}

export function DiscoveryOsProvider({children, currency = 'AUD'}) {
  const {refId} = useProductPage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CustomAnalytics />
      <pa-context-provider
        data-currency={currency}
        data-product-ref-id={refId ?? ''}
      />
      {children}
    </>
  );
}
