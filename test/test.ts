class InternalPromise<T> {
    private _onFulfilled?: (fulfillment?: Nullable<T>) => Nullable<InternalPromise<T>> | T;
}
