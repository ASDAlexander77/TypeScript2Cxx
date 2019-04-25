type Primitive = undefined | null | boolean | string | number | Function;

export type Immutable<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<U>
  : /* T extends Map<infer K, infer V> ? ReadonlyMap<K, V> : // es2015+ only */
  DeepImmutable<T>;

export type DeepImmutable<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? DeepImmutableArray<U>
  : /* T extends Map<infer K, infer V> ? DeepImmutableMap<K, V> : // es2015+ only */
  DeepImmutableObject<T>;

interface DeepImmutableArray<T> extends ReadonlyArray<DeepImmutable<T>> { }
type DeepImmutableObject<T> = { readonly [K in keyof T]: DeepImmutable<T[K]> };
