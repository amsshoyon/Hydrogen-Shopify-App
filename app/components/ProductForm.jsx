import {Link, useNavigate} from 'react-router';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';

export function ProductForm({product, productOptions, selectedVariant}) {
  const navigate = useNavigate();
  const {open} = useAside();

  const selectedValues = selectedVariant?.selectedOptions?.reduce(
    (acc, opt) => ({...acc, [opt.name]: opt.value}),
    {},
  );

  return (
    <div className="space-y-5">
      {productOptions.map((option) => {
        return (
          <fieldset key={option.name} className="space-y-3">
            <legend className="text-xs font-bold uppercase tracking-wider text-muted">
              {option.name}: <span className="text-primary font-semibold normal-case tracking-normal">{selectedValues?.[option.name] || 'Select'}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  return (
                    <Link
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all border-2 ${
                        selected
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-border hover:border-primary text-primary hover:shadow-sm'
                      }`}
                      style={{opacity: available ? 1 : 0.3}}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all border-2 ${
                      selected
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : exists
                        ? 'border-border hover:border-primary text-primary hover:shadow-sm'
                        : 'border-border text-muted cursor-not-allowed'
                    }`}
                    key={option.name + name}
                    style={{opacity: available ? 1 : 0.3}}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div className="pt-4">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
          analytics={{
            product: {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price?.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          }}
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-label={name}
        className="inline-block w-4 h-4 rounded-full border border-border/50 shrink-0"
        style={{backgroundColor: color || 'transparent'}}
      >
        {!!image && <img src={image} alt={name} className="w-full h-full object-cover rounded-full" />}
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
