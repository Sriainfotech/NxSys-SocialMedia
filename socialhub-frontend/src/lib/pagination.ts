import type { AxiosInstance } from 'axios';

interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

// Fetches every page of a DRF-paginated list endpoint and returns the
// flattened results. `next`/`previous` from the backend are absolute URLs
// (e.g. https://nxsocial.nxsys.in/api/posts/?page=2) — following them
// verbatim would bypass the dev proxy and issue a cross-origin request that
// carries no cookies. Instead we take just the query string from `next`
// and re-request it against the relative `endpoint`, keeping every request
// on axiosInstance's configured baseURL.
export async function fetchAllPages<T>(
  axiosInstance: AxiosInstance,
  endpoint: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const all: T[] = [];
  let query: string | undefined = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : '';

  while (query !== undefined) {
    const { data } = await axiosInstance.get<T[] | PaginatedResponse<T>>(`${endpoint}${query}`);

    if (Array.isArray(data)) {
      all.push(...data);
      query = undefined;
    } else {
      all.push(...(data.results || []));
      query = data.next ? new URL(data.next).search : undefined;
    }
  }

  return all;
}
