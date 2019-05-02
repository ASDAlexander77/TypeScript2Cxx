interface ITest<T2>
{
    NameT: string | number | null;
}

class Test<T> implements ITest<T>
{
    public get NameT(): string | number | null {
        return null;
    }

    public set NameT(value: string | number | null) {
    }
}
