type DeepImmutableObject<T> = { readonly [K in keyof T]: any };

class T {
   test(a: DeepImmutableObject< ArrayLike<number> >): void {

   }
}
