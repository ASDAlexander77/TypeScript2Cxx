declare namespace std {
    export function addressof(v): number;
}

const v = 10;
const pv = std.addressof(v);
