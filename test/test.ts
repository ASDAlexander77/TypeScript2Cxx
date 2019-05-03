export class ArrayTools {
    public static BuildArray<T>(size: number, itemBuilder: () => T): Array<T> {
        const a: T[] = [];
        for (let i = 0; i < size; ++i) {
            a.push(itemBuilder());
        }
        return a;
    }
}