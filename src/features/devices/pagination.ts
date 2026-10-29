export const pageCount = (totalCount: number, pageSize: number): number =>
  Math.max(1, Math.ceil(totalCount / pageSize))
