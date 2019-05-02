interface ITest<T2>
{
    NameT: string | number | null;
}

class Test22<T> {

}

class Test<T> implements ITest<Test22<T>>
{
    public get NameT(): string | number | null {
        return null;
    }

    public set NameT(value: string | number | null) {
    }
}
