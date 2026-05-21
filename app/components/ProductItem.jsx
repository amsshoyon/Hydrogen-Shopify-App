import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      className="group block"
    >
      {image && (
        <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 mb-3">
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-full object-fit transition-transform duration-500 scale-95 group-hover:scale-100"
          />
        </div>
      )}
      <h4 className="text-sm font-medium text-primary group-hover:text-accent transition-colors truncate">
        {product.title}
      </h4>
      <small className="text-sm text-muted mt-1 block">
        <Money data={product.priceRange?.minVariantPrice} />
      </small>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
