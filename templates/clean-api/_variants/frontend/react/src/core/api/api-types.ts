export type ApiResponse<T> = {
  status: number;
  message: string;
  results: T;
};

export type PaginationResponse<T> = {
  data: T[];
  paging?: {
    currentPage?: number | null;
    pageSize: number;
    totalPage: number;
    hasNextPage?: boolean | null;
    hasPreviousPage?: boolean | null;
    before?: string | null;
    after?: string | null;
  } | null;
};
