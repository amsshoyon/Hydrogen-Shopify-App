import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {
  getPagePaginationState,
  getPagePaginationVariables,
} from '~/lib/pagination';
import {PagePagination} from '~/components/PagePagination';

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}) {
  const paginationState = getPagePaginationState(request);
  const paginationVariables = getPagePaginationVariables(request, {
    pageBy: 32,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
  ]);

  return {collections, ...paginationState};
}

function loadDeferredData({context}) {
  return {};
}

export default function Collections() {
  const {collections, page, cursors} = useLoaderData();

  return (
    <div className="py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-8">
        Collections
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {collections.nodes.map((collection, index) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            index={index}
          />
        ))}
      </div>
      <PagePagination pageInfo={collections.pageInfo} page={page} cursors={cursors} />
    </div>
  );
}

function CollectionItem({collection, index}) {
  return (
    <Link
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="group block border border-gray-200 rounded-xl p-4 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow duration-300"
    >
      {collection?.image && (
        <div className="aspect-square overflow-hidden rounded-xl bg-surface mb-3">
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <h5 className="text-lg font-medium text-primary group-hover:text-accent transition-colors">
        {collection.title}
      </h5>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('./+types/collections._index').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
