import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {urlWithTrackingParams} from '~/lib/search';
import {PagePagination} from '~/components/PagePagination';
import {ProductItem} from '~/components/ProductItem';

export function SearchResults({term, result, children}) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({term, articles}) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-primary mb-4">Articles</h2>
      <div className="space-y-3">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div key={article.id}>
              <Link
                prefetch="intent"
                to={articleUrl}
                className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsPages({term, pages}) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-primary mb-4">Pages</h2>
      <div className="space-y-3">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div key={page.id}>
              <Link
                prefetch="intent"
                to={pageUrl}
                className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsProducts({term, products, page, cursors}) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-primary mb-4">Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.nodes.map((product) => {
          return <ProductItem key={product.id} product={product} />;
        })}
      </div>
      <PagePagination
        pageInfo={products.pageInfo}
        page={page}
        cursors={cursors}
      />
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="text-sm text-muted text-center py-8">
      No results, try a different search.
    </p>
  );
}

/** @typedef {RegularSearchReturn['result']['items']} SearchItems */
/**
 * @typedef {Pick<
 *   SearchItems,
 *   ItemType
 * > &
 *   Pick<RegularSearchReturn, 'term'>} PartialSearchResult
 * @template {keyof SearchItems} ItemType
 */
/**
 * @typedef {RegularSearchReturn & {
 *   children: (args: SearchItems & {term: string}) => React.ReactNode;
 * }} SearchResultsProps
 */

/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
