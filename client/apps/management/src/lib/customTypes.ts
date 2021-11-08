export interface ListResponseType<Type> {
  count: number;
  list: Array<Type>;
  limit: number;
}
