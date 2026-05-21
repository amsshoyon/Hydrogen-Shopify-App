import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

export function PaginatedResourceSection({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <PreviousLink>
              {isLoading ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                  <span aria-hidden="true">&uarr;</span> Load previous
                </span>
              )}
            </PreviousLink>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}
            <NextLink>
              {isLoading ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                  Load more <span aria-hidden="true">&darr;</span>
                </span>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
