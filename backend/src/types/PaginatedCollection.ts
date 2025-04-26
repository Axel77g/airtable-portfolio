export interface PaginatedCollection<T> {
  items: T[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
