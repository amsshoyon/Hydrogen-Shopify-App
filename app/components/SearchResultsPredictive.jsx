import {Link, useFetcher} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import React, {useRef, useEffect} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
} from '~/lib/search';
import {useAside} from './Aside';

export function SearchResultsPredictive({children}) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur();
      inputRef.current.value = '';
    }
  }

  function closeSearch() {
    resetInput();
    aside.close();
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

function SearchResultsPredictiveArticles({term, articles, closeSearch}) {
  if (!articles.length) return null;

  return (
    <div key="articles" className="mb-5">
      <h5 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Articles</h5>
      <ul className="space-y-2">
        {articles.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
            trackingParams: article.trackingParameters,
            term: term.current ?? '',
          });

          return (
            <li key={article.id}>
              <Link
                onClick={closeSearch}
                to={articleUrl}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface transition-colors"
              >
                {article.image?.url && (
                  <Image
                    alt={article.image.altText ?? ''}
                    src={article.image.url}
                    width={40}
                    height={40}
                    className="rounded-md w-10 h-10 object-cover"
                  />
                )}
                <span className="text-sm font-medium text-primary">{article.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveCollections({term, collections, closeSearch}) {
  if (!collections.length) return null;

  return (
    <div key="collections" className="mb-5">
      <h5 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Collections</h5>
      <ul className="space-y-2">
        {collections.map((collection) => {
          const collectionUrl = urlWithTrackingParams({
            baseUrl: `/collections/${collection.handle}`,
            trackingParams: collection.trackingParameters,
            term: term.current,
          });

          return (
            <li key={collection.id}>
              <Link
                onClick={closeSearch}
                to={collectionUrl}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface transition-colors"
              >
                {collection.image?.url && (
                  <Image
                    alt={collection.image.altText ?? ''}
                    src={collection.image.url}
                    width={40}
                    height={40}
                    className="rounded-md w-10 h-10 object-cover"
                  />
                )}
                <span className="text-sm font-medium text-primary">{collection.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictivePages({term, pages, closeSearch}) {
  if (!pages.length) return null;

  return (
    <div key="pages" className="mb-5">
      <h5 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Pages</h5>
      <ul className="space-y-2">
        {pages.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term: term.current,
          });

          return (
            <li key={page.id}>
              <Link
                onClick={closeSearch}
                to={pageUrl}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface transition-colors"
              >
                <span className="text-sm font-medium text-primary">{page.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveProducts({term, products, closeSearch}) {
  if (!products.length) return null;

  return (
    <div key="products" className="mb-5">
      <h5 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Products</h5>
      <ul className="space-y-2">
        {products.map((product) => {
          const productUrl = urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`,
            trackingParams: product.trackingParameters,
            term: term.current,
          });

          const price = product?.selectedOrFirstAvailableVariant?.price;
          const image = product?.selectedOrFirstAvailableVariant?.image;
          return (
            <li key={product.id}>
              <Link
                to={productUrl}
                onClick={closeSearch}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface transition-colors"
              >
                {image && (
                  <Image
                    alt={image.altText ?? ''}
                    src={image.url}
                    width={40}
                    height={40}
                    className="rounded-md w-10 h-10 object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">{product.title}</p>
                  <small className="text-xs text-muted">
                    {price && <Money data={price} />}
                  </small>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveQueries({queries, queriesDatalistId}) {
  if (!queries.length) return null;

  return (
    <datalist id={queriesDatalistId}>
      {queries.map((suggestion) => {
        if (!suggestion) return null;
        return <option key={suggestion.text} value={suggestion.text} />;
      })}
    </datalist>
  );
}

function SearchResultsPredictiveEmpty({term}) {
  if (!term.current) {
    return null;
  }

  return (
    <p className="text-sm text-muted text-center py-6">
      No results found for &ldquo;{term.current}&rdquo;
    </p>
  );
}

function usePredictiveSearch() {
  const fetcher = useFetcher({key: 'search'});
  const term = useRef('');
  const inputRef = useRef(null);

  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '');
  }

  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]');
    }
  }, []);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}

/** @typedef {PredictiveSearchReturn['result']['items']} PredictiveSearchItems */
/**
 * @typedef {{
 *   term: React.MutableRefObject<string>;
 *   total: number;
 *   inputRef: React.MutableRefObject<HTMLInputElement | null>;
 *   items: PredictiveSearchItems;
 *   fetcher: Fetcher<PredictiveSearchReturn>;
 * }} UsePredictiveSearchReturn
 */
/**
 * @typedef {Pick<
 *   UsePredictiveSearchReturn,
 *   'term' | 'total' | 'inputRef' | 'items'
 * > & {
 *   state: Fetcher['state'];
 *   closeSearch: () => void;
 * }} SearchResultsPredictiveArgs
 */
/**
 * @typedef {Pick<PredictiveSearchItems, ItemType> &
 *   Pick<SearchResultsPredictiveArgs, ExtraProps>} PartialPredictiveSearchResult
 * @template {keyof PredictiveSearchItems} ItemType
 * @template {keyof SearchResultsPredictiveArgs} [ExtraProps='term' | 'closeSearch']
 */
/**
 * @typedef {{
 *   children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
 * }} SearchResultsPredictiveProps
 */

/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
