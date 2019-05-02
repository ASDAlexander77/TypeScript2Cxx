enum PromiseStates {
    Pending,
    Fulfilled,
    Rejected
}

class InternalPromise<T> {
    private _state = PromiseStates.Pending;
}
