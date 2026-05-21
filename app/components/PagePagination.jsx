import {Link, useLocation} from 'react-router';

export function PagePagination({pageInfo, page, cursors}) {
  const {hasNextPage, hasPreviousPage, endCursor} = pageInfo;
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  searchParams.delete('page');
  searchParams.delete('cursors');
  const baseSearch = searchParams.toString();
  const separator = baseSearch ? '&' : '?';
  const baseUrl = `${location.pathname}${baseSearch ? `?${baseSearch}` : ''}`;

  const buildUrl = (targetPage, newCursors) => {
    const cursorsStr = newCursors.filter(Boolean).join(',');
    return `${baseUrl}${separator}page=${targetPage}${cursorsStr ? `&cursors=${encodeURIComponent(cursorsStr)}` : ''}`;
  };

  const getCursorsForTarget = (targetPage) => {
    const newCursors = [...cursors];
    if (targetPage > page && endCursor) {
      for (let i = page - 1; i < targetPage - 1; i++) {
        if (!newCursors[i]) newCursors[i] = endCursor;
      }
    }
    return newCursors;
  };

  const maxKnownPage = hasNextPage ? page + 1 : page;

  const visiblePages = [];
  if (maxKnownPage <= 7) {
    for (let i = 1; i <= maxKnownPage; i++) visiblePages.push(i);
  } else {
    visiblePages.push(1);
    const start = Math.max(2, page - 1);
    const end = Math.min(maxKnownPage, page + 1);
    if (start > 2) visiblePages.push('...');
    for (let i = start; i <= end; i++) visiblePages.push(i);
    if (end < maxKnownPage) visiblePages.push('...');
  }

  if (visiblePages.length <= 1 && !hasPreviousPage && !hasNextPage) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-8 pt-6 border-t border-border"
      aria-label="Pagination"
    >
      {hasPreviousPage && page > 1 ? (
        <Link
          to={buildUrl(page - 1, cursors)}
          className="px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-surface transition-colors"
        >
          &larr; Prev
        </Link>
      ) : (
        <span className="px-3 py-2 rounded-lg text-sm font-medium text-muted">
          &larr; Prev
        </span>
      )}

      {visiblePages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-muted">
            &hellip;
          </span>
        ) : p === page ? (
          <span
            key={p}
            className="min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium bg-primary text-white text-center"
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            to={buildUrl(p, getCursorsForTarget(p))}
            className="min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-surface transition-colors text-center"
          >
            {p}
          </Link>
        ),
      )}

      {hasNextPage ? (
        <Link
          to={buildUrl(page + 1, getCursorsForTarget(page + 1))}
          className="px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-surface transition-colors"
        >
          Next &rarr;
        </Link>
      ) : (
        <span className="px-3 py-2 rounded-lg text-sm font-medium text-muted">
          Next &rarr;
        </span>
      )}
    </nav>
  );
}
