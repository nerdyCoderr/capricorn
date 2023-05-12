function generatePaginationLinks(baseUrl, page, totalPages) {
  const url = new URL(baseUrl);
  const searchParams = url.searchParams;
  const hasPageParam = searchParams.has("page");

  if (!hasPageParam) {
    searchParams.append("page", page);
  }

  const first = page !== 1 ? new URL(url) : null;
  if (first) {
    first.searchParams.set("page", 1);
  }

  const last = page !== totalPages ? new URL(url) : null;
  if (last) {
    last.searchParams.set("page", totalPages);
  }

  const previous = page > 1 ? new URL(url) : null;
  if (previous) {
    previous.searchParams.set("page", page - 1);
  }

  const next = page < totalPages ? new URL(url) : null;
  if (next) {
    next.searchParams.set("page", page + 1);
    next.searchParams.get("page");
  }

  return {
    first: first ? first.toString() : null,
    last: last ? last.toString() : null,
    previous: previous ? previous.toString() : null,
    next: next ? next.toString() : null,
  };
}

module.exports = generatePaginationLinks;
