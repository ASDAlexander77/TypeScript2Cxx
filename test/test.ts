class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = "";
stringNumeric.add = function (x: string, y: string) { return x + y; };

console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));