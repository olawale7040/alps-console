export interface GraphQLErrorBody {
  readonly message: string
  readonly path?: readonly (string | number)[]
}

export interface GraphQLResponseBody<TData> {
  readonly data?: TData | null
  readonly errors?: readonly GraphQLErrorBody[]
}

export interface QueryPayload<TData> {
  readonly data: TData | undefined
  readonly errors: string[]
}
