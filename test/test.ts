type DeepImmutableObject<T> = { readonly [K in keyof T]: any };
