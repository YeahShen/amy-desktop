export type Flatten<T, Prefix extends string = ''> = UnionToIntersection<{
  [K in keyof T & string]: T[K] extends object
    ? Flatten<T[K], `${Prefix}${K}.`>
    : { [P in `${Prefix}${K}`]: T[K] };
}[keyof T & string]>;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;
