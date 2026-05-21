export function getPagePaginationState(request) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const cursorsStr = url.searchParams.get('cursors') || '';
  const cursors = cursorsStr ? cursorsStr.split(',').filter(Boolean) : [];
  return {page, cursors};
}

export function getPagePaginationVariables(request, {pageBy = 32} = {}) {
  const {page, cursors} = getPagePaginationState(request);

  if (page <= 1) {
    return {first: pageBy};
  }

  const afterCursor = cursors[page - 2];
  if (afterCursor) {
    return {first: pageBy, after: afterCursor};
  }

  return {first: pageBy};
}
