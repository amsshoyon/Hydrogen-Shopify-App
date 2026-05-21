import {Money} from '@shopify/hydrogen';

export function ProductPrice({price, compareAtPrice}) {
  return (
    <div aria-label="Price" className="product-price" role="group">
      {compareAtPrice ? (
        <div className="flex items-center gap-2">
          {price ? (
            <span className="text-lg font-semibold text-danger">
              <Money data={price} />
            </span>
          ) : null}
          <s className="text-sm text-muted line-through">
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <span className="text-lg font-semibold text-primary">
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
